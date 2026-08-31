# Frontend Integration — Sub-project A: API Client + Firebase Auth Foundation

**Date:** 2026-08-31
**Branch:** `feat/fe-integration-a` (off `adb1697` — the replacement frontend + backend-polish)
**Team HackHive · Tech Eximius 2026**

The shared data layer every other sub-project (B–E) builds on: a typed API client
for the FastAPI backend, a real Firebase auth context (replacing the current fake
one), and route-gating. Nothing else in the frontend can talk to the backend
until this ships.

This is **sub-project A of a 5-part decomposition** (A: foundation · B: code-review
experience · C: analytics/learn/admin · D: code-execution backend + Student
write-code track · E: multiplayer backend + battle). A has its own spec → plan →
build cycle; B–E follow.

---

## 1. Context

### The replacement frontend (`adb1697`, by a teammate)

A complete UI rewrite: shadcn/ui + three.js/shaders, `wouter` routing, React
**Context** for state (not zustand, though `zustand` is a dep), 17 pages, `axios`
in deps (currently unused). **Every page renders hardcoded mock data** from
`src/data/codesight.ts` with fake handlers (`toast.success(...)`, hardcoded
"GRADE: 95/100"). No backend calls anywhere. `firebase@^12.18.0` is a dep but
`getAuth`/`firestore` appear nowhere in `src/`.

Providers are wired in `src/App.tsx` (not `main.tsx`), outer → inner:
`ErrorBoundary → AuthProvider → TrackProvider → ThemeProvider(defaultTheme="dark")
→ SoundProvider → TooltipProvider`, then `<Toaster/>` (sonner) + `<MainContent/>`.
`MainContent` renders `<AppShell><Router onOpenAuth={…}/></AppShell>` for **every**
route and overlays `<AuthModal/>` when `location` is `/login` or `/register`
(currently `AuthModal.onClose` hard-redirects to `/dashboard`). The `<Route>`
list lives in an inner `Router` component that receives an `onOpenAuth` callback.

`/` → `Home` → shows a one-time `CodeSightIntro` animation, then renders
`AuthLandingPage` (19KB, the real sign-in/marketing surface). So
`AuthLandingPage` is reached through `/`, not its own route.

Current `src/contexts/AuthContext.tsx`: fake. `user` is a hardcoded
`DEFAULT_PROFILE` ("Alex Morgan"), `isAuthenticated` is
`localStorage['codesight_authed'] === 'true'`, `login(name)` just sets that flag.
`useAuth()` returns `{ user, isAuthenticated, login, logout, addSubmission,
promoteUserLevel, updateWeakness }`. Consumers so far: `AuthModal.tsx`
(email/pw/name form, no OAuth buttons), and page widgets reading `user.*`.

`src/App.tsx` shows `<AuthModal/>` when the route is `/login` or `/register`; it
does **not** hard-gate any page on auth today.

### The previous frontend (`fe201c9`, in git history) — the port source

A full, contract-accurate, **browser-verified-this-session** layer:

- `src/api/` (13 files): `client.ts` (fetch wrapper, `USE_MOCK`, `ApiError`,
  bearer-token injection via `lib/authToken`), `types.ts` (CONTRACT.md mirror),
  and domain modules `exercises` `grade` `concepts` `topics` `aiReview`
  `integrity` `leaderboard` `profile` `session` `admin` `index`.
- `src/lib/`: `firebase.ts` (client SDK singletons, `firebaseReady`,
  `requireAuth()`, `requireDb()`, `googleProvider`, `githubProvider`),
  `authToken.ts` (`getIdToken()`), `session.ts` (`getSessionId()` /
  `resetSessionId()`, localStorage key `codesight_session_id`).
- `src/store/authStore.ts` (zustand): the full Firebase flow —
  `newUserDoc(u, provider)` (Firestore `users/{uid}` schema), `ensureUserDoc`,
  `patchMyDoc(uid, data)`, `signUpEmail` / `signInEmail` /
  `signInWithProvider('google'|'github')` (popup + `auth/*` error mapping),
  `onAuthStateChanged` wiring with a `profileReady` gate and an
  `onSnapshot(users/{uid})` profile listener.

