# Frontend Integration A — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the replacement frontend a working data layer — a typed API client for the FastAPI backend plus a real Firebase auth context and route-gating — so sub-projects B–E can wire feature pages to live data.

**Architecture:** Port the previous frontend's proven `src/api/` + `src/lib/` (from git rev `fe201c9`) near-verbatim, stripping their offline-mock branches. Rewrite `src/contexts/AuthContext.tsx` on real `firebase/auth` + a Firestore `users/{uid}` snapshot, keeping the `useAuth()` surface the pages already consume. Derive the backend `session_id` from the Firebase uid. Add a `wouter` `ProtectedRoute` and wire the existing auth UI.

**Tech Stack:** React 19 + Vite 6 + TypeScript (`strict:false`), `wouter` routing, React Context for state, `firebase@^12.18.0`, `@/` import alias, sonner for toasts. No frontend test runner.

**Spec:** `docs/superpowers/specs/2026-08-31-fe-integration-A-foundation-design.md`

## Global Constraints

- **Branch:** `feat/fe-integration-a` (off `adb1697`; spec already committed at `62032d6`).
- **Port source:** git rev `fe201c9`. Retrieve any file with `git show fe201c9:<path>` (run from repo root). The retrieved file is the source of truth for that port; adapt only what each task says.
- **Strip offline mocks:** the ported `api/` modules have an `if (USE_MOCK) { … return <fixture> }` branch that imports from `../mock/*`. The new frontend has no `src/mock/`. Delete that branch and the `delay`/`getExerciseById`/`mockExercises` imports; keep only the live `return api.get/post(...)` path. `client.ts` keeps `USE_MOCK` and `delay` exports (other code may reference them) but nothing in A relies on `USE_MOCK` being true.
- **Import alias:** all intra-`src` imports use `@/…` (e.g. `@/lib/firebase`), matching the rest of the new frontend. The `fe201c9` files use relative paths (`../lib/firebase`) — convert them.
- **State pattern:** React Context + hooks. Do **not** introduce zustand (the `fe201c9` `authStore.ts` is a zustand store — port its *logic* into a Context, not the store).
- **`useAuth()` compatibility:** every member the current `src/contexts/AuthContext.tsx` exposes must still exist after the rewrite (see spec §3). `login`'s signature changes from `login(name: string)` to `login(email: string, password: string)` — the full-frontend `tsc` sweep (Task 9) fixes every caller.
- **No backend changes.** `firestore.rules` (repo root) IS edited here; re-publishing it in the Firebase console is a human step (Task 8 note).
- **Do not** replace `wouter`, restructure the shader/three.js code, or do any visual redesign. A is data-layer + auth only: it touches `src/api/*`, `src/lib/*`, `src/contexts/AuthContext.tsx`, `src/lib/profile.ts` (new), `src/components/auth/*` (new), `src/components/AuthModal.tsx`, `src/pages/AuthLandingPage.tsx`, `src/App.tsx`, `firestore.rules`.
- **Verification (every task that changes `.ts/.tsx`):** `npx tsc --noEmit` from `frontend/` must be clean before commit. The final tasks add `npx vite build` and a browser walkthrough.
- **`.env.local`** (gitignored, already present in `frontend/`) has `VITE_API_BASE_URL` (Railway) + all six `VITE_FIREBASE_*` — so `USE_MOCK` is false and `firebaseReady` is true locally. Do not commit `.env.local`.
- **Commits:** prefix every git command with `git -c gc.auto=0`. End every commit message with:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
  ```

---

## File Structure

**New:**
- `frontend/src/lib/firebase.ts`, `authToken.ts`, `session.ts` — ported.
- `frontend/src/api/` — `client.ts`, `types.ts`, `exercises.ts`, `grade.ts`, `aiReview.ts`, `profile.ts` (profile + progress + skill-card), `session.ts`, `leaderboard.ts`, `integrity.ts`, `topics.ts`, `concepts.ts`, `admin.ts`, `index.ts` — ported (mock branches stripped).
- `frontend/src/lib/profile.ts` — `mapProfile`, `CLASS_LABEL`, `userLevelOf`.
- `frontend/src/components/auth/ProtectedRoute.tsx`, `FirebaseNotConfigured.tsx`.

**Rewritten:**
- `frontend/src/contexts/AuthContext.tsx`.

**Edited:**
- `frontend/src/components/AuthModal.tsx`, `frontend/src/pages/AuthLandingPage.tsx`, `frontend/src/App.tsx`, `firestore.rules`.

---

## Task 1: Port `src/lib/` (firebase, authToken, session)

**Files:**
- Create: `frontend/src/lib/firebase.ts`, `frontend/src/lib/authToken.ts`, `frontend/src/lib/session.ts`

**Interfaces:**
- Produces: `firebaseReady: boolean`, `requireAuth(): Auth`, `requireDb(): Firestore`, `googleProvider`, `githubProvider` (from `firebase.ts`); `getIdToken(): Promise<string|null>` (from `authToken.ts`); `getSessionId(): string`, `resetSessionId(): string`, **new** `setSessionId(id: string): void` (from `session.ts`).

- [ ] **Step 1: Port `firebase.ts` verbatim**

`git show fe201c9:frontend/src/lib/firebase.ts` → write to `frontend/src/lib/firebase.ts` unchanged (it already uses no intra-src imports; only `firebase/app`, `firebase/auth`, `firebase/firestore`).

- [ ] **Step 2: Port `authToken.ts`, converting the import to the alias**

`git show fe201c9:frontend/src/lib/authToken.ts` → write to `frontend/src/lib/authToken.ts`, changing `from './firebase'` to `from '@/lib/firebase'`.

- [ ] **Step 3: Port `session.ts` and add the override**

`git show fe201c9:frontend/src/lib/session.ts` → write to `frontend/src/lib/session.ts`. Then add an in-memory override so a signed-in user's uid-derived id wins:

```ts
let override: string | null = null

