# Task A — wire the frontend to the live backend

**Priority: blocking.** Nothing in the product works end to end until this is
done. Backend is live and stable; the frontend still runs on mock data.

- **Owner:** frontend pair
- **Estimate:** ~1 day
- **API base URL:** `https://codesight-code-review-production.up.railway.app`
- **Contract:** every request/response shape is in [`CONTRACT.md`](../CONTRACT.md) — build against that, not against guesses.

---

## What to do

### 1. One API client module

Create `frontend/src/lib/api.ts` (or similar):

- Read base URL from `import.meta.env.VITE_API_BASE_URL`, fallback to the
  Railway URL above. Add `VITE_API_BASE_URL` to `.env` / Vercel env.
- One `request()` helper: JSON headers, throws on non-2xx with the response
  body, returns parsed JSON.
- One typed function per endpoint (types mirror `CONTRACT.md`).

### 2. Session id

- On first load, if `localStorage["codesight_session_id"]` is missing,
  generate one (`crypto.randomUUID()`) and store it.
- Send it as `session_id` in every `/grade` and `/promotion-test/*` call and
  in the path for `/profile/{id}`, `/progress/{id}`, `/session/{id}`.

### 3. Replace the mock data files

Delete the hard-coded arrays in `frontend/src/data/*.ts` and back these
screens with real calls:

| Screen | Endpoint(s) |
|---|---|
| Exercise list | `GET /exercises?tier={tier}` (cumulative; also `?source=curated` if you want to hide unreviewed) |
| Exercise workspace | `GET /exercises/{id}` — returns code, no answer data |
| Hints | `GET /exercises/{id}/hints/{n}` — 1-based; response has `score_multiplier` |
| Submit review | `POST /grade` — body `{session_id, exercise_id, selected_lines, explanation, hints_used}` |
| Results page | the `/grade` response: `localisation`, `explanation`, `teaching`, `score_after_hints`, `hint_multiplier` |
| Dashboard / weakness profile | `GET /profile/{session_id}` |
| Progress charts | `GET /progress/{session_id}` — `timeline[]` + `by_class[]` |
| Concept page | `GET /concepts` (list) and `GET /concept/{id}` (summary, bad/good, `videos[]`, `practice_exercise_ids`) |
| Tier badge / state | `GET /session/{session_id}` — `{tier, next_tier, promotion_test_available}` |
| AI Reviewer vs You | `POST /ai-review` — body `{exercise_id, selected_lines}` |

Promotion test flow (`GET /promotion-test/{session_id}`,
`POST /promotion-test/{session_id}/evaluate`) is part of **task B** (tier UI)
— fine to stub the button for now.

### 4. Loading & error states

Every screen needs a spinner and a visible error message. `/ai-review` and
`/grade` can take a few seconds (one LLM call) — don't block the whole page,
and handle `ai_available: false` on the AI review response.

### 5. CORS

Already handled server-side: any `*.vercel.app` origin and `localhost:*` are
allowed. If you deploy to a custom domain, tell the backend owner to add it
to `ALLOWED_ORIGINS`.

---

## Done when

- [ ] `frontend/src/data/*.ts` mock arrays are gone
- [ ] A fresh browser (no localStorage) can: open the exercise list, open an
      exercise, take a hint, submit a review, and see a real graded result
- [ ] Dashboard and progress pages show data from that same session
- [ ] Concept page renders a concept fetched from `/concept/{id}` with
      working YouTube links
- [ ] Reload keeps the same session (same `session_id`, history persists)
- [ ] Deployed Vercel build talks to Railway with no CORS or mixed-content
      errors (that's task D's end-to-end check)

## Notes

- The exercise set is 1002 (19 curated + 983 generated). The generated ones
  are **unreviewed** — that's why task C adds a "report" button. If you want
  a safer demo, list with `?source=curated` until review has covered a tier.
- Don't send answer fields anywhere — the backend never exposes
  `real_lines` / `fix_diff` except inside a `/grade` response.