### Backend (already live, `adb1697` includes the hardened build)

Deployed on Railway; `CONTRACT.md` at repo root is the endpoint contract.
`app/firebaseauth.py` already verifies ID tokens (`maybe_user` dependency,
`Authorization: Bearer <token>`) and does **server-authoritative** Firestore
writes to `users/{uid}` from `/grade` and `/promotion-test` via the Admin SDK
(`FIREBASE_SERVICE_ACCOUNT_JSON` is set on Railway). The Admin SDK bypasses
security rules, so the backend is the only writer of XP / rank / catch-rate.

`.env.local` (gitignored, present locally) already has
`VITE_API_BASE_URL=https://codesight-code-review-production.up.railway.app` and
all six `VITE_FIREBASE_*` values (project `codesight-2cef4`). So in this
deployment `USE_MOCK` is `false` and `firebaseReady` is `true`.

`firestore.rules` at repo root gates client writes to `users/{uid}` by a
`createFields()` / `editableFields()` allow-list. It has **not** been re-published
to the Firebase console since the last schema change — a standing blocker, folded
into this sub-project (§7).

### Decisions taken (from brainstorming)

1. **Approach: port the proven layer + fresh AuthContext.** Copy `fe201c9`'s
   `api/` + `lib/` near-verbatim; strip the `USE_MOCK` mock-fixture branches (the
   new app always has a backend URL). Keep the `fetch` client — no switch to
   `axios`. Rewrite `AuthContext` internals against real Firebase while keeping
   the `useAuth()` surface so pages keep compiling.
2. **`session_id` for signed-in users: derived from the Firebase uid** —
   `web-<uid>`. Stable across devices for one account. Anonymous users keep the
   random `localStorage['codesight_session_id']`.
3. **Profile gaps: store extras in the Firestore doc.** The client writes
   `displayName`, `photoURL`, `provider`, `track`, `level`, `levelIndex`,
   `streakDays`, `lastActiveDate`, `createdAt` into `users/{uid}`. The backend
   keeps owning `totalXP`, `problemsSolved`, `eloRating`, `recentSubmissions`,
   `weaknessCatchRates`, `updatedAt`.
4. **A includes route-gating + the landing page.** `AuthLandingPage` is wired to
   real auth and a `ProtectedRoute` (wouter) redirects signed-out users away from
   gated routes.

### Non-goals for A

- Wiring any feature page to its data endpoint (Problems, grade, profile,
  leaderboard, concepts, admin, …) — that is B and C.
- The onboarding / track-selection flow (`selectedTrack`, `studentLevel`,
  `proLevel`, `hasPassedPromotionalTest`, `onboarded`, promotion tests). A writes
  only a `track`/`level` **default**; the real selection UX is B/C.
- Any new backend endpoint. `firebaseauth.py` already does what A needs.
- Code execution (D) and multiplayer (E).
- Replacing `wouter` or the Context pattern with anything else.

---

## 2. File manifest

### Ported near-verbatim from `fe201c9` (adapt imports to `@/`, strip mock branches)