export function setSessionId(id: string): void {
  override = id || null
}
```

In `getSessionId()`, add `if (override) return override` as the first line. In `resetSessionId()`, add `override = null` as the first line.

- [ ] **Step 4: Type-check**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: clean (these three files have no consumers yet).

- [ ] **Step 5: Commit**

```bash
git -c gc.auto=0 add frontend/src/lib/firebase.ts frontend/src/lib/authToken.ts frontend/src/lib/session.ts
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(fe-a): port Firebase + session + auth-token lib layer

Ported from rev fe201c9. session.ts gains setSessionId() so a signed-in
user's uid-derived id overrides the anonymous localStorage id.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 2: Port `src/api/` (client + types + all domain modules)

**Files:**
- Create: `frontend/src/api/client.ts`, `types.ts`, `exercises.ts`, `grade.ts`, `aiReview.ts`, `profile.ts`, `session.ts`, `leaderboard.ts`, `integrity.ts`, `topics.ts`, `concepts.ts`, `admin.ts`, `index.ts`

**Interfaces:**
- Consumes: `@/lib/authToken` `getIdToken`, `@/lib/session` `getSessionId` (from Task 1).
- Produces the `@/api` surface: `api`, `USE_MOCK`, `ApiError`, `delay`; all `types.ts` exports; `listExerciseSummaries`, `getExerciseFile`, `getHint`, `reportExercise`, `submitGrade`, `getAiReview`, `getProfile`, `getProgress`, `getSkillCard`, `getSession`, `getPromotionTest`, `evaluatePromotion`, `getLeaderboard`, `getSessionIntegrity`, `listTopics`, `getTopic`, `predictTopic`, `getConcepts`, `getConcept`, `getMicroCheck`, `submitMicroCheck`, and the `adminLogin`/`adminStats`/`adminListExercises`/`adminGetExercise`/`adminCreateExercise`/`adminUpdateExercise`/`adminDeleteExercise`/`adminSetReview` + `ADMIN_OFFLINE` + `AdminExerciseQuery` set.

- [ ] **Step 1: Port `client.ts` verbatim**

`git show fe201c9:frontend/src/api/client.ts` → `frontend/src/api/client.ts`, changing `from '../lib/authToken'` to `from '@/lib/authToken'`. No other change.

- [ ] **Step 2: Port `types.ts` and reconcile against CONTRACT.md**

`git show fe201c9:frontend/src/api/types.ts` → `frontend/src/api/types.ts`. Then open `CONTRACT.md` (repo root) and confirm each response type matches. Known-good from this session: the `/exercises` **envelope** (`ExerciseList` / `{ items, total, limit, offset }`) — verify `listExerciseSummaries`' return type in `types.ts` is the envelope, not a bare array. Fix any drift you find; note each fix in the report.

- [ ] **Step 3: Port each domain module, stripping the mock branch**

For each of `exercises.ts`, `grade.ts`, `aiReview.ts`, `profile.ts`, `session.ts`, `leaderboard.ts`, `integrity.ts`, `topics.ts`, `concepts.ts`, `admin.ts`:

1. `git show fe201c9:frontend/src/api/<name>.ts` to retrieve it.
2. Convert intra-src imports to `@/…` (`./client` stays `./client`; `../lib/session` → `@/lib/session`; `../mock/*` and `../types` imports for the mock branch are deleted).
3. Delete the `if (USE_MOCK) { … }` block and any now-unused imports (`delay`, `getExerciseById`, `mockExercises`, `../mock/exercises`, `../types`). Keep only the `return api.get/post(...)` path and its `import type { … } from './types'`.
4. Write to `frontend/src/api/<name>.ts`.

Reference — `grade.ts` after stripping is:
```ts
import { api } from './client'
import { getSessionId } from '@/lib/session'
import type { GradeRequest, GradeResponse, GradeTelemetry } from './types'

export async function submitGrade(input: {
  exerciseId: string
  selectedLines: number[]
  explanation: string
  hintsUsed?: number
  telemetry?: GradeTelemetry
  sessionId?: string
}): Promise<GradeResponse> {
  const body: GradeRequest = {
    session_id: input.sessionId ?? getSessionId(),
    exercise_id: input.exerciseId,
    selected_lines: input.selectedLines,
    explanation: input.explanation,
    hints_used: input.hintsUsed ?? 0,
    telemetry: input.telemetry,
  }
  return api.post<GradeResponse>('/grade', body)
}
```

`fe201c9`'s `profile.ts` exports `getProfile`, `getProgress`, `getSkillCard` (against `/profile/{id}`, `/progress/{id}`, `/profile/{id}/card`). If any of those live in a different `fe201c9` file, still land all three in `frontend/src/api/profile.ts`.

