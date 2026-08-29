# Frontend ↔ backend wiring status

_Written overnight while the "wire up the whole website" request was pending._
_I did **not** do a blind full rebuild — every remaining page needs either a
product decision from you, a real feature build, or your Firebase config. This
doc is the map so we can do it fast together when you're back._

---

## What's already real (talks to the live backend)

| Route | Page | Endpoint(s) |
|---|---|---|
| `/` `/about` | Landing | — (redesigned this session) |
| `/auth` | Auth | Firebase Auth + Firestore — **blocked on your config** (see below) |
| `/pro/problems` | ProProblems | `GET /exercises?source=curated` |
| `/pro/debug/:id` `/pro/practice/:id` | ProDebugWorkspace | `GET /exercises/{id}` + `POST /grade` (+ telemetry). Firebase ID token is now auto-attached, so a signed-in attempt also writes XP / catch-rate to Firestore. |
| `/pro/results/:id` | ProReviewResults | renders the `GradeResponse` passed in navigation state |
| `/learn/:conceptId` | ConceptLearn | `GET /concept/{id}` + `GET/POST /concept/{id}/micro-check` |
| `/profile` `/profile/:userId` | Profile | `GET /profile/{session}` + `GET /profile/{session}/card` (still session-based — see decision 2) |

The full typed API client already exists in `frontend/src/api/*` — every backend
endpoint has a function. Wiring a page is "call the function + map the shape",
not "write the client".

---

## Blocked on your Firebase setup

`/auth` and everything behind `ProtectedRoute` can't run end-to-end until:

1. `frontend/.env.local` gets the six `VITE_FIREBASE_*` values → **restart `npm run dev`**.
2. Firestore **Rules** tab has the contents of `firestore.rules` → **Publish**.
3. Railway backend var `FIREBASE_SERVICE_ACCOUNT_JSON` = the whole service-account JSON.

Until then the app correctly locks to `/auth` and shows a "not configured" notice.

---

## Mock / not wired — and why each one isn't a simple swap

| Route | Page | Why it needs you |
|---|---|---|
| `/home` `/dashboard` | HomeDashboard | Reads `problemStore` + `authStore`. Post-Firebase the profile lives in Firestore (`authStore.user`), so this should read the live user, not `mockProblems`. Needs **decision 2**. |
| `/problems` | ProblemListHome | Two modes: "Student Scratch" (SOLVE) and "AI Code Fix" (DEBUG). Backend `/exercises` is **review-shaped only** (buggy code + defect class, no TC/SC, no "mode"). Needs **decision 1**. |
| `/student/*` (level-select, level-test, problems, practice/:id, results/:id) | Student* | The SOLVE track — write code, run tests, TC/SC grading — has **no backend by design** (it was cut earlier). It's client-side or nothing. Needs **decision 1 + 3**. |
| `/contest` `/battle/:roomId` | BattleLobby, BattleRoom | Multiplayer + ELO matchmaking. **Not built** — no `/battle/*` endpoints exist. `docs/ROADMAP_MULTIPLAYER.md` has the design. Needs **decision 4**. |
| `/exam` | PromotionExam | Calls `authStore.promoteToNextLevel()`, which is now a no-op (promotion is meant to be server-side). Needs **decision 5**. |
| `/pro/promotional-test` | ProPromotionalTest | Works today as a self-contained single-exercise gate (hardcoded SQL-injection snippet, client-side scoring). The *real* flow is `GET /promotion-test/{session}` → present N exercises → `POST /grade` each → `POST /promotion-test/{session}/evaluate`. That's a feature build. Needs **decision 5**. |
| `/role-select`, `/pro/level-select`, `/student/level-select` | *LevelSelect | Just set the track/tier in `authStore` (now → Firestore). These work; only cosmetic polish pending. |

### Unrouted dead code
~35 page files are **not referenced by `App.tsx`** (`Dashboard.tsx`, `LearnConcept.tsx`,
`ExerciseLibrary.tsx`, `MultiplayerBattle.tsx`, `pro/ProDashboard.tsx`, all of
`shared/*`, several `student/*` and `pro/*` variants). Safe to delete — it just
makes the tree confusing. Left them alone for now.

---

## Decisions I need from you

1. **`/problems` data model.** Show only backend review (DEBUG) exercises there,
   and keep the SOLVE track as its own client-side section? Or drop SOLVE from
   the nav entirely for the demo?
2. **Profile / XP / leaderboard source.** Firestore `users/{uid}` is now the
   profile store (your "full profile in Firestore" choice). Should HomeDashboard,
   Profile and Leaderboard read from Firestore (via `authStore.user` +
   client queries), and should `/leaderboard` be re-pointed at Firestore, or
   left on anonymous sessions for now?
3. **SOLVE track.** Keep it as a client-side-only complexity estimator for the
   demo, or cut it and make CodeSight review-only?
4. **Multiplayer.** Build the `/battle/*` backend + matchmaking, or cut Contest
   from the demo and leave the lobby as "coming soon"?
5. **Promotion.** Keep the client-side single-exercise gate, or build the real
   timed multi-exercise `/promotion-test` flow?

---

## Suggested order once decisions are made

1. **HomeDashboard** → read the live `authStore.user` (Firestore): tier badge,
   streak, XP, recent submissions, weakness chart. No new endpoint. _(needs #2)_
2. **Leaderboard** → `getLeaderboard()` + a small shape adapter. _(needs #2)_
3. **Delete the ~35 unrouted page files.** Low risk, big clarity win.
4. **ProblemListHome** → `listExerciseSummaries()` + adapter to the row shape. _(needs #1)_
5. **Promotion exam** real flow, or leave the gate. _(needs #5)_
6. **Multiplayer**, if in scope. _(needs #4)_

Nothing here is hard once the calls are made — most are an afternoon each.