| New path | From | Changes |
|---|---|---|
| `src/lib/firebase.ts` | same | none (reads `VITE_FIREBASE_*`) |
| `src/lib/authToken.ts` | same | none |
| `src/lib/session.ts` | same | add `setSessionId(id)` + make `getSessionId()` prefer an explicit override (see §4) |
| `src/api/client.ts` | same | none |
| `src/api/types.ts` | same | none — it already mirrors the current CONTRACT.md (paginated `/exercises` envelope included) |
| `src/api/exercises.ts` | same | drop `USE_MOCK` branch + `../mock/*` import; keep the live `api.get/post` calls |
| `src/api/grade.ts` | same | drop mock branch |
| `src/api/aiReview.ts` | same | drop mock branch |
| `src/api/concepts.ts` | same | drop mock branch |
| `src/api/topics.ts` | same | drop mock branch |
| `src/api/profile.ts` | same | drop mock branch |
| `src/api/progress.ts` | `fe201c9` (was folded into profile/index — see note) | domain module for `/progress/{session_id}` |
| `src/api/leaderboard.ts` | same | drop mock branch |
| `src/api/session.ts` | same | drop mock branch; `getSession` / `getPromotionTest` / `evaluatePromotion` |
| `src/api/integrity.ts` | same | drop mock branch |
| `src/api/admin.ts` | same | drop mock branch; `adminLogin`, `adminStats`, `adminListExercises`, `adminGetExercise`, `adminCreate/Update/Delete`, `adminSetReview` |
| `src/api/index.ts` | same | re-export surface |

If a `fe201c9` module has no separate file (e.g. `/progress` lived in
`index.ts`), create the module fresh from `CONTRACT.md` following the same
pattern (`import { api } from './client'`, typed, no mock).

### New / rewritten

| Path | Purpose |
|---|---|
| `src/contexts/AuthContext.tsx` | **rewrite** — real Firebase; same `useAuth()` surface + new methods (§3) |
| `src/lib/profile.ts` | `mapProfile(uid, doc, rank?)` — Firestore doc → the `UserProfile` the pages read (§5) |
| `src/components/auth/ProtectedRoute.tsx` | wouter guard — redirect signed-out users to `/` (or a `?next=` return) (§6) |
| `src/components/auth/FirebaseNotConfigured.tsx` | shown when `firebaseReady === false` |

### Edited

| Path | Change |
|---|---|
| `src/components/AuthModal.tsx` | real submit (email/pw sign-in + sign-up toggle), Google + GitHub buttons, error display, loading state |
| `src/pages/AuthLandingPage.tsx` | wire its CTAs to `login` / `signup` / provider sign-in; post-auth redirect |
| `src/App.tsx` | in the inner `Router`: wrap gated routes in `<ProtectedRoute>`. In `MainContent`: `configured === false` → render `<FirebaseNotConfigured/>` instead of `<AppShell>`; replace `AuthModal.onClose`'s hard `/dashboard` redirect with the `?next` logic (§6). `Home.tsx` is untouched (still renders `AuthLandingPage`). |
| `firestore.rules` (repo root) | `createFields()` / `editableFields()` updated to the §5 schema |
| `frontend/.env.example` | already lists the vars — verify it matches |
| `frontend/package.json` | remove `axios` if nothing else uses it after A (optional; low priority) |

---

## 3. `AuthContext` — the rewrite

`useAuth()` keeps every current member so existing consumers compile, and gains
the real auth methods.

```ts
interface AuthContextType {
  // state
  user: UserProfile | null          // null until the profile doc has loaded
  firebaseUser: import('firebase/auth').User | null
  isAuthenticated: boolean
  authReady: boolean                // onAuthStateChanged has fired at least once
  profileReady: boolean             // the users/{uid} snapshot has resolved (or user is anon)
  configured: boolean               // = firebaseReady

  // auth actions
  signup: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>      // NOTE: signature change from login(name)
  loginWithProvider: (p: 'google' | 'github') => Promise<void>
  logout: () => Promise<void>

  // kept for source compatibility — now server-authoritative no-ops (§3.4)
  addSubmission: (...args: unknown[]) => void
  promoteUserLevel: () => boolean
  updateWeakness: (...args: unknown[]) => void
}
```

`login`'s signature changes from `login(name: string)` to
`login(email, password)`. `AuthModal` and `AuthLandingPage` are the only callers
and are edited in this sub-project, so the break is contained. Any other caller
found during implementation is updated in the same task.

### 3.1 Initialisation

On mount, if `!firebaseReady`: set `configured=false`, `authReady=true`,
`profileReady=true`, `user=null`; the app renders `<FirebaseNotConfigured/>`.