- [ ] **Step 4: Port `index.ts`, dropping the removed `../lib/session` re-export line only if broken**

`git show fe201c9:frontend/src/api/index.ts` → `frontend/src/api/index.ts`. Change `from '../lib/session'` to `from '@/lib/session'`. Keep every re-export; they must all resolve against the modules from Step 3.

- [ ] **Step 5: Type-check the api layer in isolation**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: clean. (No app code imports `@/api` yet.) If `types.ts` reconciliation in Step 2 changed a shape, fix the domain module that returns it.

- [ ] **Step 6: Commit**

```bash
git -c gc.auto=0 add frontend/src/api/
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(fe-a): port the typed API client (mock branches removed)

Ported from rev fe201c9: client + types + exercises/grade/aiReview/
profile/session/leaderboard/integrity/topics/concepts/admin + index.
Offline USE_MOCK fixtures dropped — the new frontend always has a
backend URL. types.ts reconciled against CONTRACT.md (paginated
/exercises envelope confirmed).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 3: `src/lib/profile.ts` — Firestore doc → `UserProfile` mapping

**Files:**
- Create: `frontend/src/lib/profile.ts`

**Interfaces:**
- Consumes: the `UserProfile`, `SubmissionRecord`, `DefectClass` types currently declared in `src/contexts/AuthContext.tsx` — **move those type declarations into `src/lib/profile.ts`** and have `AuthContext.tsx` re-export them (Task 4 imports from here). This avoids a circular import.
- Produces: `mapProfile(uid: string, doc: Record<string, unknown>, rank: number | null): UserProfile`; `CLASS_LABEL: Record<BackendClass, DefectClass>` and its inverse `LABEL_CLASS`; `userLevelOf(track: string, level: string): UserLevel`; `initialsOf(name: string): string`.

- [ ] **Step 1: Write the module**

```ts
// frontend/src/lib/profile.ts
export type UserLevel =
  | 'Student Beginner' | 'Student Intermediate' | 'Student Pro'
  | 'AI Engineer Beginner' | 'AI Engineer Intermediate' | 'AI Engineer Pro'

export type DefectClass =
  | 'SQL Injection' | 'Unchecked Returns' | 'Race Conditions'
  | 'Infinite Loops' | 'Resource Leaks' | 'Type Mismatches'

export interface SubmissionRecord {
  id: string
  problemId: string
  title: string
  score: number
  date: string
  mode: 'student' | 'engineer'
  userTimeComplexity: string
  userSpaceComplexity: string
  optimalTimeComplexity: string
  optimalSpaceComplexity: string
  feedback: string
  defectClass: DefectClass
}

export interface UserProfile {
  name: string
  handle: string
  avatar: string
  level: UserLevel
  levelIndex: number
  xp: number
  globalRank: number
  streakDays: number
  solvedCount: number
  history: SubmissionRecord[]
  defectStats: Record<DefectClass, { successful: number; total: number }>
}

type BackendClass =
  | 'injection' | 'auth' | 'error-handling'
  | 'concurrency' | 'logic' | 'resource' | 'clean'

export const CLASS_LABEL: Record<BackendClass, DefectClass> = {
  injection: 'SQL Injection',
  auth: 'Unchecked Returns',            // best-fit label; the frontend's 6 labels
  'error-handling': 'Unchecked Returns',
  concurrency: 'Race Conditions',
  logic: 'Type Mismatches',
  resource: 'Resource Leaks',
  clean: 'Type Mismatches',
}
// NOTE: the frontend has 6 cosmetic labels, the backend 6 real classes + clean.
// The mapping above is lossy by design (auth+error-handling → same label). B/C
// may replace the frontend labels with the real taxonomy; for A this keeps
// defectStats renderable. Document this in the report.

export const DEFECT_CLASSES: DefectClass[] = [
  'SQL Injection', 'Unchecked Returns', 'Race Conditions',
  'Infinite Loops', 'Resource Leaks', 'Type Mismatches',
]

export function initialsOf(name: string): string {
  return name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
}

export function userLevelOf(track: string, level: string): UserLevel {
  const t = track === 'engineer' ? 'AI Engineer' : 'Student'
  const l = level === 'pro' ? 'Pro' : level === 'intermediate' ? 'Intermediate' : 'Beginner'
  return `${t} ${l}` as UserLevel
}

