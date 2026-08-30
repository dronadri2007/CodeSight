# Post-login onboarding flow — design

**Date:** 2026-08-30
**Status:** approved for planning
**Author:** HackHive + Claude

## Problem

After login, every user lands on `HomeDashboard` ("Welcome back, …" with
`Solved 18 / Streak 4 / Total XP 2847 / Global Rank #1`). Those numbers are
`|| N` fallbacks that fire whenever the real Firestore value is `0`, so a
brand-new account sees a fake veteran profile. There is also no forced
track-selection step — the app assumes the user already picked a track.

The desired flow:

1. After login, a user who has **not onboarded** must choose **Student** or
   **AI Engineer**.
2. **AI Engineer is locked by default.** Unlocking it requires an entrance
   test. One test decides **both** eligibility and placement tier
   (Beginner / Intermediate / Pro).
3. **Student** offers two entries: *Start as Beginner* (straight in) or
   *Know your level* (a placement test whose marks assign the tier).
4. Once onboarded (track + level chosen, persisted), later logins go
   straight to `/home`, which now shows the **real** Firestore profile
   (zeroed for new accounts).

## What already exists

Almost every screen is already built; the gap is wiring.

| Route | Page | Role today |
|---|---|---|
| `/role-select` | `RoleSelect` | Diagonal Student / AI-Engineer fork. `chooseStudent()` → `/student/level-select`; `choosePro()` → `hasPassedPromotionalTest ? /pro/level-select : /pro/promotional-test`. |
| `/student/level-select` | `StudentLevelSelect` | 3 direct level cards + "Know your level" → `/student/level-test`. |
| `/student/level-test` | `StudentLevelTest` | 3-question MCQ. Score /9: ≥8 Pro, ≥5 Intermediate, else Beginner. Sets `studentLevel`, navigates `/student/problems`. |
| `/pro/promotional-entry` | `ProPromotionalEntry` | Intro screen → `/pro/promotional-test`. |
| `/pro/promotional-test` | `ProPromotionalTest` | Line-flag + written finding, client-scored, pass ≥60 → `setPassedPromotionalTest(true)` → `/pro/promotional-result`. |
| `/pro/promotional-result` | `ProPromotionalResult` | Pass/fail screen; pass → `/pro/level-select`. |
| `/pro/level-select` | `ProLevelSelect` | 3 reviewer-tier cards (guarded by `hasPassedPromotionalTest`). Sets `proLevel`, navigates `/pro/problems`. |
| `/pro/level-test` | `ProLevelTest` | 3-question MCQ diagnostic. Score /9, same thresholds. Sets `proLevel`. |
| `/home` `/dashboard` | `HomeDashboard` | Mock stats via `|| N`; `mockProblems` import for the "Adaptive Recommendation" card. |

`authStore.user` is already fed from the Firestore `users/{uid}` snapshot via
`toProfile()`. The store already persists `selectedTrack`, `studentLevel`,
`proLevel`, `hasPassedPromotionalTest`.

## Design

### 1. Onboarding state

New boolean `onboarded` on the `users/{uid}` document.

- `frontend/src/store/authStore.ts`
  - `newUserDoc()` → add `onboarded: false`
  - `AuthState` → add `onboarded: boolean` (init `false`)
  - snapshot handler + `toProfile()`-adjacent sync → `onboarded: Boolean(d.onboarded)`
  - `stubProfile` path → `onboarded: false` until the doc hydrates
  - new action `setOnboarded(value: boolean)` → optimistic `set({ onboarded: value })` + `patchMyDoc(uid, { onboarded: value })`
- `firestore.rules`
  - add `'onboarded'` to `createFields()`
  - add `'onboarded'` to `editableFields()`
  - (owner re-publishes in the Firestore Rules tab)

`onboarded` is a client-writable profile-choice flag, same trust class as
`selectedTrack` — it gates only which screen shows first, never score data.

### 2. Routing gate

New component `frontend/src/components/auth/OnboardingRoute.tsx`:

