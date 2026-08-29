# Frontend API layer

Typed client for the CodeSight backend. Import from the barrel:

```ts
import { submitGrade, getSession, listExerciseSummaries, getSessionId } from '@/api' // or ../api
```

- **Live vs mock:** set `VITE_API_BASE_URL` (see `.env.example`) and every
  call hits the deployed backend. Unset → each function returns a local
  fixture or a small typed stub so the app still runs offline. A few
  (`getSkillCard`, `getTopic`, `predictTopic`) throw offline — those screens
  need the backend.
- **Backend is live now:** `https://codesight-code-review-production.up.railway.app`
  (Postgres, all endpoints, auto-deploys from `main`).
- **Session id:** `getSessionId()` returns/creates `localStorage["codesight_session_id"]`.
  `submitGrade` / profile / progress / session / integrity default to it — you
  usually don't pass it.
- Response shapes are in `types.ts` and mirror `../../CONTRACT.md`
  (snake_case, straight off the wire — don't rename fields).

## Screen → call map

| Screen | Call(s) |
|---|---|
| Problem list (`ProblemListHome`, `StudentProblems`, `ProProblems`) | `listExerciseSummaries({ tier, source: 'curated' })` |
| Review / debug workspace (`StudentWorkspace`, `ProDebugWorkspace`) | `getExerciseFile(id)`, then `getHint(id, n)` per hint, then `submitGrade({ exerciseId, selectedLines, explanation, hintsUsed, telemetry })` |
| Results (`StudentResults`, `ProReviewResults`) | the `GradeResponse` from `submitGrade` — `localisation`, `explanation`, `teaching`, `score_after_hints`, `integrity` |
| AI vs You | `getAiReview(exerciseId, selectedLines)` |
| Dashboard / weakness | `getProfile()`, `getProgress()` |
| Concept learn (`ConceptLearn`) | `getConcepts()`, `getConcept(id)`, then `getMicroCheck(id)` / `submitMicroCheck(id, answers)` |
| Tier badge + gating | `getSession()` → `{ tier, next_tier, promotion_test_available }` |
| Promotion exam (`PromotionExam`) | `getPromotionTest()` → 3 ids → run them through the normal grade flow → `evaluatePromotion()` |
| Leaderboard | `getLeaderboard({ sessionId: getSessionId(), limit, tier })` — `you` row included |
| Skill card (share) | `getSkillCard()` |
| Topic prediction (new mode) | `listTopics()`, `getTopic(id)`, `predictTopic(id, classes)` |
| Report a bad exercise | `reportExercise(exerciseId, getSessionId(), reason)` |
| Mentor / integrity view | `getSessionIntegrity({ verdict, limit })` |

## Integrity telemetry (optional, on the workspace)

`submitGrade({ ..., telemetry })` where `telemetry` is
`{ time_to_submit_ms, paste_count, pasted_chars, tab_blur_count, tab_blur_ms, keystroke_count }`.
Capture on the explanation field: `paste` events → count + `clipboardData` length;
`keydown` → `keystroke_count`; `document` `visibilitychange` → blur count + summed
hidden time; a timer from workspace mount → submit. Omit `telemetry` entirely and
`integrity` in the response is `null`. It never changes the score — display only.
