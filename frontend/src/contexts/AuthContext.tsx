import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
  onAuthStateChanged,
  getAdditionalUserInfo,
  signOut,
  type User as FbUser,
  type UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { firebaseReady, requireAuth, requireDb, googleProvider, githubProvider } from '@/lib/firebase'
import { setSessionId, resetSessionId } from '@/lib/session'
import {
  mapProfile,
  type UserProfile,
  type UserLevel,
  type DefectClass,
  type SubmissionRecord,
} from '@/lib/profile'
import { getLeaderboard } from '@/api'

// Re-export the shared profile types so `@/contexts/AuthContext` keeps working
// as an import site for them (PracticeWorkspace, ConceptLearnPage, ResultsPage,
// ProfilePage all import from here).
export type { UserProfile, UserLevel, DefectClass, SubmissionRecord }

// Kept for compat: PromotionExamModal.tsx and ProfilePage.tsx import this.
export const LEVEL_TIERS: UserLevel[] = [
  'Student Beginner',
  'Student Intermediate',
  'Student Pro',
  'AI Engineer Beginner',
  'AI Engineer Intermediate',
  'AI Engineer Pro'
]

// Spec §5: streak comparison is against the user's LOCAL calendar date, not UTC.
const fmtLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const todayStr = () => fmtLocalDate(new Date())

// §5 schema — client-owned create fields only. Matches Task 8's Firestore rules
// exactly: no stats fields (backend-owned), no `updatedAt` on create.
function newUserDoc(u: FbUser, provider: string, name?: string) {
  const displayName = (name && name.trim()) || u.displayName || u.email?.split('@')[0] || 'Reviewer'
  return {
    uid: u.uid,
    email: u.email ?? '',
    displayName,
    photoURL: u.photoURL ?? null,
    provider,
    createdAt: serverTimestamp(),
    track: 'student',
    level: 'beginner',
    levelIndex: 0,
    streakDays: 0,
    lastActiveDate: todayStr(),
  }
}

async function ensureUserDoc(cred: UserCredential, provider: string, name?: string) {
  const ref = doc(requireDb(), 'users', cred.user.uid)
  const isNew = getAdditionalUserInfo(cred)?.isNewUser
  if (isNew) {
    await setDoc(ref, newUserDoc(cred.user, provider, name))
    return
  }
  const snap = await getDoc(ref)
  if (!snap.exists()) await setDoc(ref, newUserDoc(cred.user, provider, name))
}

async function patchMyDoc(uid: string, data: Record<string, unknown>) {
  if (!firebaseReady) return
  try {
    await updateDoc(doc(requireDb(), 'users', uid), { ...data, updatedAt: serverTimestamp() })
  } catch (e) {
    console.error('[auth] profile update failed', e)
  }
}

// Spec §5: bump the streak at most once per local-day rollover. Called only from
// the snapshot handler when the doc exists.
function maybeBumpStreak(uid: string, d: Record<string, unknown>) {
  const last = String(d.lastActiveDate ?? '')
  const today = todayStr()
  if (last === today) return
  const y = fmtLocalDate(new Date(Date.now() - 864e5))
  patchMyDoc(
    uid,
    last === y
      ? { streakDays: Number(d.streakDays ?? 0) + 1, lastActiveDate: today }
      : { streakDays: 1, lastActiveDate: today },
  )
}

function authErrorMessage(e: unknown): string {
  const code = (e as { code?: string }).code ?? ''
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found')
    return 'Email or password is incorrect.'
  if (code === 'auth/email-already-in-use') return 'That email is already registered.'
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.'
  if (code === 'auth/too-many-requests') return 'Too many attempts — try again shortly.'
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return ''
  if (code === 'auth/account-exists-with-different-credential')
    return 'An account with this email already exists via a different sign-in method.'
  if (code === 'auth/unauthorized-domain')
    return "This domain isn't authorised in Firebase (Authentication → Settings → Authorized domains)."
  return (e as Error).message || 'Something went wrong.'
}

// Spec §3.4: score-mutating writes are server-authoritative now. These stay as
// no-ops so existing callers compile; each logs once so a stray client write is
// visible in dev without spamming the console.
const noopWarned: Record<string, boolean> = {}
function noteNoop(key: string, msg: string) {
  if (noopWarned[key]) return
  noopWarned[key] = true
  console.debug(msg)
}
const noopMutators = {
  addSubmission: (..._a: unknown[]) =>
    noteNoop('addSubmission', 'addSubmission is server-authoritative; ignoring client write'),
  promoteUserLevel: () => {
    noteNoop('promoteUserLevel', 'promoteUserLevel is server-authoritative; ignoring client write')
    return false
  },
  updateWeakness: (..._a: unknown[]) =>
    noteNoop('updateWeakness', 'updateWeakness is server-authoritative; ignoring client write'),
}

