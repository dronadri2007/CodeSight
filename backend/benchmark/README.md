# Grader benchmark

Turns "the explanation grader is good" into a number.

## What it is

`gold_set.json` — 28 human-labelled student submissions against the curated
exercises. Each case carries:

| field | meaning |
|---|---|
| `expect_localisation` | the deterministic localisation verdict (`score_localisation`) |
| `quality` / `expect_verdict` | the explanation verdict a human reviewer would give (`strong` / `partial` / `weak`) |
| `score_min` / `score_max` | the band the grader's explanation score should land in |

Coverage: all 6 defect classes, plus 3 clean-file cases (false-positive
traps). Roughly half are deliberately shallow / off-target so the grader has
to *discriminate*, not just rubber-stamp.

## Running it

    cd backend
    python scripts/run_benchmark.py            # uses benchmark/cache.json
    python scripts/run_benchmark.py --no-cache # force fresh grader calls
    python scripts/run_benchmark.py --json     # machine-readable summary

A case **agrees** when the grader's verdict matches the label *and* the
score is inside the band. Localisation is reported separately — it is pure
Python, so it should be a flat 28/28.

### Quota

The grader model (`gemini-3.6-flash`) free tier is ~5 req/min and ~20
req/day **per project**, shared with the live deploy. The runner paces at
13 s/call and rotates through `BENCHMARK_API_KEY` → `GEMINI_API_KEY2` →
`GEMINI_API_KEY` on a per-day exhaustion. Successful grades are cached to
`cache.json` (keyed by exercise + selection + explanation + model), so a
run that gets quota-capped partway can be finished later with a re-run —
nothing already graded is re-charged.

## Output

`last_run.json` — the full per-case table plus the summary. `cache.json` —
the grade cache (safe to delete; it just forces fresh calls).

## Reading the result

- **localisation** ~28/28 confirms the deterministic scorer is intact.
- **explanation verdict / score-in-band** is the grader-quality number.
- Systematic misses in one direction are a finding about the grader's
  calibration, recorded here rather than hidden.

## Current finding (run of 2026-08-29, 18 / 28 graded — rest pending a daily-quota reset)

- Localisation: **28 / 28**.
- Explanation grade: **13 / 18** on the graded subset.
- All 5 disagreements are the same pattern: a **correct-but-terse** finding
  (names the defect + mechanism, no exploit detail, no fix) is scored
  `strong` / 0.9–1.0 instead of `partial`. The grader gets every `strong`
  and `weak` case right; it just doesn't hold back the top score for
  shallow answers.
- **Applied fix** (invalidates the cache): the grader `SYSTEM` prompt now
  requires a `strong` verdict to also explain why the defect is exploitable
  OR how to fix it — a bare correct label + mechanism is capped at `partial`.
- A full benchmark re-run is **pending** the `gemini-3.6-flash` daily-quota
  reset (or a paid key); the 18 cached grades from the pre-fix run are stale
  and should be regenerated (`run_benchmark.py --no-cache`).
