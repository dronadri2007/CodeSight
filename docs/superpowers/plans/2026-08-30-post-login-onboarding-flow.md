# Post-login Onboarding Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After login, a not-yet-onboarded user is routed through a Student / AI-Engineer chooser and a level or entrance test; once onboarded the flag persists and later logins land straight on `/home` showing the real (zeroed) Firestore profile instead of mock numbers.

**Architecture:** Add one client-writable boolean `onboarded` to the Firestore `users/{uid}` doc and to `authStore`. A new `<OnboardingRoute>` wraps the "app" routes and redirects `authenticated && !onboarded` to `/role-select`. The Student flow is reworked to two entries (Start as Beginner / Know your level). The AI-Engineer flow collapses the current two tests into one 5-question MCQ `ProEntranceTest` scored out of 15 that decides both eligibility (≥6) and tier (6–9 / 10–12 / 13–15). `HomeDashboard`'s `|| N` mock fallbacks become `?? 0`.

**Tech Stack:** React 19, Vite 8, TypeScript, react-router-dom (HashRouter), zustand 5, framer-motion, lucide-react, Firebase Auth + Firestore (client SDK). Tailwind (locked palette `#000000 / #1A130D / #3A2F1D / #E5DFC9`, gold `#E3A24A` for Pro only).

**Spec:** `docs/superpowers/specs/2026-08-30-post-login-onboarding-flow-design.md` — read it alongside this plan.

## Global Constraints

- **No frontend test runner exists.** Each task's test cycle is: `cd frontend && npx tsc --noEmit` (must be clean) → for tasks that add/replace a page or touch routing also `npx vite build` (must be clean) → browser check where the task has something visible → commit. The end-to-end browser walkthrough is Task 11.
- **Palette is locked.** Only the four base colours above plus gold `#E3A24A` (Pro tier only). No new colours, no changes to `FullscreenPixelHero.tsx` or the background video.
- **Router is HashRouter.** All navigation uses `navigate('/path')` / `<Navigate to="/path">`; unknown paths already fall back to `/home` via the `*` route in `App.tsx`.
- **`EASE` easing constant** used across the codebase: `const EASE = [0.16, 1, 0.3, 1] as const`.
- **Commits:** run git as `git -c gc.auto=0 …` (repo emits gc warnings otherwise). End every commit message body with the two trailer lines from `C:\Users\drona\.claude\CLAUDE.md`:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn
  ```
- **`LevelTier` type** (exported from `frontend/src/store/authStore.ts`): `'Beginner' | 'Intermediate' | 'Pro'`.
- **`TrackType` type** (same file): `'student' | 'pro'`.
- **Difficulty mapping** used by every level page: `Beginner → 'Easy'`, `Intermediate → 'Medium'`, `Pro → 'Hard'` for `useProblemStore().setFilters({ difficulty })`.
- **`patchMyDoc`** in `authStore.ts` is the existing helper for client writes to `users/{uid}`; it is a no-op when `uid` is undefined or Firebase is unconfigured.

---

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `firestore.rules` | allow `onboarded` on create + update | 1 |
| `frontend/src/store/authStore.ts` | `onboarded` + `profileReady` state, `newUserDoc`, snapshot sync, `setOnboarded` | 1 |
| `frontend/src/components/auth/OnboardingRoute.tsx` | **new** — auth + onboarding gate | 2 |
| `frontend/src/pages/pro/ProEntranceTest.tsx` | **new** — 5-Q MCQ, score /15, eligibility + band, navigates to result | 3 |
| `frontend/src/pages/pro/ProEntranceResult.tsx` | **new** — eligible / not-eligible outcome screen | 4 |
| `frontend/src/pages/Auth.tsx` | login + signup + social all navigate to `/home` | 5 |
| `frontend/src/pages/RoleSelect.tsx` | `choosePro()` → `/pro/entrance-test`; already-passed branch sets `onboarded` | 6 |
| `frontend/src/pages/student/StudentLevelSelect.tsx` | two actions (Start as Beginner / Know your level); sets `onboarded`; → `/home` | 7 |
| `frontend/src/pages/student/StudentLevelTest.tsx` | on finish sets `onboarded`; → `/home` | 8 |
| `frontend/src/pages/pro/ProLevelSelect.tsx` | guard-redirect target → `/pro/entrance-test` | 9 |
| `frontend/src/pages/HomeDashboard.tsx` | `?? 0` fallbacks, drop `mockProblems`, gate the recommendation card, button targets | 10 |
| `frontend/src/App.tsx` | swap `ProtectedRoute`→`OnboardingRoute` on app routes; add entrance routes; remove promotional routes | 11 |

After this plan, these become unrouted (a later cleanup deletes them): `frontend/src/pages/pro/ProPromotionalEntry.tsx`, `ProPromotionalTest.tsx`, `ProPromotionalResult.tsx`, `ProLevelTest.tsx`.

---

## Task 1: Persist the `onboarded` flag

**Files:**
- Modify: `firestore.rules` (the `createFields()` and `editableFields()` functions)
- Modify: `frontend/src/store/authStore.ts` (interface, initial state, `newUserDoc`, `onAuthStateChanged` block, new action)

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `authStore` state fields `onboarded: boolean` and `profileReady: boolean`
  - `authStore` action `setOnboarded: (value: boolean) => void`
  - `profileReady` is `false` from the moment a Firebase user is seen until the first `users/{uid}` snapshot (or its error) resolves; `true` when Firebase is unconfigured or when signed out.

- [ ] **Step 1: Add `onboarded` to the Firestore rules field lists**

In `firestore.rules`, `createFields()` currently returns:

```
return [
  'uid', 'email', 'displayName', 'photoURL', 'provider',
  'createdAt', 'updatedAt',
  'selectedTrack', 'studentLevel', 'proLevel', 'hasPassedPromotionalTest',
  'level', 'levelIndex',
  'totalXP', 'eloRating', 'globalRank', 'currentStreak', 'problemsSolved',
  'weaknessCatchRates', 'recentSubmissions'
];
```

Change the `hasPassedPromotionalTest` line to add `onboarded`:

```
  'selectedTrack', 'studentLevel', 'proLevel', 'hasPassedPromotionalTest', 'onboarded',
```

`editableFields()` currently returns:

```
return [
  'displayName', 'photoURL',
  'selectedTrack', 'studentLevel', 'proLevel', 'hasPassedPromotionalTest',
  'updatedAt'
];
```

Change the middle line to:

```
  'selectedTrack', 'studentLevel', 'proLevel', 'hasPassedPromotionalTest', 'onboarded',