Otherwise subscribe `onAuthStateChanged(requireAuth(), fbUser => …)`:

- **signed out:** `firebaseUser=null`, `isAuthenticated=false`, `user=null`,
  `profileReady=true`, `authReady=true`. Call `resetSessionId()` **only on an
  explicit `logout()`**, not on every signed-out callback (avoids nuking an
  anonymous session on load).
- **signed in:** `firebaseUser=fbUser`, `isAuthenticated=true`,
  `authReady=true`, `profileReady=false`. Set the derived session id:
  `setSessionId('web-' + fbUser.uid)`. Then `ensureUserDoc(fbUser)` (create the
  doc if missing, §5), and open `onSnapshot(doc(requireDb(),'users',fbUser.uid))`:
  - snapshot exists → `user = mapProfile(uid, snap.data(), rank?)`,
    `profileReady=true`.
  - snapshot missing / error → `user = mapProfile(uid, {}, null)` (safe zeros),
    `profileReady=true`, log the error.
  - the listener is torn down on the next auth change / unmount.

`globalRank` for `mapProfile` comes from a one-shot
`getLeaderboard({ session_id })` on sign-in and on a light interval (or on demand
from pages) — A fetches it once at sign-in and stores it; refresh is a B/C
concern.

### 3.2 `signup(email, password, name)`

`createUserWithEmailAndPassword` → `updateProfile(cred.user, { displayName: name })`
→ `setDoc(users/{uid}, newUserDoc(cred.user, 'password', name))` (§5). The
snapshot listener then populates `user`.

### 3.3 `login` / `loginWithProvider` / `logout`

- `login(email, password)` → `signInWithEmailAndPassword`. Errors mapped:
  `auth/invalid-credential` / `auth/wrong-password` / `auth/user-not-found` →
  "Email or password is incorrect."; `auth/too-many-requests` → "Too many
  attempts, try again shortly."; else the raw message.
- `loginWithProvider(p)` → `signInWithPopup(requireAuth(), p==='google' ?
  googleProvider : githubProvider)` → `ensureUserDoc(cred.user, p)`. Errors:
  `auth/popup-closed-by-user` → silent; `auth/account-exists-with-different-credential`
  → a clear message; `auth/unauthorized-domain` → "This domain isn't authorised
  in Firebase — add it under Authentication → Settings." (a known deploy step).
- `logout()` → `signOut(requireAuth())` then `resetSessionId()`.

Auth actions set a `pending` flag and surface errors via a returned rejection
(callers `try/catch` and show a message); the context also exposes the last
error string for the modal.

### 3.4 The kept-for-compat mutators

