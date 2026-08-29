import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  getAdditionalUserInfo,
  signOut,
  type User as FbUser,
  type UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { firebaseReady, requireAuth, requireDb, googleProvider, githubProvider } from '../lib/firebase'
import type { UserLevel, UserProfile, ComplexitySubmissionResult } from '../types'

export const LEVELS: UserLevel[] = [
  'Student Beginner',
  'Student Intermediate',
  'Student Pro',
  'AI Engineer Beginner',
  'AI Engineer Intermediate',
  'AI Engineer Pro',
]

export type TrackType = 'student' | 'pro'
export type LevelTier = 'Beginner' | 'Intermediate' | 'Pro'
export type SocialProvider = 'google' | 'github'

/* One-time cleanup of the pre-Firebase persisted store. */
try {
  localStorage.removeItem('codesight-auth-v4')
} catch {
  /* ignore */
}

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  )
}

/** Zeroed profile written to Firestore the first time a user signs up. */
function newUserDoc(u: FbUser, provider: string) {
  const displayName = u.displayName || u.email?.split('@')[0] || 'Reviewer'
  return {
    uid: u.uid,
    email: u.email ?? '',
    displayName,
    photoURL: u.photoURL ?? null,
    provider,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    selectedTrack: 'student' as TrackType,
    studentLevel: 'Beginner' as LevelTier,
    proLevel: 'Beginner' as LevelTier,
    hasPassedPromotionalTest: false,
    level: 'Student Beginner' as UserLevel,
    levelIndex: 1,
    totalXP: 0,
    eloRating: 1000,
    globalRank: 0,
    currentStreak: 0,
    problemsSolved: 0,
    weaknessCatchRates: {} as Record<string, number>,
    recentSubmissions: [] as ComplexitySubmissionResult[],
  }
}

/** Map a Firestore users/{uid} doc to the app's UserProfile shape. */
function toProfile(uid: string, d: Record<string, unknown>): UserProfile {
  const name = String(d.displayName || d.email || 'Reviewer')
  return {
    id: uid,
    name,
    email: String(d.email ?? ''),
    avatar: initialsOf(name),
    level: (d.level as UserLevel) ?? 'Student Beginner',
    levelIndex: Number(d.levelIndex ?? 1),
    totalXP: Number(d.totalXP ?? 0),
    globalRank: Number(d.globalRank ?? 0),
    currentStreak: Number(d.currentStreak ?? 0),
    problemsSolved: Number(d.problemsSolved ?? 0),
    eloRating: Number(d.eloRating ?? 1000),
    weaknessCatchRates: (d.weaknessCatchRates as Record<string, number>) ?? {},
    recentSubmissions: (d.recentSubmissions as ComplexitySubmissionResult[]) ?? [],
  }
}

/** Minimal profile from the Firebase user, used until the Firestore doc hydrates. */
function stubProfile(u: FbUser): UserProfile {
  const name = u.displayName || u.email?.split('@')[0] || 'Reviewer'
  return {
    id: u.uid,
    name,
    email: u.email ?? '',
    avatar: initialsOf(name),
    level: 'Student Beginner',
    levelIndex: 1,
    totalXP: 0,
    globalRank: 0,
    currentStreak: 0,
    problemsSolved: 0,
    eloRating: 1000,
    weaknessCatchRates: {},
    recentSubmissions: [],
  }
}

interface AuthState {
  isAuthenticated: boolean
  authReady: boolean
  user: UserProfile | null
  selectedTrack: TrackType
  studentLevel: LevelTier
  proLevel: LevelTier
  hasPassedPromotionalTest: boolean

  initAuthListener: () => void

  signUpEmail: (name: string, email: string, password: string) => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signInWithProvider: (provider: SocialProvider) => Promise<void>
  sendReset: (email: string) => Promise<void>
  logout: () => Promise<void>

  // profile edits — these fields are client-writable per the Firestore rules
  setRole: (role: unknown) => void
  setSelectedTrack: (track: TrackType) => void
  setStudentLevel: (level: LevelTier) => void
  setProLevel: (level: LevelTier) => void
  setPassedPromotionalTest: (passed: boolean) => void
  resetPromotionalQualification: () => void

  // score-mutating writes now happen on the backend; kept as no-ops so existing
  // callers compile. The Firestore snapshot listener reflects the server's write.
  promoteToNextLevel: () => { success: boolean; newLevel: UserLevel }
  recordSubmission: (result: ComplexitySubmissionResult) => void
  updateWeaknessCatchRate: (defectClassId: string, success: boolean) => void
}

let listenerStarted = false
let unsubDoc: (() => void) | null = null