```

- [ ] **Step 2: Add the two state fields and the action to the `AuthState` interface**

In `frontend/src/store/authStore.ts`, the `interface AuthState` block has:

```ts
  isAuthenticated: boolean
  authReady: boolean
  user: UserProfile | null
  selectedTrack: TrackType
  studentLevel: LevelTier
  proLevel: LevelTier
  hasPassedPromotionalTest: boolean
```

Add after `authReady`:

```ts
  profileReady: boolean
```

Add after `hasPassedPromotionalTest`:

```ts
  onboarded: boolean
```

In the same interface, the profile-setter group has `setPassedPromotionalTest: (passed: boolean) => void`. Add directly below it:

```ts
  setOnboarded: (value: boolean) => void
```

- [ ] **Step 3: Add the initial values in the `create(...)` call**

The store initializer currently starts:

```ts
export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  authReady: !firebaseReady, // if Firebase is unconfigured we're "ready" (and signed out)
  user: null,
  selectedTrack: 'student',
  studentLevel: 'Beginner',
  proLevel: 'Beginner',
  hasPassedPromotionalTest: false,
```

Change it to:

```ts
export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  authReady: !firebaseReady, // if Firebase is unconfigured we're "ready" (and signed out)
  profileReady: !firebaseReady,
  user: null,
  selectedTrack: 'student',
  studentLevel: 'Beginner',
  proLevel: 'Beginner',
  hasPassedPromotionalTest: false,
  onboarded: false,
```

- [ ] **Step 4: Add `onboarded: false` to `newUserDoc`**

`function newUserDoc(u: FbUser, provider: string)` returns an object containing:

```ts
    selectedTrack: 'student' as TrackType,
    studentLevel: 'Beginner' as LevelTier,
    proLevel: 'Beginner' as LevelTier,
    hasPassedPromotionalTest: false,
```

Add one line after `hasPassedPromotionalTest`:

```ts
    onboarded: false,
```

- [ ] **Step 5: Wire `profileReady` and `onboarded` through the auth listener**

The `initAuthListener` body currently has this `onAuthStateChanged` callback:

```ts
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
```

Replace it with:

```ts
    onAuthStateChanged(requireAuth(), (fbUser) => {
      unsubDoc?.()
      unsubDoc = null

      if (!fbUser) {
        set({
          isAuthenticated: false,
          user: null,
          authReady: true,
          profileReady: true,
          onboarded: false,
        })
        return
      }

      set({
        isAuthenticated: true,
        user: stubProfile(fbUser),
        authReady: true,
        profileReady: false,
      })

      unsubDoc = onSnapshot(
        doc(requireDb(), 'users', fbUser.uid),
        (snap) => {
          if (!snap.exists()) {
            set({ profileReady: true })
            return
          }
          const d = snap.data() as Record<string, unknown>
          set({
            user: toProfile(fbUser.uid, d),
            selectedTrack: (d.selectedTrack as TrackType) ?? 'student',
            studentLevel: (d.studentLevel as LevelTier) ?? 'Beginner',
            proLevel: (d.proLevel as LevelTier) ?? 'Beginner',
            hasPassedPromotionalTest: Boolean(d.hasPassedPromotionalTest),
            onboarded: Boolean(d.onboarded),
            profileReady: true,
          })
        },
        (err) => {
          console.error('[auth] profile listener error', err)
          set({ profileReady: true })
        }
      )
    })
```

- [ ] **Step 6: Add the `setOnboarded` action**

The store has `setPassedPromotionalTest`:

```ts
  setPassedPromotionalTest: (passed) => {
    set({ hasPassedPromotionalTest: passed })
    patchMyDoc(get().user?.id, { hasPassedPromotionalTest: passed })
  },
```

Add directly below it:

```ts
  setOnboarded: (value) => {
    set({ onboarded: value })
    patchMyDoc(get().user?.id, { onboarded: value })
  },
```

- [ ] **Step 7: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 8: Commit**

```bash
git -c gc.auto=0 add firestore.rules frontend/src/store/authStore.ts
git -c gc.auto=0 commit -m "feat(auth): persist onboarded flag + profileReady gate state

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

- [ ] **Step 9: Note for the human**

`firestore.rules` must be re-published in the Firebase console (Firestore → Rules → Publish) for the `onboarded` write to be accepted in production. Until then, `patchMyDoc` writes of `onboarded` fail silently (optimistic local state still works for the session). Flag this in the task hand-off.

---

## Task 2: `OnboardingRoute` guard component

**Files:**
- Create: `frontend/src/components/auth/OnboardingRoute.tsx`

**Interfaces:**
- Consumes: `useAuthStore` fields `isAuthenticated`, `authReady`, `profileReady`, `onboarded` (from Task 1).
- Produces: `export function OnboardingRoute({ children }: { children: React.ReactElement }): React.ReactElement` — renders a spinner until `authReady && (!isAuthenticated || profileReady)`, redirects to `/auth` when not authenticated, redirects to `/role-select` when authenticated but `!onboarded`, else renders `children`.

- [ ] **Step 1: Create the component**

Create `frontend/src/components/auth/OnboardingRoute.tsx` with exactly:

```tsx
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface OnboardingRouteProps {
  children: React.ReactElement
}

/**
 * Auth + onboarding gate for the "app" routes.
 *
 *   not authed              -> /auth
 *   authed, not onboarded   -> /role-select  (run the chooser + level/entrance flow)
 *   authed, onboarded       -> children
 *
 * Waits for the first Firestore users/{uid} snapshot (profileReady) before
 * deciding, so a returning onboarded user never flashes the chooser.
 */
export function OnboardingRoute({ children }: OnboardingRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authReady = useAuthStore((s) => s.authReady)
  const profileReady = useAuthStore((s) => s.profileReady)
  const onboarded = useAuthStore((s) => s.onboarded)
  const location = useLocation()

  if (!authReady || (isAuthenticated && !profileReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000] text-[#E5DFC9]">
        <Loader2 size={20} className="animate-spin text-[#E5DFC9]/60" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  if (!onboarded) {
    return <Navigate to="/role-select" replace />
  }

  return children
}
```

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean. (The component is not imported anywhere yet — that is fine; `tsc` still checks the file.)

- [ ] **Step 3: Commit**