`addSubmission`, `updateWeakness`, `promoteUserLevel` currently mutate local
state. The backend's `/grade` call (sub-project B) is server-authoritative — it
writes `recentSubmissions` / `weaknessCatchRates` / `totalXP` / `problemsSolved`
/ `eloRating` to `users/{uid}` via the Admin SDK, and the `onSnapshot` listener
reflects it within ~1s. So in A these become **no-ops** that log a
`console.debug` once ("addSubmission is server-authoritative; ignoring
client write"). They stay on the interface only so the ~mock call sites keep
compiling until B/C remove them.

`promoteUserLevel` returns `false` (promotion is a B/C flow via
`/promotion-test`).

---

## 4. `session_id` policy

`src/lib/session.ts` gains an in-memory override:

```ts
let override: string | null = null
export function setSessionId(id: string) { override = id }
export function getSessionId(): string {
  if (override) return override
  // ... existing localStorage logic ...
}
export function resetSessionId(): string {
  override = null
  // ... existing localStorage clear ...
}
```

- Anonymous: `getSessionId()` → the random `localStorage['codesight_session_id']`
  (created once, as today).
- Signed in: `AuthContext` calls `setSessionId('web-' + uid)` in the
  signed-in branch of `onAuthStateChanged`. Every api module that defaults a
  `sessionId` param to `getSessionId()` then uses the uid-derived id
  automatically.
- `logout()` clears the override, so the browser falls back to its anonymous id.

The bearer token is attached by `client.ts` on **every** request independently
(via `getIdToken()`), so a signed-in `/grade` sends both `session_id: web-<uid>`
in the body and `Authorization: Bearer <token>` — matching CONTRACT.md.

---

## 5. Firestore `users/{uid}` schema + `mapProfile`

### The doc

Written on create by the client (`newUserDoc`), then co-owned:

```
users/{uid} {
  // identity — client writes on create, patch on profile edit
  uid: string
  email: string
  displayName: string
  photoURL: string | null
  provider: 'password' | 'google' | 'github'
  createdAt: <serverTimestamp>

  // track/level — client writes a DEFAULT on create; real selection is B/C
  track: 'student' | 'engineer'        // default 'student'
  level: 'beginner' | 'intermediate' | 'pro'   // default 'beginner'
  levelIndex: number                    // default 0

  // engagement — client-owned, patched on app load when the day rolls over
  streakDays: number                    // default 0
  lastActiveDate: string                // 'YYYY-MM-DD', default today on create

  // progress — BACKEND-owned (Admin SDK, from /grade & /promotion-test). Never written by the client.
  totalXP: number
  problemsSolved: number
  eloRating: number
  recentSubmissions: Array<{ exerciseId, defectClass, localisationScore, explanationScore, scoreAfterHints, pass, timestamp }>
  weaknessCatchRates: Record<defectClass, number>   // 0..100
  updatedAt: <serverTimestamp>
}
```

### Streak update (client, on app load)

When `profileReady` and `isAuthenticated`: compare `lastActiveDate` to today
(local). If today == lastActiveDate → nothing. If today == lastActiveDate + 1 →
`patchMyDoc(uid, { streakDays: streakDays + 1, lastActiveDate: today })`. If the
gap is larger → `{ streakDays: 1, lastActiveDate: today }`. One patch per day
per device; idempotent.

### `mapProfile(uid, doc, rank): UserProfile`

Maps to the shape pages already read (`src/contexts/AuthContext.tsx`
`UserProfile`). Concrete mapping:

| `UserProfile` field | source |
|---|---|
| `name` | `doc.displayName` ?? `email.split('@')[0]` ?? `'Reviewer'` |
| `handle` | `'@' + (doc.displayName ?? email-local).toLowerCase().replace(/\s+/g,'')` |
| `avatar` | `doc.photoURL` ?? `''` (UI falls back to initials) |
| `level` | map `(doc.track, doc.level)` → the 6-value `UserLevel` enum: `'Student Beginner'` … `'AI Engineer Pro'` |
| `levelIndex` | `doc.levelIndex ?? 0` |
| `xp` | `doc.totalXP ?? 0` |
| `globalRank` | `rank ?? 0` (from `/leaderboard` `you.rank`) |
| `streakDays` | `doc.streakDays ?? 0` |
| `solvedCount` | `doc.problemsSolved ?? 0` |
| `history` | `(doc.recentSubmissions ?? []).map(→ SubmissionRecord)` — `score` = `round(scoreAfterHints*100)`, `date` = `timestamp.slice(0,10)`, `defectClass` mapped to the frontend's `DefectClass` label, TC/SC fields `'—'` (no source; Student write-code track is D) |
| `defectStats` | from `doc.weaknessCatchRates`: for each of the 6 classes, `{ successful: round(rate/100 * total), total }` where `total` = attempts in `recentSubmissions` for that class (best effort; `{0,0}` when unknown) |

The `DefectClass` label mismatch (frontend `'SQL Injection' | 'Unchecked
Returns' | …` vs backend `'injection' | 'auth' | 'error-handling' |
'concurrency' | 'logic' | 'resource'`) gets one `CLASS_LABEL` map in
`src/lib/profile.ts`, used both directions.

---

## 6. Route-gating

`src/components/auth/ProtectedRoute.tsx` (wouter):

```tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authReady, isAuthenticated } = useAuth()
  const [location, setLocation] = useLocation()
  if (!authReady) return <FullscreenSpinner />
  if (!isAuthenticated) {
    // remember where they were headed
    sessionStorage.setItem('codesight_next', location)
    setLocation('/')       // landing; AuthLandingPage handles sign-in
    return null
  }
  return <>{children}</>
}
```

In the inner `Router` in `src/App.tsx`, wrap the **workspace** routes (everything
that should require sign-in — `/home`, `/dashboard`, `/problems`, `/practice*`,
`/code-review`, `/ai-engineer`, `/code-xray`, `/false-positive`, `/arena`,
`/contest`, `/challenges`, `/write`, `/learn`, `/progress`, `/leaderboard`,
`/profile`, `/admin`, plus the `/student*` and `/pro*` shells) in
`<ProtectedRoute>`. Leave `/`, `/intro`, `/auth`, `/login`, `/register` public.
After a successful `login`/`signup`/provider sign-in, read
`sessionStorage['codesight_next']` (fallback `/home`), clear it, and
`setLocation(next)` — this replaces the current `AuthModal.onClose` →
`/dashboard` behaviour.

`/admin` stays inside `<ProtectedRoute>` **and** additionally shows its own
password wall in sub-project C (the admin bearer-token flow is separate from
Firebase). A only Firebase-gates it.

---

## 7. Firestore rules

`firestore.rules` `createFields()` / `editableFields()` updated to the §5 schema:

- **createFields** (client `setDoc` on signup): `uid, email, displayName,
  photoURL, provider, createdAt, track, level, levelIndex, streakDays,
  lastActiveDate`.
- **editableFields** (client `updateDoc` / `patchMyDoc`): `displayName, photoURL,
  track, level, levelIndex, streakDays, lastActiveDate, updatedAt`.
- The backend-owned fields (`totalXP`, `problemsSolved`, `eloRating`,
  `recentSubmissions`, `weaknessCatchRates`) are **not** in either list — the
  Admin SDK bypasses rules, so it writes them; a client attempt to set them is
  rejected, which is correct.
- `allow read: if request.auth != null && request.auth.uid == uid;`
  (unchanged — a user reads only their own doc).

**Human step (blocking for deploy, not for local dev):** after this branch
merges, paste `firestore.rules` into Firebase console → Firestore → Rules →
Publish. Local dev against the deployed Firestore works because the create/patch
field sets are a superset-safe change for a brand-new doc, but existing rules
will reject the new `track`/`streakDays` fields until re-published. Flagged again
in the plan.

---

## 8. Error / loading / empty states

- `firebaseReady === false` → `<FirebaseNotConfigured/>` (full-screen, lists the
  missing `VITE_FIREBASE_*` vars by name). Local `.env.local` has them, so this
  is a deploy-misconfig guard.
- `authReady === false` → a minimal full-screen spinner (no app shell).
- `isAuthenticated && !profileReady` → the app shell renders with skeleton user
  data; `user` is `null`, consumers must null-guard (the mapper never returns
  `null` once `profileReady`, but the window before it exists).
- API `ApiError` from `client.ts` propagates; A does not add global handling
  (that's per-page in B/C). A's own `/leaderboard` rank fetch swallows errors
  (rank falls back to `0`).
- Auth errors → surfaced string on the context + shown inline in `AuthModal` /
  `AuthLandingPage`.

---

## 9. Testing

No frontend test runner in this repo. Verification cycle:

1. **`npx tsc --noEmit`** from `frontend/` — clean. (The `login` signature change
   and the `UserProfile` becoming `| null` will surface every consumer; each is
   fixed in-branch.)
2. **`npx vite build`** — `✓ built`.
3. **Browser walkthrough** on `localhost` against the **deployed** backend
   (`VITE_API_BASE_URL` from `.env.local`):
   - App loads → landing page, no crash, `firebaseReady` true.
   - **Sign up** (email/pw) → redirected to `/home` (or `?next`), `users/{uid}`
     doc created in Firestore with the §5 create fields, `user.name` shows.
   - **Sign out** → back to landing, `codesight_session_id` override cleared.
   - **Sign in** (same email/pw) → `/home`, profile loads from the existing doc.
   - **Google sign-in** → popup → doc ensured → `/home`. (GitHub same if a test
     account is handy; otherwise note it as manually unverified.)
   - **Protected route while signed out**: visit `/problems` directly → redirected
     to `/`; after sign-in, land on `/problems`.
   - **Token reaches the backend**: with the network tab open, confirm a request
     the app already makes (A adds the leaderboard rank fetch on sign-in) carries
     `Authorization: Bearer …` and returns 200; the `session_id` param is
     `web-<uid>`.
   - **Anonymous**: in a fresh profile/incognito, without signing in, confirm
     `getSessionId()` returns a `web-<random>` id and no `Authorization` header is
     sent.
   - **Streak**: sign in, reload — `lastActiveDate` set; simulate a day rollover
     by editing the doc's `lastActiveDate` to yesterday and reloading → `streakDays`
     increments by 1.
4. Confirm the existing pages still render (they're still on mock data — A must
   not break their compile or their current behaviour).

---

## 10. Execution model

Subagent-driven (`superpowers:subagent-driven-development`): fresh implementer
per task, task review + fix loop, final whole-branch review, ledger at
`.superpowers/sdd/2026-08-31-fe-integration-A/progress.md`.

**Task shape for the plan (indicative):**

1. Port `src/lib/` (firebase, authToken, session + `setSessionId`).
2. Port `src/api/` (client, types, all domain modules; mock branches stripped).
   `tsc` clean against the ported files in isolation.
3. `src/lib/profile.ts` — `mapProfile` + `CLASS_LABEL` + the `UserLevel` mapping.
4. `AuthContext` rewrite — Firebase init, `onAuthStateChanged`, `onSnapshot`,
   `signup`/`login`/`loginWithProvider`/`logout`, session-id override, kept
   no-op mutators.
5. `AuthModal` — real submit, OAuth buttons, error/loading.
6. `ProtectedRoute` + `FirebaseNotConfigured` + `App.tsx` wiring +
   `AuthLandingPage` CTA wiring + post-auth redirect.
7. Streak update on app load.
8. `firestore.rules` update.
9. `tsc --noEmit` + `vite build` green across the whole frontend; fix every
   consumer the `login` / `user: |null` changes surfaced.
10. Browser walkthrough (§9) + fixes.

---

## 11. Risks

| risk | mitigation |
|---|---|
| `login(name)` → `login(email,pw)` breaks callers beyond the two known | task 9 is a full-frontend `tsc` sweep; every call site fixed in-branch |
| Ported `api/types.ts` drifted from the current CONTRACT.md | it was regenerated this session for the paginated `/exercises` envelope; task 2 diffs it against `CONTRACT.md` and reconciles |
| Firestore rules reject the new create fields until re-published | §7 human step; local dev on a brand-new doc still works; plan flags it before any deploy |
| `onSnapshot` + `onAuthStateChanged` listener leaks on fast auth toggling | each subscribe returns an unsub stored in a ref; torn down on the next auth event and on unmount (mirrors `fe201c9`'s pattern) |
| `web-<uid>` session id collides with a pre-existing anonymous `web-<uuid>` | `uid` is a Firebase 28-char id, `crypto.randomUUID()` is 36 chars with dashes — no overlap; and a collision would only merge one user's own data |
| The teammate re-pushes the frontend again mid-build | rebase `feat/fe-integration-a` onto the new tip; A's files are almost all new (`api/`, `lib/`, `contexts/AuthContext.tsx`) so conflicts are limited to `App.tsx` + `AuthModal.tsx` |
| `axios` left unused inflates the bundle | low priority; remove in task 2 or leave for a later cleanup |