export function mapProfile(
  uid: string,
  doc: Record<string, unknown>,
  rank: number | null,
): UserProfile {
  const name = String(doc.displayName || doc.email || 'Reviewer')
  const subs = (doc.recentSubmissions as Array<Record<string, unknown>> | undefined) ?? []
  const rates = (doc.weaknessCatchRates as Record<string, number> | undefined) ?? {}

  const history: SubmissionRecord[] = subs.map((s, i) => ({
    id: `sub-${i}`,
    problemId: String(s.exerciseId ?? ''),
    title: String(s.exerciseId ?? 'Exercise'),
    score: Math.round(Number(s.scoreAfterHints ?? 0) * 100),
    date: String(s.timestamp ?? '').slice(0, 10),
    mode: 'engineer',
    userTimeComplexity: '—',
    userSpaceComplexity: '—',
    optimalTimeComplexity: '—',
    optimalSpaceComplexity: '—',
    feedback: `Localisation ${Math.round(Number(s.localisationScore ?? 0) * 100)}%, explanation ${Math.round(Number(s.explanationScore ?? 0) * 100)}%.`,
    defectClass: CLASS_LABEL[(s.defectClass as BackendClass) ?? 'logic'] ?? 'Type Mismatches',
  }))

  const perClassTotal: Record<string, number> = {}
  for (const s of subs) {
    const label = CLASS_LABEL[(s.defectClass as BackendClass) ?? 'logic'] ?? 'Type Mismatches'
    perClassTotal[label] = (perClassTotal[label] ?? 0) + 1
  }
  const defectStats = Object.fromEntries(
    DEFECT_CLASSES.map(label => {
      const total = perClassTotal[label] ?? 0
      // rates are keyed by BACKEND class; find any backend class that maps to this label
      const backendKeys = (Object.keys(CLASS_LABEL) as BackendClass[]).filter(k => CLASS_LABEL[k] === label)
      const rate = backendKeys.reduce((acc, k) => rates[k] != null ? Math.max(acc, rates[k]) : acc, 0)
      return [label, { successful: Math.round((rate / 100) * total), total }]
    }),
  ) as Record<DefectClass, { successful: number; total: number }>

  return {
    name,
    handle: '@' + name.toLowerCase().replace(/\s+/g, ''),
    avatar: String(doc.photoURL ?? ''),
    level: userLevelOf(String(doc.track ?? 'student'), String(doc.level ?? 'beginner')),
    levelIndex: Number(doc.levelIndex ?? 0),
    xp: Number(doc.totalXP ?? 0),
    globalRank: rank ?? 0,
    streakDays: Number(doc.streakDays ?? 0),
    solvedCount: Number(doc.problemsSolved ?? 0),
    history,
    defectStats,
  }
}
```

- [ ] **Step 2: Update `AuthContext.tsx`'s type source (interim)**

In the current `src/contexts/AuthContext.tsx`, delete the local `UserLevel` / `DefectClass` / `SubmissionRecord` / `UserProfile` / `LEVEL_TIERS` declarations and add `export { … } from '@/lib/profile'` for the four types (keep the file compiling — this is a stepping stone; Task 4 rewrites the whole file). If `LEVEL_TIERS` is referenced by other files, keep a `export const LEVEL_TIERS` re-derived from `profile.ts`'s types, or leave it until Task 9's sweep.

- [ ] **Step 3: Type-check**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: clean, or only errors in files that imported the moved types with the old path — fix those imports to `@/lib/profile` or `@/contexts/AuthContext` (both work).

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add frontend/src/lib/profile.ts frontend/src/contexts/AuthContext.tsx
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(fe-a): profile mapping layer (Firestore doc -> UserProfile)

mapProfile + CLASS_LABEL + userLevelOf + initialsOf. UserProfile /
SubmissionRecord / DefectClass / UserLevel types move here; AuthContext
re-exports them. The 6-label frontend taxonomy vs 6-class backend
taxonomy mapping is lossy by design (documented in the module).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 4: Rewrite `AuthContext.tsx` on real Firebase

**Files:**
- Rewrite: `frontend/src/contexts/AuthContext.tsx`
- Reference: `git show fe201c9:frontend/src/store/authStore.ts` (the zustand original — port its logic into a Context)

**Interfaces:**
- Consumes: `@/lib/firebase` (`firebaseReady`, `requireAuth`, `requireDb`, `googleProvider`, `githubProvider`), `@/lib/session` (`setSessionId`, `resetSessionId`, `getSessionId`), `@/lib/profile` (`mapProfile`, `UserProfile`, `UserLevel`), `@/api` (`getLeaderboard`).
- Produces `useAuth()` returning exactly (spec §3):
  ```ts
  {
    user: UserProfile | null
    firebaseUser: import('firebase/auth').User | null
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
    // kept-for-compat no-ops:
    addSubmission: (...a: unknown[]) => void
    promoteUserLevel: () => boolean
    updateWeakness: (...a: unknown[]) => void
  }
  ```

- [ ] **Step 1: Write the provider**

Structure (port the helper functions from `authStore.ts` almost verbatim; adapt `newUserDoc` to the spec §5 schema and `toProfile` → `mapProfile`):

```tsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup,
  signInWithRedirect, updateProfile, onAuthStateChanged, getAdditionalUserInfo,
  signOut, type User as FbUser, type UserCredential,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { firebaseReady, requireAuth, requireDb, googleProvider, githubProvider } from '@/lib/firebase'
import { setSessionId, resetSessionId } from '@/lib/session'
import { mapProfile, type UserProfile } from '@/lib/profile'
import { getLeaderboard } from '@/api'

// re-export the shared types so `@/contexts/AuthContext` keeps working as an import site
export type { UserProfile, UserLevel, DefectClass, SubmissionRecord } from '@/lib/profile'

const todayStr = () => new Date().toISOString().slice(0, 10)

// §5 schema — client-owned create fields only. No stats fields (backend-owned).
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
  if (isNew) { await setDoc(ref, newUserDoc(cred.user, provider, name)); return }
  const snap = await getDoc(ref)
  if (!snap.exists()) await setDoc(ref, newUserDoc(cred.user, provider, name))
}