```bash
git -c gc.auto=0 add frontend/src/components/auth/OnboardingRoute.tsx
git -c gc.auto=0 commit -m "feat(auth): add OnboardingRoute gate component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 3: `ProEntranceTest` page

**Files:**
- Create: `frontend/src/pages/pro/ProEntranceTest.tsx`
- Reference (copy markup/style from): `frontend/src/pages/pro/ProLevelTest.tsx`

**Interfaces:**
- Consumes: `useAuthStore` actions `setSelectedTrack`, `setProLevel`, `setPassedPromotionalTest`, `setOnboarded`; `useProblemStore().setFilters`.
- Produces: default-exported `ProEntranceTest` React component. On finishing all 5 questions it computes `score` (0–15), `eligible` (`score >= 6`), `tier` (`score >= 13 ? 'Pro' : score >= 10 ? 'Intermediate' : 'Beginner'`); if `eligible` it runs the mutation set below **then** navigates to `/pro/entrance-result` with route state `{ score, maxScore: 15, eligible, tier }`. If not eligible it navigates to `/pro/entrance-result` with the same state shape and runs no mutations.
  - Eligible mutation set: `setPassedPromotionalTest(true)`, `setSelectedTrack('pro')`, `setProLevel(tier)`, `setFilters({ mode: 'ai_engineer', difficulty: tier === 'Beginner' ? 'Easy' : tier === 'Intermediate' ? 'Medium' : 'Hard' })`, `setOnboarded(true)`.
  - Route-state type (define and export from this file): `export type EntranceResultState = { score: number; maxScore: number; eligible: boolean; tier: 'Beginner' | 'Intermediate' | 'Pro' }`

> **Deviation from spec §4:** the eligible mutations run here, on submit, rather than on the result page. This keeps `ProEntranceResult` a pure display component (no `useEffect` side effects) and means a hard refresh of the result page can't un-onboard the user. Net behaviour is identical.

- [ ] **Step 1: Create the file with the question bank and scaffold**

Create `frontend/src/pages/pro/ProEntranceTest.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, ArrowRight } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore, type LevelTier } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

export type EntranceResultState = {
  score: number
  maxScore: number
  eligible: boolean
  tier: LevelTier
}

const MAX_SCORE = 15
const ELIGIBLE_MIN = 6

type Question = {
  id: number
  title: string
  code: string
  prompt: string
  options: { text: string; score: number }[]
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'Snippet 1: Query building',
    code: 'query = "SELECT * FROM users WHERE id = " + str(user_id)\ncursor.execute(query)',
    prompt: 'This AI-generated snippet builds a SQL query. What is the main defect?',
    options: [
      { text: 'Nothing — wrapping the value in str() makes it safe', score: 0 },
      { text: 'SQL injection — the value is concatenated into the query instead of passed as a parameterised placeholder', score: 3 },
      { text: 'SELECT * is slower than naming the columns', score: 1 },
      { text: 'The query is missing a LIMIT clause', score: 0 },
    ],
  },
  {
    id: 2,
    title: 'Snippet 2: Row access',
    code: 'def get_user_email(user_id):\n    row = db.query("SELECT email FROM users WHERE id = ?", user_id).fetchone()\n    return row[0]',
    prompt: 'What happens when the id does not exist in the table?',
    options: [
      { text: 'fetchone() raises StopIteration', score: 0 },
      { text: 'row is None, so row[0] raises "TypeError: NoneType object is not subscriptable"', score: 3 },
      { text: 'It returns an empty string', score: 0 },
      { text: 'The query raises a KeyError', score: 0 },
    ],
  },
  {
    id: 3,
    title: 'Snippet 3: Config loading',
    code: "def read_config(path):\n    f = open(path)\n    return json.load(f)",
    prompt: 'Which review comment is correct?',
    options: [
      { text: 'The file handle is never closed — use "with open(path) as f:"', score: 3 },
      { text: 'json.load cannot take a file object', score: 0 },
      { text: 'open() needs mode="rb" for JSON', score: 0 },
      { text: 'It is fine; CPython closes the file on return', score: 1 },
    ],
  },
  {
    id: 4,
    title: 'Snippet 4: API key check',
    code: 'def check_api_key(supplied, expected):\n    return supplied == expected',
    prompt: 'Best finding for a security reviewer?',
    options: [
      { text: '== is fine for comparing strings', score: 0 },
      { text: 'String "==" returns as soon as it hits a mismatching byte, leaking length and prefix via timing — use hmac.compare_digest', score: 3 },
      { text: 'Both sides should be md5-hashed first', score: 1 },
      { text: 'It needs a try/except around the comparison', score: 0 },
    ],
  },
  {
    id: 5,
    title: 'Snippet 5: Balance transfer',
    code: 'def transfer(a, b, amount):\n    if balances[a] >= amount:\n        balances[a] -= amount\n        balances[b] += amount',
    prompt: 'What is the highest-severity issue?',
    options: [
      { text: 'The parameters have no type hints', score: 0 },
      { text: 'The check-then-act on balances[a] is not atomic — two concurrent transfers can both pass the guard and overdraw the account', score: 3 },
      { text: 'KeyError if b is not already in balances', score: 1 },
      { text: 'It should return the new balance', score: 0 },
    ],
  },
]

function tierFor(score: number): LevelTier {
  if (score >= 13) return 'Pro'
  if (score >= 10) return 'Intermediate'
  return 'Beginner'
}