```
authReady === false        → spinner (same as ProtectedRoute)
!isAuthenticated           → <Navigate to="/auth" state={{from}} replace/>
isAuthenticated && !onboarded → <Navigate to="/role-select" replace/>
else                       → children
```

`App.tsx` route changes:

- Wrap in `OnboardingRoute` (was `ProtectedRoute`): `/home`, `/dashboard`,
  `/problems`, `/profile`, `/profile/:userId`, `/student/problems`,
  `/student/practice/:id`, `/practice/:id`, `/student/results/:id`,
  `/results/:id`, `/pro/problems`, `/pro/debug/:id`, `/pro/practice/:id`,
  `/pro/results/:id`, `/pro/level-select`, `/contest`, `/battle/:roomId`,
  `/learn/:conceptId`, `/exam`
- Keep on plain `ProtectedRoute` (reachable while not onboarded):
  `/role-select`, `/student/level-select`, `/student/level-test`,
  `/pro/entrance-test` (new), `/pro/entrance-result` (new)
- `Auth.tsx`: both `onSubmit` branches and `social()` navigate to `/home`
  (delete the `isSignup ? '/role-select' : '/home'` split). The gate routes a
  non-onboarded user to `/role-select`.

### 3. Student path

`StudentLevelSelect` reworked to exactly two actions (drop the direct
Intermediate / Pro cards):

- **Start as Beginner** → `setSelectedTrack('student')`,
  `setStudentLevel('Beginner')`, `setOnboarded(true)`,
  `setFilters({ mode: 'student', difficulty: 'Easy' })`, `navigate('/home')`
- **Know your level** → `navigate('/student/level-test')`

`StudentLevelTest` — question set and thresholds unchanged. `handleStartTrack`
changes its tail: after `setStudentLevel(recommendedLevel)` +
`setSelectedTrack('student')` + `setFilters(...)`, also `setOnboarded(true)`
and `navigate('/home')` (was `/student/problems`).

### 4. AI-Engineer path (one combined test)

`RoleSelect.choosePro()`:

```
if (hasPassedPromotionalTest) {
  setSelectedTrack('pro'); setFilters({ mode: 'ai_engineer' }); navigate('/home')
} else {
  navigate('/pro/entrance-test')
}
```

**New route `/pro/entrance-test`** — `ProEntranceTest` page, built by
reshaping `ProPromotionalTest` into a 5-question code-review MCQ test using the
same card/progress UI as `ProLevelTest`. Five questions × 3 points = **15 max**.

| Score | Outcome |
|---|---|
| 0–5 | **Not eligible** |
| 6–9 | Eligible → **Beginner** reviewer |
| 10–12 | Eligible → **Intermediate** reviewer |
| 13–15 | Eligible → **Pro** reviewer |

On submit, navigate to **`/pro/entrance-result`** with
`{ score, maxScore: 15, eligible, tier }` in route state.

**New route `/pro/entrance-result`** — `ProEntranceResult`, built by reshaping
`ProPromotionalResult`:

- **Eligible:** `setPassedPromotionalTest(true)`, `setSelectedTrack('pro')`,
  `setProLevel(tier)`, `setFilters({ mode: 'ai_engineer', difficulty: … })`,
  `setOnboarded(true)`. Screen shows score + assigned tier + **Continue** →
  `/home`.
- **Not eligible:** no state mutation. Screen shows score + threshold +
  **Retake** (→ `/pro/entrance-test`) + **Start the Student track instead**
  (→ runs the Student "Start as Beginner" mutation set incl.
  `setOnboarded(true)`, then `/home`).

`ProEntranceTest.tsx` and `ProEntranceResult.tsx` are **new files** (seeded by
copying the relevant markup from `ProPromotionalTest.tsx` /
`ProPromotionalResult.tsx`, then adapting). The old files
`ProPromotionalTest.tsx`, `ProPromotionalResult.tsx`, `ProPromotionalEntry.tsx`,
and `ProLevelTest.tsx` are left in the tree but **unrouted** — the
`/pro/promotional-test`, `/pro/promotional-result`, and `/pro/promotional-entry`
route paths are removed from `App.tsx`. A later cleanup deletes the dead files.