async function patchMyDoc(uid: string, data: Record<string, unknown>) {
  if (!firebaseReady) return
  try { await updateDoc(doc(requireDb(), 'users', uid), { ...data, updatedAt: serverTimestamp() }) }
  catch (e) { console.error('[auth] profile update failed', e) }
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

interface Ctx { /* the shape from Interfaces above */ }
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
    const unsub = onAuthStateChanged(requireAuth(), async (fb) => {
      unsubDoc.current?.(); unsubDoc.current = null
      if (!fb) {
        setFbUser(null); setUser(null); setAuthReady(true); setProfileReady(true)
        return
      }
      setFbUser(fb); setAuthReady(true); setProfileReady(false)
      setSessionId('web-' + fb.uid)

      let rank: number | null = null
      try {
        const lb = await getLeaderboard({ session_id: 'web-' + fb.uid })
        rank = lb.you?.rank ?? null
      } catch { /* rank stays null */ }

      unsubDoc.current = onSnapshot(
        doc(requireDb(), 'users', fb.uid),
        (snap) => {
          const d = snap.exists() ? (snap.data() as Record<string, unknown>) : {}
          setUser(mapProfile(fb.uid, d, rank))
          setProfileReady(true)
          maybeBumpStreak(fb.uid, d)
        },
        (err) => { console.error('[auth] profile listener', err); setUser(mapProfile(fb.uid, {}, rank)); setProfileReady(true) },
      )
    })
    return () => { unsub(); unsubDoc.current?.() }
  }, [])

  function maybeBumpStreak(uid: string, d: Record<string, unknown>) {
    const last = String(d.lastActiveDate ?? '')
    const today = todayStr()
    if (last === today) return
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    patchMyDoc(uid, last === y
      ? { streakDays: Number(d.streakDays ?? 0) + 1, lastActiveDate: today }
      : { streakDays: 1, lastActiveDate: today })
  }

  const wrap = (fn: () => Promise<void>) => async () => {
    setPending(true); setError(null)
    try { await fn() }
    catch (e) { const m = authErrorMessage(e); if (m) setError(m); throw e }
    finally { setPending(false) }
  }

  const signup = (email: string, password: string, name: string) => wrap(async () => {
    const cred = await createUserWithEmailAndPassword(requireAuth(), email, password)
    if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
    await setDoc(doc(requireDb(), 'users', cred.user.uid), newUserDoc(cred.user, 'password', name))
  })()

  const login = (email: string, password: string) => wrap(async () => {
    await signInWithEmailAndPassword(requireAuth(), email, password)
  })()

  const loginWithProvider = (p: 'google' | 'github') => wrap(async () => {
    const prov = p === 'google' ? googleProvider : githubProvider
    try {
      const cred = await signInWithPopup(requireAuth(), prov)
      await ensureUserDoc(cred, p)
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code === 'auth/popup-blocked') { await signInWithRedirect(requireAuth(), prov); return }
      throw e
    }
  })()

  const logout = async () => {
    setPending(true)
    try { if (firebaseReady) await signOut(requireAuth()) }
    finally {
      unsubDoc.current?.(); unsubDoc.current = null
      resetSessionId()
      setPending(false)
    }
  }

  const value: Ctx = {
    user, firebaseUser, isAuthenticated: !!firebaseUser, authReady, profileReady,
    configured: firebaseReady, error, pending,
    signup, login, loginWithProvider, logout, clearError: () => setError(null),
    addSubmission: () => {}, promoteUserLevel: () => false, updateWeakness: () => {},
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const c = useContext(AuthContext)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
```

Fill the `Ctx` interface with the exact shape from **Interfaces** above.

- [ ] **Step 2: Type-check**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: errors ONLY in files that call `login(name)` (old signature) or read a removed `useAuth()` member (`isAuthenticated` etc. still exist; `addSubmission` still exists as a no-op). Do **not** fix those here — Task 5 fixes `AuthModal`, Task 6 fixes `AuthLandingPage`/`App.tsx`, Task 9 sweeps the rest. Record the list of failing files in the report.

- [ ] **Step 3: Commit**

```bash
git -c gc.auto=0 add frontend/src/contexts/AuthContext.tsx
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(fe-a): real Firebase AuthContext (email + Google + GitHub)

Ports fe201c9 authStore logic into a React Context. onAuthStateChanged
+ users/{uid} onSnapshot -> mapProfile; session_id override set to
web-<uid> on sign-in; streak bump on day rollover; leaderboard rank
fetched once at sign-in. login(name) -> login(email,password);
addSubmission/updateWeakness/promoteUserLevel are now no-ops (backend
is server-authoritative). Consumers fixed in later tasks.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 5: Wire `AuthModal.tsx` to real auth

**Files:**
- Modify: `frontend/src/components/AuthModal.tsx`

**Interfaces:**
- Consumes: `useAuth()` — `signup`, `login`, `loginWithProvider`, `error`, `pending`, `clearError`.

- [ ] **Step 1: Rewrite the modal's logic**

Keep the existing markup/styling. Change:
- `const { login } = useAuth()` → `const { login, signup, loginWithProvider, error, pending, clearError } = useAuth()`.
- `handleSubmit` becomes async:
  ```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isRegister) await signup(email, password, name)
      else await login(email, password)
      toast.success('Welcome to CodeSight!')
      onClose()
    } catch { /* error is shown from context */ }
  }
  ```
- Add two provider buttons above or below the form:
  ```tsx
  <button type="button" disabled={pending} onClick={async () => { try { await loginWithProvider('google'); onClose() } catch {} }}>
    Continue with Google
  </button>
  <button type="button" disabled={pending} onClick={async () => { try { await loginWithProvider('github'); onClose() } catch {} }}>
    Continue with GitHub
  </button>
  ```
  Style them to match the modal (reuse the existing button classes).
- Show `{error && <p className="text-[#FCA5A5] text-xs">{error}</p>}` above the submit button.
- Disable the submit button while `pending`; call `clearError()` when toggling `isRegister` and on unmount.
- The name field is required only when `isRegister`.

- [ ] **Step 2: Type-check**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: `AuthModal.tsx` is now clean.

- [ ] **Step 3: Commit**

```bash
git -c gc.auto=0 add frontend/src/components/AuthModal.tsx
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(fe-a): AuthModal -> real Firebase sign-in / sign-up

Email+password login/register wired to useAuth(); Google + GitHub
buttons added; context error surfaced inline; submit disabled while
pending.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 6: `ProtectedRoute` + `FirebaseNotConfigured` + `App.tsx` + `AuthLandingPage` wiring

**Files:**
- Create: `frontend/src/components/auth/ProtectedRoute.tsx`, `frontend/src/components/auth/FirebaseNotConfigured.tsx`
- Modify: `frontend/src/App.tsx`, `frontend/src/pages/AuthLandingPage.tsx`

**Interfaces:**
- Consumes: `useAuth()` (`authReady`, `isAuthenticated`, `configured`, plus `login`/`signup`/`loginWithProvider` in the landing page); `wouter` `useLocation`.

- [ ] **Step 1: `FirebaseNotConfigured.tsx`**

```tsx
export function FirebaseNotConfigured() {
  const missing = ([
    ['VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY],
    ['VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID],
    ['VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID],
  ] as const).filter(([, v]) => !v).map(([k]) => k)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0B0A0F] text-[#F5EFE6] p-8 text-center">
      <h1 className="text-lg font-bold">Sign-in isn't configured</h1>
      <p className="text-xs text-[#AAA2B5] max-w-md">
        Set these in <code>frontend/.env.local</code> (and the deploy env), then rebuild:
      </p>
      <pre className="text-xs text-[#FCA5A5]">{missing.join('\n') || 'all present — check the browser console'}</pre>
    </div>
  )
}
```

- [ ] **Step 2: `ProtectedRoute.tsx`**

```tsx
import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authReady, isAuthenticated } = useAuth()
  const [location, setLocation] = useLocation()
  useEffect(() => {
    if (authReady && !isAuthenticated) {
      try { sessionStorage.setItem('codesight_next', location) } catch {}
      setLocation('/')
    }
  }, [authReady, isAuthenticated, location, setLocation])
  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0B0A0F] text-[#AAA2B5] text-xs">Loading…</div>
  }
  if (!isAuthenticated) return null
  return <>{children}</>
}
```

- [ ] **Step 3: `App.tsx` — provider-boundary config check + route gating + post-auth redirect**

In `MainContent` (App.tsx ~line 1096): read `const { configured } = useAuth()` and, before the `<AppShell>` return, `if (!configured) return <FirebaseNotConfigured />`.

Replace the `AuthModal` `onClose` handler so it does the `?next` redirect instead of hard `/dashboard`:
```tsx
onClose={() => {
  setShowAuthModal(false)
  let next = '/home'
  try { next = sessionStorage.getItem('codesight_next') || '/home'; sessionStorage.removeItem('codesight_next') } catch {}
  setLocation(next)
}}
```

In the `Router` component (App.tsx ~line 947), wrap the gated routes' elements in `<ProtectedRoute>…</ProtectedRoute>`. Gated = every `<Route>` **except** `path="/"`, `/intro`, `/auth`, `/login`, `/register`. For `component={X}` routes, convert to the render-prop form:
`<Route path="/admin">{() => <ProtectedRoute><AdminPage /></ProtectedRoute>}</Route>`.
For routes already using the render-prop form, wrap the returned element. Keep `handleSelectProblem` etc. threading unchanged.

- [ ] **Step 4: `AuthLandingPage.tsx` — wire the CTAs**

Read the file. Its primary CTA(s) (likely "Get Started" / "Sign In" buttons) currently do nothing or route to `/login`. Wire them to open the auth modal (route to `/login` — `MainContent` already shows the modal on that path) OR, if the landing has its own inline email/password fields, call `useAuth()`'s `login`/`signup` directly and on success do the same `?next` redirect. Add "Continue with Google/GitHub" if the design has space. Keep all styling. If the page is purely marketing with a single "enter app" button, routing it to `/login` is sufficient — note that choice in the report.

- [ ] **Step 5: Type-check**

Run (from `frontend/`): `npx tsc --noEmit`
Expected: `App.tsx`, `AuthLandingPage.tsx`, and the two new files are clean. Remaining errors elsewhere (pages calling old `useAuth()` members) are Task 9.

- [ ] **Step 6: Commit**

```bash
git -c gc.auto=0 add frontend/src/components/auth/ frontend/src/App.tsx frontend/src/pages/AuthLandingPage.tsx
git -c gc.auto=0 commit -m "$(cat <<'EOF'
feat(fe-a): route-gating + not-configured guard + landing wiring