async function ensureUserDoc(cred: UserCredential, provider: string) {
  const db = requireDb()
  const ref = doc(db, 'users', cred.user.uid)
  const isNew = getAdditionalUserInfo(cred)?.isNewUser
  if (isNew) {
    await setDoc(ref, newUserDoc(cred.user, provider))
  } else {
    const snap = await getDoc(ref)
    if (!snap.exists()) await setDoc(ref, newUserDoc(cred.user, provider))
  }
}

/** Patch the caller's own users/{uid} doc (client-writable fields only). */
async function patchMyDoc(uid: string | undefined, data: Record<string, unknown>) {
  if (!uid || !firebaseReady) return
  try {
    await updateDoc(doc(requireDb(), 'users', uid), { ...data, updatedAt: serverTimestamp() })
  } catch (e) {
    console.error('[auth] profile update failed', e)
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  authReady: !firebaseReady, // if Firebase is unconfigured we're "ready" (and signed out)
  user: null,
  selectedTrack: 'student',
  studentLevel: 'Beginner',
  proLevel: 'Beginner',
  hasPassedPromotionalTest: false,

  initAuthListener: () => {
    if (listenerStarted || !firebaseReady) return
    listenerStarted = true

    onAuthStateChanged(requireAuth(), (fbUser) => {
      unsubDoc?.()
      unsubDoc = null

      if (!fbUser) {
        set({ isAuthenticated: false, user: null, authReady: true })
        return
      }

      set({ isAuthenticated: true, user: stubProfile(fbUser), authReady: true })

      unsubDoc = onSnapshot(
        doc(requireDb(), 'users', fbUser.uid),
        (snap) => {
          if (!snap.exists()) return
          const d = snap.data() as Record<string, unknown>
          set({
            user: toProfile(fbUser.uid, d),
            selectedTrack: (d.selectedTrack as TrackType) ?? 'student',
            studentLevel: (d.studentLevel as LevelTier) ?? 'Beginner',
            proLevel: (d.proLevel as LevelTier) ?? 'Beginner',
            hasPassedPromotionalTest: Boolean(d.hasPassedPromotionalTest),
          })
        },
        (err) => console.error('[auth] profile listener error', err)
      )
    })
  },

  signUpEmail: async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(requireAuth(), email, password)
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
    await setDoc(doc(requireDb(), 'users', cred.user.uid), {
      ...newUserDoc(cred.user, 'password'),
      displayName: name.trim() || cred.user.email?.split('@')[0] || 'Reviewer',
    })
  },

  signInEmail: async (email, password) => {
    await signInWithEmailAndPassword(requireAuth(), email, password)
  },

  signInWithProvider: async (provider) => {
    const p = provider === 'google' ? googleProvider : githubProvider
    try {
      const cred = await signInWithPopup(requireAuth(), p)
      await ensureUserDoc(cred, provider)
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(requireAuth(), p)
        return
      }
      throw e
    }
  },

  sendReset: async (email) => {
    await sendPasswordResetEmail(requireAuth(), email)
  },

  logout: async () => {
    if (firebaseReady) await signOut(requireAuth())
    unsubDoc?.()
    unsubDoc = null
    set({ isAuthenticated: false, user: null })
  },

  setRole: (role) => {
    if (role === 'student' || role === 'pro' || role === 'professional') {
      const track: TrackType = role === 'student' ? 'student' : 'pro'
      set({ selectedTrack: track })
      patchMyDoc(get().user?.id, { selectedTrack: track })
    }
  },

  setSelectedTrack: (track) => {
    set({ selectedTrack: track })
    patchMyDoc(get().user?.id, { selectedTrack: track })
  },

  setStudentLevel: (level) => {
    set({ studentLevel: level })
    patchMyDoc(get().user?.id, { studentLevel: level })
  },

  setProLevel: (level) => {
    set({ proLevel: level })
    patchMyDoc(get().user?.id, { proLevel: level })
  },

  setPassedPromotionalTest: (passed) => {
    set({ hasPassedPromotionalTest: passed })
    patchMyDoc(get().user?.id, { hasPassedPromotionalTest: passed })
  },

  resetPromotionalQualification: () => {
    set({ hasPassedPromotionalTest: false })
    patchMyDoc(get().user?.id, { hasPassedPromotionalTest: false })
  },

  // --- server-authoritative now; no-ops on the client ---
  promoteToNextLevel: () => {
    const { user } = get()
    const idx = Math.min((user?.levelIndex ?? 1) + 1, LEVELS.length)
    return { success: true, newLevel: LEVELS[idx - 1] }
  },
  recordSubmission: () => {},
  updateWeaknessCatchRate: () => {},
}))