interface Ctx {
  user: UserProfile | null
  firebaseUser: FbUser | null
  isAuthenticated: boolean
  authReady: boolean
  profileReady: boolean
  configured: boolean
  error: string | null
  pending: boolean
  signup: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (p: 'google' | 'github') => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  // kept-for-compat no-ops (backend is server-authoritative):
  addSubmission: (...a: unknown[]) => void
  promoteUserLevel: () => boolean
  updateWeakness: (...a: unknown[]) => void
}

const AuthContext = createContext<Ctx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFbUser] = useState<FbUser | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [authReady, setAuthReady] = useState(!firebaseReady)
  const [profileReady, setProfileReady] = useState(!firebaseReady)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const unsubDoc = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!firebaseReady) return
    let cancelled = false
    const unsub = onAuthStateChanged(requireAuth(), async (fb) => {
      unsubDoc.current?.()
      unsubDoc.current = null
      if (cancelled) return

      if (!fb) {
        setFbUser(null)
        setUser(null)
        setAuthReady(true)
        setProfileReady(true)
        return
      }

      setFbUser(fb)
      setAuthReady(true)
      setProfileReady(false)
      setSessionId('web-' + fb.uid)

      let rank: number | null = null
      try {
        const lb = await getLeaderboard({ session_id: 'web-' + fb.uid })
        rank = lb.you?.rank ?? null
      } catch {
        /* rank stays null */
      }
      if (cancelled) return

      unsubDoc.current = onSnapshot(
        doc(requireDb(), 'users', fb.uid),
        (snap) => {
          if (!snap.exists()) {
            // Spec §3.1: self-heal a doc-less signed-in user (redirect-fallback
            // sign-in, or any Auth user whose users/{uid} was never written).
            // The write triggers another snapshot that lands in the branch below.
            const provider = fb.providerData[0]?.providerId ?? 'password'
            setDoc(doc(requireDb(), 'users', fb.uid), newUserDoc(fb, provider)).catch((e) =>
              console.error('[auth] users/{uid} bootstrap failed', e))
            setUser(mapProfile(fb.uid, {}, rank))
            setProfileReady(true)
            return
          }
          const d = snap.data() as Record<string, unknown>
          setUser(mapProfile(fb.uid, d, rank))
          setProfileReady(true)
          maybeBumpStreak(fb.uid, d)
        },
        (err) => {
          console.error('[auth] profile listener', err)
          setUser(mapProfile(fb.uid, {}, rank))
          setProfileReady(true)
        },
      )
    })
    return () => {
      cancelled = true
      unsub()
      unsubDoc.current?.()
      unsubDoc.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wrap = useCallback(
    (fn: () => Promise<void>) => async () => {
      setPending(true)
      setError(null)
      try {
        await fn()
      } catch (e) {
        const m = authErrorMessage(e)
        if (m) setError(m)
        throw e
      } finally {
        setPending(false)
      }
    },
    [],
  )

  const signup = useCallback(
    (email: string, password: string, name: string) =>
      wrap(async () => {
        const cred = await createUserWithEmailAndPassword(requireAuth(), email, password)
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
        await setDoc(doc(requireDb(), 'users', cred.user.uid), newUserDoc(cred.user, 'password', name))
      })(),
    [wrap],
  )

  const login = useCallback(
    (email: string, password: string) =>
      wrap(async () => {
        await signInWithEmailAndPassword(requireAuth(), email, password)
      })(),
    [wrap],
  )

  const loginWithProvider = useCallback(
    (p: 'google' | 'github') =>
      wrap(async () => {
        const prov = p === 'google' ? googleProvider : githubProvider
        try {
          const cred = await signInWithPopup(requireAuth(), prov)
          await ensureUserDoc(cred, p)
        } catch (e) {
          const code = (e as { code?: string }).code
          if (code === 'auth/popup-blocked') {
            await signInWithRedirect(requireAuth(), prov)
            return
          }
          throw e
        }
      })(),
    [wrap],
  )

  const logout = useCallback(async () => {
    setPending(true)
    try {
      if (firebaseReady) await signOut(requireAuth())
    } finally {
      unsubDoc.current?.()
      unsubDoc.current = null
      resetSessionId()
      setPending(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  // Memo keys are the six state values below; the action fns are all stable
  // (useCallback), so `value` only changes when auth/profile state changes.
  const value = useMemo<Ctx>(
    () => ({
      user,
      firebaseUser,
      isAuthenticated: !!firebaseUser,
      authReady,
      profileReady,
      configured: firebaseReady,
      error,
      pending,
      signup,
      login,
      loginWithProvider,
      logout,
      clearError,
      ...noopMutators,
    }),
    [user, firebaseUser, authReady, profileReady, error, pending, signup, login, loginWithProvider, logout, clearError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