ProtectedRoute (wouter) redirects signed-out users to / and remembers
the target in sessionStorage; MainContent renders FirebaseNotConfigured
when unconfigured; AuthModal.onClose now honours codesight_next;
AuthLandingPage CTAs wired to real auth.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 7: (folded into Task 4) — streak update

Streak-on-load is implemented in Task 4's `maybeBumpStreak`, called from the `onSnapshot` handler. No separate task. If Task 4's reviewer flags `maybeBumpStreak` as out of scope for "the AuthContext rewrite", split it here: same logic, called from a `useEffect` in `AuthProvider` keyed on `[profileReady, user]`.

---

## Task 8: Update `firestore.rules`

**Files:**
- Modify: `firestore.rules` (repo root)

- [ ] **Step 1: Rewrite `createFields()` / `editableFields()` and the create assertions**

```
function createFields() {
  return [
    'uid', 'email', 'displayName', 'photoURL', 'provider', 'createdAt',
    'track', 'level', 'levelIndex', 'streakDays', 'lastActiveDate'
  ];
}

function editableFields() {
  return [
    'displayName', 'photoURL', 'track', 'level', 'levelIndex',
    'streakDays', 'lastActiveDate', 'updatedAt'
  ];
}

allow create: if isOwner()
  && request.resource.data.uid == uid
  && request.resource.data.keys().hasOnly(createFields());

allow update: if isOwner()
  && request.resource.data.diff(resource.data).affectedKeys().hasOnly(editableFields());
```