`ProLevelSelect` **stays routed** at `/pro/level-select` (now under
`OnboardingRoute`) so the dashboard "Level" button lets an onboarded
AI-Engineer re-pick a tier without re-testing. Its `useEffect` guard
`if (!hasPassedPromotionalTest) navigate('/pro/promotional-test')` changes its
target to `/pro/entrance-test`.

### 5. HomeDashboard cleanup

`frontend/src/pages/HomeDashboard.tsx`:

- Four stat tiles: `user?.problemsSolved || 18` → `user?.problemsSolved ?? 0`;
  same for `currentStreak` (`|| 4`), `totalXP` (`|| 2847`), `globalRank`
  (`|| 1`). Rank tile shows `#0` becomes `—` when `globalRank === 0`.
- `Welcome back, {user?.name?.split(' ')[0] || 'Afrid'}` → fallback `'there'`.
- Remove `import { mockProblems }` and the `recommendedProblem` derivation.
  Render the "Adaptive Recommendation" card only when
  `(user?.recentSubmissions?.length ?? 0) > 0`; otherwise omit it. When shown,
  its button links to `/problems` (no fake per-defect targeting until the
  weakness data is real).
- Badge fallbacks `studentLevel?.toUpperCase() || 'INTERMEDIATE'` →
  `|| 'BEGINNER'`; `proLevel?.toUpperCase() || 'BEGINNER'` unchanged.
- Track cards, "Switch Track" (→ `/role-select`), "Level" buttons unchanged.
- AI-Engineer card "Take Promotional Test" button → `/pro/entrance-test`.

### 6. Component boundaries

- `OnboardingRoute` — one guard, one job; composes with `ProtectedRoute`'s
  concerns rather than duplicating auth logic (it can render `ProtectedRoute`
  internally, or repeat the two-line auth check — implementer's choice, keep it
  under ~25 lines).
- `ProEntranceTest` — self-contained: question bank constant + scoring +
  band mapping. Exposes nothing; navigates with a typed result object.
- `ProEntranceResult` — pure presentation of route state + the terminal
  mutation set. No fetching.
- `authStore.setOnboarded` — mirrors the existing `setPassedPromotionalTest`
  exactly (optimistic set + `patchMyDoc`).

## Data flow

```
login/signup ─▶ /home
                 │
     OnboardingRoute reads authStore.onboarded
                 │
        ┌────────┴─────────┐
   onboarded=false     onboarded=true
        │                   │
   /role-select         HomeDashboard (real Firestore profile)
        │
   ┌────┴─────┐
Student      AI Engineer
   │              │
/student/     /pro/entrance-test
level-select        │  (score /15)
   │          ┌─────┴──────┐
Start Beginner│        <6 not eligible ─▶ /pro/entrance-result (retake / go student)
  │  Know your│level     ≥6 ─▶ tier by band
  │      │    │              │
  │  /student/level-test     setPassed+setProLevel+setOnboarded
  │      │                   │
  └──────┴─── setStudentLevel+setOnboarded ──▶ /home
```

Every terminal onboarding action calls `setOnboarded(true)` **before**
`navigate('/home')`, so the gate lets the dashboard render on the next route
match. `setOnboarded` is optimistic, so no snapshot round-trip is required
before navigation.

## Error handling & edge cases

- **`patchMyDoc` write fails** (offline, rules): `setOnboarded` already did the
  optimistic `set`, so navigation still works this session; the flag re-reads
  as `false` on next login and the user repeats onboarding. Acceptable — no
  data loss, matches how the other profile setters already behave.
- **Firebase unconfigured** (`firebaseReady === false`): `authReady` is `true`
  and `isAuthenticated` is `false`, so `OnboardingRoute` → `/auth`, unchanged
  from today.
