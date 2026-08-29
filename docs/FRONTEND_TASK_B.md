# Task B — tier UI

Tier badge, tier-gated practice list, and the promotion-test flow. The tier
system is fully built and live on the backend; this is the UI for it.

- **Owner:** frontend pair
- **Estimate:** ~½ day
- **Depends on:** Task A (API client + `session_id` in `localStorage`)
- **Contract:** shapes in [`CONTRACT.md`](../CONTRACT.md)

Tiers, in order: **beginner → intermediate → pro**. A session starts at
`beginner`. To move up you pass a promotion test (3 curated exercises from
the next tier, first-attempt mean localisation score ≥ 0.7).

---

## Endpoints

| Call | Returns |
|---|---|
| `GET /session/{session_id}` | `{session_id, tier, next_tier, promotion_test_available}` — auto-creates the session at `beginner` on first hit |
| `GET /exercises?tier={tier}` | exercises up to and including that tier (cumulative: `intermediate` → beginner + intermediate) |
| `GET /promotion-test/{session_id}` | `{eligible, from_tier, to_tier, exercise_ids[3], reason}` |
| `POST /promotion-test/{session_id}/evaluate` | `{passed, from_tier, to_tier, tier_after, scores[], mean_score, needed, missing[]}` |

---

## 1. Tier badge

- On app load, call `GET /session/{session_id}` and keep `tier` /
  `next_tier` / `promotion_test_available` in a store.
- Show the current tier somewhere persistent (header or sidebar).
- If `promotion_test_available` is `true`, show a call-to-action next to it
  ("Promotion test ready →").
- If `next_tier` is `null` the user is `pro` — show "Pro" with no CTA.

## 2. Tier-gated practice list

- The practice list calls `GET /exercises?tier={currentTier}` — so it
  already only returns what the user has unlocked. No client-side filtering
  needed.
- Optionally show a locked teaser row for the next tier ("Intermediate —
  pass the promotion test to unlock") for motivation. The API will not
  return those exercises; the teaser is purely cosmetic.
- After a successful promotion, re-fetch the list so it widens.

## 3. Promotion-test flow

1. **Entry:** the CTA is enabled only when `promotion_test_available` is
   `true`. On click, `GET /promotion-test/{session_id}`. If `eligible` is
   `false`, show `reason` and stop.
2. **The test:** you get `exercise_ids` (3 curated next-tier exercises).
   Run them through the **normal** exercise workspace + `POST /grade` flow,
   one at a time, with a "Promotion test — 1 of 3" header.
   - **The evaluation uses each exercise's FIRST `/grade` submission.** Tell
     the user up front: no retries, and hints lower the score. Consider
     hiding the hint button during the test.
3. **Submit:** after all 3 have been attempted, call
   `POST /promotion-test/{session_id}/evaluate`.
   - `missing[]` non-empty → not all 3 attempted yet; list which remain,
     don't show a pass/fail.
   - `passed: true` → success screen; re-fetch `GET /session/{session_id}`
     so the badge flips to `tier_after`, then re-fetch the practice list.
   - `passed: false` → show `mean_score` vs `needed` (0.7) and the
     per-exercise `scores[]`. Let them try again later (there's no cooldown
     server-side, but the same 3 exercises are reused).

---

## Done when

- [ ] Tier badge shows the real tier from `/session/{id}` and updates after a promotion without a full reload
- [ ] Practice list content changes with tier (beginner session sees only beginner exercises)
- [ ] "Take promotion test" is disabled/hidden unless `promotion_test_available`
- [ ] Running the 3 test exercises and submitting produces a pass/fail from `/evaluate`
- [ ] A pass persists — reload the app, badge still shows the new tier
- [ ] `pro` session shows no promotion CTA
- [ ] Partial attempt (only 1–2 of 3 done) shows "finish the remaining test exercises", not a fail

## Notes

- Promotion tests only ever use **curated** exercises, so they're safe even
  though the generated pool is still under review.
- `/session/{id}` is the source of truth for tier — don't cache it past a
  promotion.