Remove the `request.resource.data.totalXP == 0` / `eloRating == 1000` / `problemsSolved == 0` / `recentSubmissions.size() == 0` assertions from `allow create` — the client no longer writes those fields at all (they're backend-owned via the Admin SDK, which bypasses rules). Keep `allow read: if isOwner();`, `allow delete: if false;`, and the closed `/{document=**}` fallback.

Update the header comment block to match.

- [ ] **Step 2: Sanity-check the rules syntax**

Rules aren't unit-tested here. Read the file once for balanced braces and that every `createFields()` entry matches what `newUserDoc` (Task 4) actually writes: `uid, email, displayName, photoURL, provider, createdAt, track, level, levelIndex, streakDays, lastActiveDate` — exact set, no extras, none missing. `newUserDoc` must not write `updatedAt` on create (it's `serverTimestamp()` only in `patchMyDoc`) — confirm.

- [ ] **Step 3: Commit**

```bash
git -c gc.auto=0 add firestore.rules
git -c gc.auto=0 commit -m "$(cat <<'EOF'
chore(firestore): rules for the new users/{uid} client schema

createFields/editableFields updated to identity + track/level +
streakDays/lastActiveDate. Dropped the stats-field create assertions —
the client no longer writes totalXP/eloRating/etc. (Admin SDK does,
bypassing rules). MUST be re-published in the Firebase console before
deploy.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

**Human step (not a code task):** paste `firestore.rules` into Firebase console → Firestore Database → Rules → Publish. Until then, live sign-up against the deployed Firestore will fail the `create` rule on the new field set. Local `tsc`/`build` are unaffected.

---

## Task 9: Full-frontend `tsc` sweep

**Files:**
- Modify: whatever `npx tsc --noEmit` flags — expected: page/widget files that call `login(name)` or read removed context members.

- [ ] **Step 1: Enumerate the breakage**

Run (from `frontend/`): `npx tsc --noEmit 2>&1 | tee /tmp/tsc-a.txt`
List every file + error.

- [ ] **Step 2: Fix each call site**

Common fixes:
- `login(name)` → the caller is a sign-in surface: route it through the modal (`setLocation('/login')`) or call `login(email, password)` / `signup(email, password, name)` with real fields.
- `user.xp` / `user.solvedCount` / `user.history` / `user.defectStats` — these still exist on `UserProfile` (Task 3 kept the shape). If a widget reads a field that changed name (e.g. old `user.totalXP` → new `user.xp`), update the read.
- `user` can now be `null` (before `profileReady`) — add `user?.` / a fallback (`user?.xp ?? 0`). Do NOT introduce a non-null assertion `user!`.
- `addSubmission(...)` / `updateWeakness(...)` / `promoteUserLevel()` calls — leave them; they're no-ops now. Only touch them if the call *shape* no longer type-checks (they accept `...unknown[]`, so they won't).
- `isAuthenticated` reads — unchanged, still there.

Keep changes minimal — this task is about compilation, not re-behaving pages (that's B/C).

- [ ] **Step 3: Type-check + build**

Run (from `frontend/`): `npx tsc --noEmit` → clean.
Run: `npx vite build` → `✓ built`.

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add -A frontend/src
git -c gc.auto=0 commit -m "$(cat <<'EOF'
fix(fe-a): reconcile all useAuth() call sites with the new context

login(name)->login(email,password) callers routed through the modal;
user is now nullable pre-profile-load so reads are optional-chained;
no-op mutator calls left as-is. tsc + vite build green.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

---

## Task 10: Browser walkthrough + fixes

**Files:** none unless the walkthrough surfaces a bug.

- [ ] **Step 1: Start the dev server against the deployed backend**

From `frontend/`: confirm `.env.local` has `VITE_API_BASE_URL=https://codesight-code-review-production.up.railway.app` and the six `VITE_FIREBASE_*`. Run `npm run dev`.