- **Returning user, `onboarded` field absent** (docs created before this
  change): `Boolean(undefined)` → `false` → they run onboarding once. Fine.
- **Direct navigation to `/pro/entrance-result` with no route state**: render a
  neutral "no result — take the test" state with a link to
  `/pro/entrance-test` (mirror `ProPromotionalResult`'s existing default).
- **`hasPassedPromotionalTest` true but `onboarded` false** (edge from manual
  data): `/role-select` → "AI Engineer" → `choosePro()` sees the flag → sets
  track + `/home`; the gate then needs `onboarded` too. So `choosePro()`'s
  already-passed branch must also call `setOnboarded(true)`.

## Testing

- No backend changes; backend test suite unaffected.
- Frontend has no page-level test runner. Verify by:
  1. `cd frontend && npx tsc --noEmit` clean
  2. `npx vite build` clean
  3. Browser walk-through against the dev server:
     - New signup → lands on `/role-select` (not `/home`)
     - Student → "Start as Beginner" → `/home`, stat tiles read `0 / 0 / 0 / —`
     - Student → "Know your level" → answer → `/home` at the scored tier
     - AI Engineer → entrance test, deliberately low score → `/pro/entrance-result`
       not-eligible → "Start Student track instead" → `/home`
     - AI Engineer → entrance test, high score → eligible + tier → `/home`,
       AI-Engineer card shows `LEVEL: <tier>`, not "PROMOTIONAL TEST REQUIRED"
     - Log out, log back in → straight to `/home`, no chooser
     - Dashboard "Switch Track" → `/role-select` reachable again
     - Dashboard "Level" (AI Engineer) → `/pro/level-select` works

## Files touched

| File | Change |
|---|---|
| `firestore.rules` | `onboarded` in `createFields` + `editableFields` |
| `frontend/src/store/authStore.ts` | `onboarded` state + `newUserDoc` + snapshot sync + `setOnboarded` |
| `frontend/src/components/auth/OnboardingRoute.tsx` | **new** guard |
| `frontend/src/App.tsx` | swap `ProtectedRoute`→`OnboardingRoute` on app routes; add `/pro/entrance-test`, `/pro/entrance-result` |
| `frontend/src/pages/Auth.tsx` | login + signup + social → `/home` |
| `frontend/src/pages/student/StudentLevelSelect.tsx` | two actions; `setOnboarded`; → `/home` |
| `frontend/src/pages/student/StudentLevelTest.tsx` | `setOnboarded`; → `/home` |
| `frontend/src/pages/pro/ProEntranceTest.tsx` | **new** (reshape of `ProPromotionalTest`) — 5-Q MCQ, /15, eligibility + band |
| `frontend/src/pages/pro/ProEntranceResult.tsx` | **new** (reshape of `ProPromotionalResult`) — eligible / not-eligible |
| `frontend/src/pages/pro/ProLevelSelect.tsx` | guard redirect target → `/pro/entrance-test` |
| `frontend/src/pages/HomeDashboard.tsx` | `?? 0` fallbacks, drop `mockProblems`, gate the recommendation card, button targets |
| `frontend/src/pages/RoleSelect.tsx` | `choosePro()` → `/pro/entrance-test`; already-passed branch calls `setOnboarded` |

Unrouted after this change (delete in a later cleanup): `ProPromotionalEntry.tsx`,
`ProPromotionalTest.tsx`, `ProPromotionalResult.tsx`, `ProLevelTest.tsx`. The
`/pro/promotional-entry`, `/pro/promotional-test`, `/pro/promotional-result`
route paths are removed from `App.tsx`.

## Out of scope

- Wiring tests to the backend `/promotion-test` + `/grade` endpoints
  (`STATUS_WIRING.md` decision 5) — tests stay client-side.
- Rebuilding the HomeDashboard weakness chart / adaptive engine on real data
  beyond hiding the fake card.
- Deleting the retired page files (separate cleanup).
- The SOLVE-vs-DEBUG `/problems` model (`STATUS_WIRING.md` decision 1).