export default function ProEntranceTest() {
  const navigate = useNavigate()
  const { setSelectedTrack, setProLevel, setPassedPromotionalTest, setOnboarded } = useAuthStore()
  const { setFilters } = useProblemStore()

  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  const q = QUESTIONS[currentIdx]
  const selection = answers[currentIdx]
  const isLast = currentIdx === QUESTIONS.length - 1

  const select = (optIdx: number) => {
    const next = [...answers]
    next[currentIdx] = optIdx
    setAnswers(next)
  }

  const finish = () => {
    const score = answers.reduce((sum, optIdx, i) => sum + (QUESTIONS[i].options[optIdx]?.score ?? 0), 0)
    const eligible = score >= ELIGIBLE_MIN
    const tier = tierFor(score)

    if (eligible) {
      setPassedPromotionalTest(true)
      setSelectedTrack('pro')
      setProLevel(tier)
      setFilters({
        mode: 'ai_engineer',
        difficulty: tier === 'Beginner' ? 'Easy' : tier === 'Intermediate' ? 'Medium' : 'Hard',
      })
      setOnboarded(true)
    }

    const state: EntranceResultState = { score, maxScore: MAX_SCORE, eligible, tier }
    navigate('/pro/entrance-result', { state })
  }

  const next = () => {
    if (isLast) finish()
    else setCurrentIdx(currentIdx + 1)
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#3A2F1D]">
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm">AI ENGINEER ENTRANCE TEST</Badge>
              <span className="text-xs font-mono text-[#E5DFC9]/60 font-bold">
                Question {currentIdx + 1} of {QUESTIONS.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    i === currentIdx ? 'bg-[#E5DFC9]' : i < currentIdx ? 'bg-[#E5DFC9]/50' : 'bg-[#3A2F1D]'
                  }`}
                />
              ))}
            </div>
          </div>

          <Card className="p-6 sm:p-8 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-mono text-[#E5DFC9]/60 uppercase tracking-wider block font-bold mb-1">
                {q.title}
              </span>
              <pre className="p-4 rounded-xl bg-[#000000] border border-[#3A2F1D] font-mono text-xs text-[#E5DFC9] overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {q.code}
              </pre>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#E5DFC9] mb-3">{q.prompt}</h2>
              <div className="space-y-2.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selection === oIdx
                  return (
                    <button
                      key={oIdx}
                      onClick={() => select(oIdx)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 text-xs ${
                        isSelected
                          ? 'bg-[#000000] border-[#E5DFC9] text-[#E5DFC9] shadow-md ring-1 ring-[#E5DFC9]/40 font-semibold'
                          : 'bg-[#000000]/60 border-[#3A2F1D] text-[#E5DFC9]/80 hover:border-[#E5DFC9]/40 hover:bg-[#000000]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                          isSelected ? 'bg-[#E5DFC9] border-[#E5DFC9] text-[#000000]' : 'border-[#3A2F1D] text-[#E5DFC9]/60'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </div>
                      <span>{opt.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#E5DFC9]/45 font-mono">
                <Bot size={13} /> Score ≥ {ELIGIBLE_MIN} / {MAX_SCORE} unlocks the track
              </span>
              <Button
                size="md"
                variant="gold"
                onClick={next}
                disabled={selection === undefined}
                iconRight={<ArrowRight size={14} />}
                className="font-bold text-xs"
              >
                {isLast ? 'Submit entrance test' : 'Next question'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Build**

Run: `cd frontend && npx vite build`
Expected: `✓ built` with no errors (chunk-size warning is pre-existing and fine).

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/pro/ProEntranceTest.tsx
git -c gc.auto=0 commit -m "feat(pro): add combined AI-Engineer entrance test (score /15 -> eligibility + tier)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 4: `ProEntranceResult` page

**Files:**
- Create: `frontend/src/pages/pro/ProEntranceResult.tsx`
- Reference (copy markup/style from): `frontend/src/pages/pro/ProPromotionalResult.tsx`

**Interfaces:**
- Consumes: `EntranceResultState` type from `./ProEntranceTest`; `useAuthStore` actions `setSelectedTrack`, `setStudentLevel`, `setOnboarded`; `useProblemStore().setFilters`.
- Produces: default-exported `ProEntranceResult` React component. Pure display of `useLocation().state as EntranceResultState | null`.
  - No state → neutral "take the test" screen with a button to `/pro/entrance-test`.
  - `eligible` → shows `score / maxScore` and `tier`; **Continue** button → `navigate('/home')` (mutations already ran in Task 3).
  - `!eligible` → shows `score / maxScore` and the `ELIGIBLE_MIN` threshold; **Retake** → `/pro/entrance-test`; **Start the Student track instead** → runs `setSelectedTrack('student')`, `setStudentLevel('Beginner')`, `setFilters({ mode: 'student', difficulty: 'Easy' })`, `setOnboarded(true)`, then `navigate('/home')`.

- [ ] **Step 1: Create the file**

Create `frontend/src/pages/pro/ProEntranceResult.tsx`:

```tsx
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, GraduationCap } from 'lucide-react'
import { Navbar } from '../../components/navigation/Navbar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'
import type { EntranceResultState } from './ProEntranceTest'

const ELIGIBLE_MIN = 6

export default function ProEntranceResult() {
  const navigate = useNavigate()
  const state = useLocation().state as EntranceResultState | null
  const { setSelectedTrack, setStudentLevel, setOnboarded } = useAuthStore()
  const { setFilters } = useProblemStore()

  if (!state) {
    return (
      <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25">
        <Navbar variant="pro" />
        <main className="flex-1 max-w-md w-full mx-auto px-6 py-24 flex flex-col items-start gap-3">
          <h1 className="text-xl font-extrabold tracking-[-0.02em]">No result to show</h1>
          <p className="text-[13px] text-[#E5DFC9]/60">Take the AI-Engineer entrance test first.</p>
          <Button size="md" variant="gold" onClick={() => navigate('/pro/entrance-test')} className="mt-2 text-[13px]">
            Start the entrance test
          </Button>
        </main>
      </div>
    )
  }

  const { score, maxScore, eligible, tier } = state

  const startStudentInstead = () => {
    setSelectedTrack('student')
    setStudentLevel('Beginner')
    setFilters({ mode: 'student', difficulty: 'Easy' })
    setOnboarded(true)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="pro" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <Card className="p-8 sm:p-10 bg-[#1A130D] border-[#3A2F1D] shadow-2xl space-y-6 text-center max-w-2xl mx-auto">
            <div
              className={`w-16 h-16 rounded-2xl bg-[#000000] border-2 flex items-center justify-center mx-auto shadow-md ${
                eligible ? 'border-[#E5DFC9] text-[#E5DFC9]' : 'border-[#3A2F1D] text-[#E5DFC9]/70'
              }`}
            >
              {eligible ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
            </div>

            <div className="space-y-2">
              <Badge variant={eligible ? 'gold' : 'default'} size="sm">
                SCORE {score} / {maxScore}
                {!eligible && ` · UNLOCK AT ${ELIGIBLE_MIN}`}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {eligible ? 'AI-Engineer track unlocked' : 'Not unlocked yet'}
              </h1>
              <p className="text-xs sm:text-sm text-[#E5DFC9]/80 leading-relaxed max-w-md mx-auto">
                {eligible
                  ? `You've been placed at the ${tier} reviewer tier based on your score.`
                  : 'Your code-review score is below the entry bar. Retake the test, or start on the Student track and come back later.'}
              </p>
            </div>

            {eligible ? (
              <div className="pt-2">
                <Button
                  fullWidth
                  size="lg"
                  variant="gold"
                  onClick={() => navigate('/home')}
                  iconRight={<ArrowRight size={16} />}
                  className="font-bold text-xs shadow-xl"
                >
                  Continue as {tier} reviewer
                </Button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="md"
                  variant="gold"
                  onClick={() => navigate('/pro/entrance-test')}
                  icon={<RotateCcw size={14} />}
                  className="font-bold text-xs"
                >
                  Retake the test
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={startStudentInstead}
                  icon={<GraduationCap size={14} />}
                  iconRight={<ArrowRight size={14} />}
                  className="text-xs"
                >
                  Start the Student track instead
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Build**

Run: `cd frontend && npx vite build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/pro/ProEntranceResult.tsx
git -c gc.auto=0 commit -m "feat(pro): add entrance-test result screen (eligible tier / retake / go student)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 5: `Auth.tsx` always routes to `/home`

**Files:**
- Modify: `frontend/src/pages/Auth.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: after any successful auth (email login, email signup, Google, GitHub) the page navigates to `/home`. Downstream, `OnboardingRoute` (once wired in Task 11) redirects a not-onboarded user to `/role-select`.

- [ ] **Step 1: Replace the `dest` split**

`Auth.tsx` currently has:

```tsx
  // signup -> /role-select (pick a track), login -> /home
  const dest = isSignup ? '/role-select' : '/home'
```

Replace with:

```tsx
  // Both paths land on /home; OnboardingRoute sends a not-yet-onboarded user
  // to /role-select from there.
  const dest = '/home'
```

Leave the `navigate(dest, { replace: true })` call in `onSubmit` unchanged.

- [ ] **Step 2: Confirm the social handler already targets `/home`**

In `Auth.tsx`, `const social = async (provider) => { … navigate('/home', { replace: true }) … }` — it already goes to `/home`. No change needed. (If it does not, change it to `navigate('/home', { replace: true })`.)

- [ ] **Step 3: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/Auth.tsx
git -c gc.auto=0 commit -m "refactor(auth): route every successful sign-in to /home (gate handles onboarding)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 6: `RoleSelect` — point AI-Engineer at the entrance test

**Files:**
- Modify: `frontend/src/pages/RoleSelect.tsx`

**Interfaces:**
- Consumes: `useAuthStore` — add `setOnboarded` to the destructured actions (already uses `setSelectedTrack`, `hasPassedPromotionalTest`).
- Produces: `choosePro()` → `/pro/entrance-test` for a user who has not passed; for a user who already `hasPassedPromotionalTest`, it sets track + `onboarded` and goes to `/home`. `chooseStudent()` unchanged (`→ /student/level-select`).

- [ ] **Step 1: Update the store destructure**

`RoleSelect.tsx` currently has:

```tsx
  const { setSelectedTrack, hasPassedPromotionalTest } = useAuthStore()
```

Change to:

```tsx
  const { setSelectedTrack, hasPassedPromotionalTest, setOnboarded } = useAuthStore()
```

- [ ] **Step 2: Rewrite `choosePro`**

Currently:

```tsx
  const choosePro = () => {
    setSelectedTrack('pro')
    setFilters({ mode: 'ai_engineer' })
    navigate(hasPassedPromotionalTest ? '/pro/level-select' : '/pro/promotional-test')
  }
```

Replace with:

```tsx
  const choosePro = () => {
    setSelectedTrack('pro')
    setFilters({ mode: 'ai_engineer' })
    if (hasPassedPromotionalTest) {
      setOnboarded(true)
      navigate('/home')
    } else {
      navigate('/pro/entrance-test')
    }
  }
```

- [ ] **Step 3: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/RoleSelect.tsx
git -c gc.auto=0 commit -m "feat(onboarding): RoleSelect AI-Engineer -> entrance test; already-passed -> /home

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 7: `StudentLevelSelect` — two actions

**Files:**
- Modify: `frontend/src/pages/student/StudentLevelSelect.tsx`

**Interfaces:**
- Consumes: `useAuthStore` actions `setStudentLevel`, `setSelectedTrack`, `setOnboarded`; `useProblemStore().setFilters`.
- Produces: a screen with exactly two actions — **Start as Beginner** (sets track + `Beginner` level + `onboarded`, `setFilters({ mode: 'student', difficulty: 'Easy' })`, `navigate('/home')`) and **Know your level** (`navigate('/student/level-test')`). The Intermediate and Pro direct-start cards are removed.

- [ ] **Step 1: Replace the file body**

Replace the entire contents of `frontend/src/pages/student/StudentLevelSelect.tsx` with:

```tsx
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, ArrowRight, Compass, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Navbar } from '../../components/navigation/Navbar'
import { useAuthStore } from '../../store/authStore'
import { useProblemStore } from '../../store/problemStore'

const EASE = [0.16, 1, 0.3, 1] as const

const BEGINNER_POINTS = [
  'Core syntax, array loops, string operations',
  'Basic condition checks and defensive guards',
  'Standard input / output flow',
]

export default function StudentLevelSelect() {
  const navigate = useNavigate()
  const { setStudentLevel, setSelectedTrack, setOnboarded } = useAuthStore()
  const { setFilters } = useProblemStore()

  const startBeginner = () => {
    setSelectedTrack('student')
    setStudentLevel('Beginner')
    setFilters({ mode: 'student', difficulty: 'Easy' })
    setOnboarded(true)
    navigate('/home')
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#E5DFC9] flex flex-col selection:bg-[#E5DFC9]/25 selection:text-[#E5DFC9]">
      <Navbar variant="student" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="navy" size="sm">STUDENT TRACK ONBOARDING</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">HOW DO YOU WANT TO START?</h1>
          <p className="text-xs sm:text-sm text-[#E5DFC9]/70">
            Jump straight in at Beginner, or take a short placement test and we'll set your level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] h-full flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <Badge variant="default" size="sm">BEGINNER</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1">Start as Beginner</h3>
                <p className="text-xs text-[#E5DFC9]/70 leading-relaxed mb-4">
                  Build fundamentals and coding confidence from the ground up.
                </p>
                <div className="space-y-1.5 mb-6 bg-[#000000] p-3 rounded-xl border border-[#3A2F1D] text-xs text-[#E5DFC9]/80 font-mono">
                  {BEGINNER_POINTS.map((p) => (
                    <div key={p} className="flex items-center gap-1.5">
                      <Check size={11} className="text-[#E5DFC9] flex-shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button fullWidth size="md" variant="primary" onClick={startBeginner} iconRight={<ArrowRight size={14} />} className="font-bold text-xs">
                Start as Beginner
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08, ease: EASE }}>
            <Card className="p-6 bg-[#1A130D] border-[#3A2F1D] h-full flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#000000] border border-[#3A2F1D] text-[#E5DFC9] flex items-center justify-center">
                    <Compass size={20} />
                  </div>
                  <Badge variant="navy" size="sm">PLACEMENT TEST</Badge>
                </div>
                <h3 className="text-xl font-bold mb-1">Know your level</h3>
                <p className="text-xs text-[#E5DFC9]/70 leading-relaxed mb-4">
                  Three quick questions on complexity, error handling and memory. Your score places you at Beginner, Intermediate or Pro.
                </p>
                <div className="space-y-1.5 mb-6 bg-[#000000] p-3 rounded-xl border border-[#3A2F1D] text-xs text-[#E5DFC9]/60 font-mono">
                  <div>~3 minutes · multiple choice</div>
                  <div>No penalty for a low score — you can start anywhere</div>
                </div>
              </div>
              <Button
                fullWidth
                size="md"
                variant="secondary"
                onClick={() => navigate('/student/level-test')}
                iconRight={<ArrowRight size={14} />}
                className="font-bold text-xs"
              >
                Take the placement test
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean. (Watch for unused-import errors — the new file must not import anything it does not use; the list above is already minimal.)

- [ ] **Step 3: Build**

Run: `cd frontend && npx vite build`
Expected: `✓ built`, no errors.

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/student/StudentLevelSelect.tsx
git -c gc.auto=0 commit -m "feat(onboarding): StudentLevelSelect -> Start as Beginner | Know your level

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 8: `StudentLevelTest` — finish onboarding, go to `/home`

**Files:**
- Modify: `frontend/src/pages/student/StudentLevelTest.tsx`

**Interfaces:**
- Consumes: `useAuthStore` — add `setOnboarded` to the destructure (already uses `setStudentLevel`, `setSelectedTrack`).
- Produces: `handleStartTrack` sets the scored level, track, filters, **and `onboarded: true`**, then `navigate('/home')` (was `/student/problems`).

- [ ] **Step 1: Update the store destructure**

`StudentLevelTest.tsx` currently:

```tsx
  const { setStudentLevel, setSelectedTrack } = useAuthStore()
```

Change to:

```tsx
  const { setStudentLevel, setSelectedTrack, setOnboarded } = useAuthStore()
```

- [ ] **Step 2: Update `handleStartTrack`**

Currently:

```tsx
  const handleStartTrack = () => {
    setStudentLevel(recommendedLevel)
    setSelectedTrack('student')
    setFilters({
      mode: 'student',
      difficulty: recommendedLevel === 'Beginner' ? 'Easy' : recommendedLevel === 'Intermediate' ? 'Medium' : 'Hard',
    })
    navigate('/student/problems')
  }
```

Replace with:

```tsx
  const handleStartTrack = () => {
    setStudentLevel(recommendedLevel)
    setSelectedTrack('student')
    setFilters({
      mode: 'student',
      difficulty: recommendedLevel === 'Beginner' ? 'Easy' : recommendedLevel === 'Intermediate' ? 'Medium' : 'Hard',
    })
    setOnboarded(true)
    navigate('/home')
  }
```

- [ ] **Step 3: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/student/StudentLevelTest.tsx
git -c gc.auto=0 commit -m "feat(onboarding): StudentLevelTest completes onboarding and lands on /home

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 9: `ProLevelSelect` — retarget its guard redirect

**Files:**
- Modify: `frontend/src/pages/pro/ProLevelSelect.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: when a user without `hasPassedPromotionalTest` hits `/pro/level-select`, they are redirected to `/pro/entrance-test` (was `/pro/promotional-test`).

- [ ] **Step 1: Update the `useEffect` guard**

`ProLevelSelect.tsx` currently:

```tsx
  useEffect(() => {
    if (!hasPassedPromotionalTest) {
      navigate('/pro/promotional-test')
    }
  }, [hasPassedPromotionalTest, navigate])
```

Change the path:

```tsx
  useEffect(() => {
    if (!hasPassedPromotionalTest) {
      navigate('/pro/entrance-test')
    }
  }, [hasPassedPromotionalTest, navigate])
```

Leave `handleSelectLevel` (which navigates to `/pro/problems`) unchanged — this page is only reached by an already-onboarded user from the dashboard "Level" button, so it should not touch `onboarded`.

- [ ] **Step 2: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/pro/ProLevelSelect.tsx
git -c gc.auto=0 commit -m "refactor(pro): ProLevelSelect guard redirects to /pro/entrance-test

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 10: `HomeDashboard` — real zeros, no mock imports

**Files:**
- Modify: `frontend/src/pages/HomeDashboard.tsx`

**Interfaces:**
- Consumes: `useAuthStore` fields already in use (`user`, `hasPassedPromotionalTest`, `studentLevel`, `proLevel`, `setSelectedTrack`).
- Produces: dashboard stat tiles read `?? 0` from the real profile; no `mockProblems` import; the "Adaptive Recommendation" card renders only when the user has at least one recorded submission; the AI-Engineer "Take Promotional Test" button targets `/pro/entrance-test`.

- [ ] **Step 1: Remove the `mockProblems` import and derivation**

Delete this import line:

```tsx
import { mockProblems } from '../mock/problems'
```

Delete this block near the top of the component:

```tsx
  // Find recommended problem based on lowest catch rate
  const catchRates = user?.weaknessCatchRates || {}
  const sortedWeaknesses = Object.entries(catchRates).sort(([, a], [, b]) => a - b)
  const weakestClassId = sortedWeaknesses[0] ? sortedWeaknesses[0][0] : 'error-handling'
  const recommendedProblem = mockProblems.find((p) => p.defectClassId === weakestClassId) || mockProblems[0]
```

Add in its place:

```tsx
  const hasActivity = (user?.recentSubmissions?.length ?? 0) > 0
```

- [ ] **Step 2: Fix the greeting fallback**

Change:

```tsx
              Welcome back, {user?.name?.split(' ')[0] || 'Afrid'}
```

to:

```tsx
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
```

- [ ] **Step 3: Fix the four stat tiles**

In the "Performance Snapshot" grid, change each `|| N` to `?? 0`:

```tsx
                <p className="text-2xl font-extrabold text-[#E5DFC9]">{user?.problemsSolved ?? 0}</p>
```

```tsx
                <p className="text-2xl font-extrabold text-[#E5DFC9]">{user?.currentStreak ?? 0} <span className="text-xs font-normal">days</span></p>
```

```tsx
                <p className="text-2xl font-extrabold text-[#E5DFC9]">{user?.totalXP ?? 0}</p>
```

For Global Rank, show `—` until a rank exists:

```tsx
                <p className="text-2xl font-extrabold text-[#E5DFC9]">{user?.globalRank ? `#${user.globalRank}` : '—'}</p>
```

- [ ] **Step 4: Fix the level badge fallbacks**

Change the Student card badge:

```tsx
                    LEVEL: {studentLevel?.toUpperCase() || 'INTERMEDIATE'}
```

to:

```tsx
                    LEVEL: {studentLevel?.toUpperCase() || 'BEGINNER'}
```

Leave the AI-Engineer card badge (`proLevel?.toUpperCase() || 'BEGINNER'`) as-is.

- [ ] **Step 5: Retarget the promotional-test button**

In the AI-Engineer card, the not-passed branch has:

```tsx
                <Button
                  fullWidth
                  size="md"
                  variant="gold"
                  onClick={() => navigate('/pro/promotional-test')}
                  iconRight={<ArrowRight size={14} />}
                  className="font-bold text-xs shadow-md uppercase tracking-wider"
                >
                  Take Promotional Test →
                </Button>
```

Change `onClick` to `() => navigate('/pro/entrance-test')` and the label to `Take Entrance Test →`.

Also, in `handleStartPro`, change:

```tsx
    if (hasPassedPromotionalTest) {
      navigate('/pro/problems')
    } else {
      navigate('/pro/promotional-entry')
    }
```

to:

```tsx
    if (hasPassedPromotionalTest) {
      navigate('/pro/problems')
    } else {
      navigate('/pro/entrance-test')
    }
```

- [ ] **Step 6: Gate the recommendation card**

The "Adaptive Learning Callout" `<Card>` (the one with the `ADAPTIVE RECOMMENDATION` label and the `recommendedProblem.title` / `recommendedProblem.defectClassName` references) will no longer compile — `recommendedProblem` is gone. Replace that entire `<Card> … </Card>` block with:

```tsx
            {hasActivity && (
              <Card className="p-4 bg-[#1A130D] border-[#3A2F1D] space-y-3">
                <span className="text-xs font-mono uppercase tracking-wider text-[#E3A24A] font-bold flex items-center gap-1.5">
                  <Zap size={12} /> ADAPTIVE RECOMMENDATION
                </span>
                <p className="text-xs text-[#E5DFC9]/70">
                  Keep working your weakest defect classes — the practice list is sorted by your lowest catch rate.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/problems')}
                  className="w-full text-xs font-bold"
                >
                  Go to practice
                </Button>
              </Card>
            )}
```

(Uses the existing `Zap` import. `#E3A24A` is the sanctioned gold accent.)

- [ ] **Step 7: Type-check**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean. Fix any "declared but never read" errors by removing the now-unused import (likely none beyond `mockProblems`, already removed).

- [ ] **Step 8: Build**

Run: `cd frontend && npx vite build`
Expected: `✓ built`, no errors.

- [ ] **Step 9: Commit**

```bash
git -c gc.auto=0 add frontend/src/pages/HomeDashboard.tsx
git -c gc.auto=0 commit -m "fix(dashboard): show real zeroed profile, drop mock problem import

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

---

## Task 11: `App.tsx` — wire the gate and the new routes (makes the flow live)

**Files:**
- Modify: `frontend/src/App.tsx`

**Interfaces:**
- Consumes: `OnboardingRoute` (Task 2), `ProEntranceTest` (Task 3), `ProEntranceResult` (Task 4).
- Produces: the running end-to-end flow.

- [ ] **Step 1: Add imports**

Near the other imports in `App.tsx`:

```tsx
import { OnboardingRoute } from './components/auth/OnboardingRoute'
import ProEntranceTest from './pages/pro/ProEntranceTest'
import ProEntranceResult from './pages/pro/ProEntranceResult'
```

Remove the now-unused page imports:

```tsx
import ProPromotionalEntry from './pages/pro/ProPromotionalEntry'
import ProPromotionalTest from './pages/pro/ProPromotionalTest'
import ProPromotionalResult from './pages/pro/ProPromotionalResult'
import ProLevelTest from './pages/pro/ProLevelTest'
```

(If `ProLevelTest` is not imported in the current file, skip that line. Verify by reading the import block first.)

- [ ] **Step 2: Remove the promotional routes**

Delete these three `<Route>` elements:

```tsx
      <Route
        path="/pro/promotional-entry"
        element={
          <ProtectedRoute>
            <ProPromotionalEntry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/promotional-test"
        element={
          <ProtectedRoute>
            <ProPromotionalTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/promotional-result"
        element={
          <ProtectedRoute>
            <ProPromotionalResult />
          </ProtectedRoute>
        }
      />
```

If there is a `/pro/level-test` route pointing at `ProLevelTest`, delete it too.

- [ ] **Step 3: Add the entrance routes**

Add these two routes in the AI-Assisted Pro Track section (they use plain `ProtectedRoute` so a not-yet-onboarded user can reach them):

```tsx
      <Route
        path="/pro/entrance-test"
        element={
          <ProtectedRoute>
            <ProEntranceTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pro/entrance-result"
        element={
          <ProtectedRoute>
            <ProEntranceResult />
          </ProtectedRoute>
        }
      />
```

- [ ] **Step 4: Swap `ProtectedRoute` → `OnboardingRoute` on the app routes**

For **each** of these route paths, change the wrapper element from `<ProtectedRoute>…</ProtectedRoute>` to `<OnboardingRoute>…</OnboardingRoute>`:

`/home`, `/dashboard`, `/problems`, `/student/problems`, `/student/practice/:id`, `/practice/:id`, `/student/results/:id`, `/results/:id`, `/pro/problems`, `/pro/debug/:id`, `/pro/practice/:id`, `/pro/results/:id`, `/pro/level-select`, `/profile`, `/profile/:userId`, `/contest`, `/battle/:roomId`, `/learn/:conceptId`, `/exam`

**Leave `ProtectedRoute`** on: `/role-select`, `/student/level-select`, `/student/level-test`, `/pro/entrance-test`, `/pro/entrance-result`. (`/pro/level-select` moves to `OnboardingRoute` — it is a post-onboarding "change my tier" screen; its own `useEffect` still bounces a non-passed user to `/pro/entrance-test`.)

Do not remove the `ProtectedRoute` import — it is still used.

- [ ] **Step 5: Type-check + build**

Run: `cd frontend && npx tsc --noEmit`
Expected: clean (no unused-import errors — `ProPromotionalEntry` etc. must be gone from the import block).

Run: `cd frontend && npx vite build`
Expected: `✓ built`, no errors.

- [ ] **Step 6: Browser walkthrough (dev server)**

Start the dev server if not running: `cd frontend && npm run dev`. Then, in the browser, run each check. If Firebase is configured locally use a real signup; otherwise note which steps are auth-blocked.

- [ ] New signup (`/#/auth?mode=signup`) → after submit lands on **`/#/role-select`** (NOT `/home`).
- [ ] `/role-select` → **Student** → `/student/level-select` shows exactly two cards.
- [ ] "Start as Beginner" → `/#/home`. Stat tiles read `0`, `0 days`, `0`, `—`. Student card badge reads `LEVEL: BEGINNER`.
- [ ] Reload `/#/home` → stays on the dashboard, no flash of `/role-select`.
- [ ] "Switch Track" → `/#/role-select`. **AI Engineer** → `/#/pro/entrance-test`.
- [ ] Answer all 5 with the lowest-value options (deliberate fail) → `/#/pro/entrance-result` shows `SCORE n / 15 · UNLOCK AT 6` and "Not unlocked yet" with **Retake** + **Start the Student track instead**.
- [ ] "Start the Student track instead" → `/#/home`, onboarded (no bounce to `/role-select`).
- [ ] "Switch Track" → AI Engineer → entrance test → answer all with the `score: 3` options → `/#/pro/entrance-result` shows "AI-Engineer track unlocked" + tier `Pro`; **Continue** → `/#/home`; AI-Engineer card badge now reads `LEVEL: PRO` (not "PROMOTIONAL TEST REQUIRED").
- [ ] From `/#/home`, AI-Engineer card "Level" button → `/#/pro/level-select` renders (does not bounce).
- [ ] Log out → log back in → lands directly on `/#/home`, no chooser.
- [ ] Visit `/#/pro/entrance-result` directly (no state) → neutral "No result to show" screen.

- [ ] **Step 7: Commit**

```bash
git -c gc.auto=0 add frontend/src/App.tsx
git -c gc.auto=0 commit -m "feat(onboarding): gate app routes on onboarded, wire entrance-test routes

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_012181wrtyfEbJnMnUFrsZEn"
```

- [ ] **Step 8: Push**

```bash
git -c gc.auto=0 -c rebase.autoStash=true pull --rebase origin main
git -c gc.auto=0 push origin main
```

---

## Self-Review

**1. Spec coverage**

| Spec section | Task(s) |
|---|---|
| §Design 1 — `onboarded` field, `newUserDoc`, `AuthState`, snapshot sync, `setOnboarded`, rules `createFields`+`editableFields` | Task 1 (all of it, incl. `profileReady` which the spec's flash-avoidance note in §"Error handling" implies) |
| §Design 2 — `OnboardingRoute` component with the exact 3-way branch | Task 2 |
| §Design 2 — wrap the listed app routes; keep `ProtectedRoute` on the flow routes; `Auth.tsx` both branches → `/home` | Task 5 (Auth), Task 11 (route swap) |
| §Design 3 — Student two actions; "Start as Beginner" mutation set; "Know your level" → test; drop direct Int/Pro cards | Task 7 |
| §Design 3 — `StudentLevelTest.handleStartTrack` adds `setOnboarded(true)` + `/home` | Task 8 |
| §Design 4 — `RoleSelect.choosePro()` → `/pro/entrance-test`; already-passed branch sets `onboarded` + `/home` | Task 6 |
| §Design 4 — new `/pro/entrance-test`, 5-Q MCQ, /15, bands 6/10/13, eligible mutation set | Task 3 |
| §Design 4 — new `/pro/entrance-result`, eligible / not-eligible, "Start Student instead" | Task 4 |
| §Design 4 — retire `ProPromotionalEntry` / `ProLevelTest` / promotional routes; keep `ProLevelSelect` routed; its guard → `/pro/entrance-test` | Task 9 (guard), Task 11 (route removal + `ProLevelSelect` under `OnboardingRoute`) |
| §Design 5 — `?? 0` tiles, greeting fallback, drop `mockProblems`, gate the recommendation card, button targets | Task 10 |
| §Design 6 — component boundaries | honored: `OnboardingRoute` ~30 lines, `ProEntranceTest` self-contained, `ProEntranceResult` pure display, `setOnboarded` mirrors `setPassedPromotionalTest` |
| §Testing — tsc + build + browser walkthrough | every task ends with tsc; Tasks 3/4/7/10/11 add build; Task 11 Step 6 is the full walkthrough (mirrors the spec's list) |
| §Edge cases — write fail / missing field / direct nav to result / `hasPassedPromotionalTest && !onboarded` | write-fail: optimistic `set` in `setOnboarded` (Task 1 Step 6); missing field: `Boolean(undefined)` in Task 1 Step 5; direct nav: Task 4 Step 1 `if (!state)`; passed-but-not-onboarded: Task 6 Step 2 already-passed branch calls `setOnboarded(true)` |

No gaps.

**2. Placeholder scan** — no "TBD"/"handle edge cases"/"similar to Task N"/bare "write tests". Every code step has full code. The two "verify by reading the import block first" notes in Task 11 are conditional real instructions, not placeholders.

**3. Type consistency**

- `EntranceResultState` — defined and exported in Task 3, imported in Task 4. Fields `{ score, maxScore, eligible, tier }` used identically in both. `tier: LevelTier` in Task 3; Task 4 destructures `tier` and only renders it as text — compatible.
- `setOnboarded: (value: boolean) => void` — signature defined in Task 1, called as `setOnboarded(true)` in Tasks 3, 4, 6, 7, 8. Consistent.
- `profileReady` — set in Task 1 (`onAuthStateChanged` + snapshot callbacks + init), read in Task 2 only. Consistent.
- `hasActivity` — defined and used only within Task 10. Consistent.
- Difficulty ternary `Beginner→Easy / Intermediate→Medium / Pro→Hard` — identical in Tasks 3, 4, 7, 8. Consistent.
- Route paths: `/pro/entrance-test` and `/pro/entrance-result` — spelled identically in Tasks 3, 4, 6, 9, 10, 11.

No inconsistencies.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-30-post-login-onboarding-flow.md`. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