- [ ] **Step 2: Walk the spec §9 checklist**

1. App loads (`/` → intro → landing), no console errors, no `FirebaseNotConfigured`.
2. **Sign up** (a fresh throwaway email, e.g. `fe-a-<timestamp>@codesight.dev`, password `testpass1234`) → lands on `/home` (or `?next`); in the Firebase console, `users/{uid}` exists with exactly `uid, email, displayName, photoURL, provider, createdAt, track, level, levelIndex, streakDays, lastActiveDate`. **If the create is rejected, the human hasn't re-published `firestore.rules` yet — note it and continue with the emulator-free caveat, or ask the controller to get the rules published.**
3. Header/nav shows the display name (not "Alex Morgan").
4. **Sign out** → back to `/`; `localStorage['codesight_session_id']` override cleared (a subsequent anonymous request uses a `web-<random>` id).
5. **Sign in** with the same credentials → `/home`, profile loads from the existing doc.
6. **Google sign-in** (a real Google account) → popup → doc ensured → `/home`. GitHub: same if a test account is available; otherwise record as "not manually verified".
7. **Direct-visit a gated route while signed out** (`/problems`) → redirected to `/`; sign in → land back on `/problems`.
8. **Network tab:** the leaderboard rank call fired on sign-in carries `Authorization: Bearer …`, returns 200, and its `session_id` query param is `web-<uid>`.
9. **Anonymous** (incognito, no sign-in): no `Authorization` header on requests; `getSessionId()` → `web-<random>`.
10. **Streak:** signed in, edit the Firestore doc's `lastActiveDate` to yesterday, reload → `streakDays` becomes 1→2 (or 0→1) and `lastActiveDate` is today.
11. Existing pages (Problems, Dashboard, etc. — still on mock data) still render without crashing.

- [ ] **Step 3: Fix anything broken, re-verify, commit**

```bash
git -c gc.auto=0 add -A frontend/src
git -c gc.auto=0 commit -m "$(cat <<'EOF'
fix(fe-a): walkthrough fixes

<one line per fix>

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
EOF
)"
```

- [ ] **Step 4: Report the walkthrough result** (pass/fail per checklist item; note anything deferred to B/C).

---

## Self-Review

**1. Spec coverage**

| Spec section | Task |
|---|---|
| §2 port `src/lib/` | Task 1 |
| §2 port `src/api/` (mock stripped) | Task 2 |
| §2 `src/lib/profile.ts` (`mapProfile`, `CLASS_LABEL`, `userLevelOf`) | Task 3 |
| §3 `AuthContext` rewrite (surface, init, signup/login/provider/logout, no-op mutators) | Task 4 |
| §4 `session_id` = `web-<uid>` override | Task 1 (mechanism) + Task 4 (set on sign-in) |
| §5 Firestore schema + `newUserDoc` | Task 4 |
| §5 streak update on load | Task 4 (`maybeBumpStreak`) / Task 7 (fallback split) |
| §5 `mapProfile` table | Task 3 |
| §6 `ProtectedRoute` + gated route list + post-auth redirect | Task 6 |
| §6 `FirebaseNotConfigured` | Task 6 |
| §7 `firestore.rules` | Task 8 (+ human re-publish note) |
| §8 error/loading/not-configured states | Task 4 (`error`/`pending`/`authReady`/`profileReady`), Task 6 (`FirebaseNotConfigured`, spinner) |
| §9 verification | Task 9 (tsc/build) + Task 10 (walkthrough) |
| §3 `login` signature change → sweep every caller | Task 9 |

No gaps.

**2. Placeholder scan** — Task 4 and Task 3 carry full code. Task 2's per-module ports say "retrieve `git show fe201c9:…`, strip the mock branch" with `grade.ts` shown fully as the worked example — the retrieved file is the concrete spec, not a placeholder. Task 6 Step 4 (`AuthLandingPage`) is necessarily descriptive because the file's exact CTA structure isn't pasted; the implementer reads it and the acceptance ("CTAs reach real auth; styling unchanged; choice noted in report") is explicit.

**3. Type consistency**
- `UserProfile` shape is declared once (Task 3, `src/lib/profile.ts`) and re-exported by `AuthContext` (Task 4). `mapProfile` returns it; Task 9 reconciles readers.
- `useAuth()` surface: the exact object in Task 4 **Interfaces** matches what Tasks 5 and 6 consume (`signup`, `login`, `loginWithProvider`, `logout`, `error`, `pending`, `clearError`, `configured`, `authReady`, `isAuthenticated`, `user`).
- `setSessionId` (Task 1) ↔ called in Task 4's sign-in branch. `resetSessionId` (Task 1) ↔ Task 4 `logout`.
- `firestore.rules` `createFields()` (Task 8) ↔ `newUserDoc` write set (Task 4) — both list exactly `uid, email, displayName, photoURL, provider, createdAt, track, level, levelIndex, streakDays, lastActiveDate`.
- `getLeaderboard({ session_id })` (Task 4) ↔ ported `leaderboard.ts` (Task 2) signature — verify in Task 2 that `getLeaderboard` accepts `{ session_id?: string }` and returns `{ you?: { rank: number } | null, … }`; adapt the call in Task 4 if the ported signature differs.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-31-fe-integration-A-foundation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
