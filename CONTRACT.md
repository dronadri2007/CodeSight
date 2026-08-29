# API Contract

Both frontend and backend build against this file. Any change here is a commit
that also pings the other pair.

The frontend takes the base URL from `VITE_API_BASE_URL`
(e.g. `http://localhost:8000` in dev, the Railway URL in prod).
All line numbers are **1-indexed**.

---

## GET /health

Liveness check.

Response 200: `{ "ok": true }`

---

## GET /exercises

List of exercises, metadata only — no answer data.

Query params (optional):
- `tier` = `beginner` | `intermediate` | `pro` — **cumulative** gate:
  `tier=intermediate` returns beginner + intermediate. Unknown value → 422.
- `source` = `curated` | `generated` — filter to exactly that pool.

Exercises reported by 3+ distinct sessions are omitted (see
`POST /exercises/{id}/report`).

Response 200:

    [
      {
        "id": "ex-001",
        "language": "python",
        "title": "User lookup by email",
        "defect_class": "injection",
        "line_count": 3,
        "difficulty": "beginner",
        "source": "curated"
      }
    ]

- `source`: `curated` (human-reviewed) or `generated` (LLM, unvalidated).

---

## GET /exercises/{id}

One exercise's file for review. No answer data. Resolves even for a
reported/hidden exercise so an in-progress attempt can finish.

Response 200:

    {
      "id": "ex-001",
      "language": "python",
      "filename": "users.py",
      "code": "def get_user(email):\n    ...",
      "line_count": 3,
      "hint_count": 3,
      "difficulty": "beginner",
      "source": "curated"
    }

Response 404 if the id is unknown.

---

## POST /exercises/{id}/report

Flag a broken/mislabelled exercise (mainly for the generated pool).

Request: `{ "session_id": "web-8f3a2c", "reason": "the fix is wrong" }`

Response 200:

    { "exercise_id": "ex-g0042", "reports": 3, "hidden": true }

- `reports` counts **distinct sessions**. At 3, `hidden` becomes true and the
  exercise drops out of `GET /exercises` and practice (still resolvable by id).
- 404 if the exercise id is unknown.

---

## GET /exercises/{id}/hints/{n}

One progressive hint. `n` is **1-based**. Ask for them in order; each one
lowers the score the student can still earn.

Response 200:

    {
      "index": 1,
      "text": "Look at how the email argument reaches the database.",
      "total": 3,
      "score_multiplier": 0.9
    }

- `score_multiplier` — what `score_after_hints` in `/grade` is scaled by if the
  student stops asking at this hint: 0 hints 1.0, hint 1 → 0.9, hint 2 → 0.75,
  hint 3+ → 0.5.

Response 404 if the exercise or the hint index is unknown.

---

## POST /grade

Submit a review for grading.

Request:

    {
      "session_id": "web-8f3a2c",
      "exercise_id": "ex-001",
      "selected_lines": [2],
      "explanation": "User input is interpolated straight into the SQL string.",
      "hints_used": 0,
      "telemetry": {
        "time_to_submit_ms": 94000,
        "paste_count": 0,
        "pasted_chars": 0,
        "tab_blur_count": 0,
        "tab_blur_ms": 0,
        "keystroke_count": 180
      }
    }

- `session_id` — any stable string the client generates once and reuses
  (localStorage). Ties attempts together for the weakness profile. No auth.
- `selected_lines` — 1-indexed. `[]` is allowed (e.g. "this file is clean").
- `explanation` — max 4000 chars.
- `hints_used` — 0–10, how many hints the student opened. Scales
  `score_after_hints` only; the raw scores and the weakness profile are
  unaffected.
- `telemetry` — **optional** behavioural signals for the integrity score
  below. Omit it entirely and `integrity` in the response is `null`. All
  fields are non-negative integers; `time_to_submit_ms` may be omitted.
  Measured client-side: `paste_count` / `pasted_chars` from paste events on
  the explanation field, `tab_blur_count` / `tab_blur_ms` from
  `visibilitychange`, `keystroke_count` from keydown on the explanation.

Response 200:

    {
      "localisation": {
        "score": 1.0,
        "verdict": "hit",
        "real_lines": [2],
        "note": "You marked the lines the fix changed."
      },
      "explanation": {
        "score": 0.8,
        "verdict": "strong",
        "note": "Correct mechanism. You did not mention parameterised queries."
      },
      "teaching": {
        "where": "Line 2 interpolates email into the SQL string.",
        "why_missed": "You scanned the return statement; the risk is the line above.",
        "pattern": "Any user value concatenated into a query string is an injection risk."
      },
      "defect_class": "injection",
      "reference_fix": "Use a parameterised query and bind email as a parameter.",
      "hints_used": 0,
      "hint_multiplier": 1.0,
      "score_after_hints": 0.9,
      "integrity": {
        "score": 1.0,
        "verdict": "clean",
        "flags": []
      }
    }

- `hint_multiplier` — from `hints_used` (1.0 / 0.9 / 0.75 / 0.5).
- `score_after_hints` — `mean(localisation.score, explanation.score) *
  hint_multiplier`, rounded to 2dp. A display number; not stored, not used by
  the profile.
- `integrity` — `null` unless `telemetry` was sent. When present:
  - `score` — 0.0–1.0, 1.0 = no concerns. `1.0 - sum(penalties)`, clamped.
  - `verdict` — `clean` (≥ 0.8) · `review` (0.4 ≤ score < 0.8) · `flagged` (< 0.4).
  - `flags` — human-readable reasons (dominant paste, few keystrokes for the
    text length, implausibly fast submit, long time off-tab). May be empty.
  - **Advisory only** — it never changes the grade or gates the submission
    ("practice, not exam"). It is stored on the attempt for a later mentor view.

Field rules:

- `localisation` is scored deterministically in Python from line overlap
  (tolerance ±2 lines).
  - `localisation.verdict`: `hit` | `near` | `miss` | `false_positive`.
  - A **clean** exercise has `real_lines: []`; selecting nothing scores 1.0
    (`hit`), selecting anything scores 0.0 (`false_positive`).
- `explanation` + `teaching` come from one Gemini call. If the model is
  unavailable the call degrades gracefully: `explanation.score` 0.0,
  `verdict` `weak`, and `teaching` points at the reference.
  - `explanation.verdict`: `strong` | `partial` | `weak`.

Response 404 if `exercise_id` is unknown.

---

## POST /ai-review

Run the model as an independent reviewer of the same file (blind to the
student's answer), then diff AI findings vs the student's marked lines vs the
ground-truth fix lines. Not scored — a demo / insight view.

Request:

    {
      "exercise_id": "ex-001",
      "selected_lines": [2]
    }

Response 200:

    {
      "exercise_id": "ex-001",
      "ai_available": true,
      "real_lines": [2],
      "you_found": [2],
      "ai_lines": [2, 3],
      "ai_findings": [
        { "lines": [2], "issue": "User input interpolated into SQL string.", "severity": "high" }
      ],
      "both_found": [2],
      "you_caught_ai_missed": [],
      "ai_caught_you_missed": [],
      "both_missed": [],
      "headline": "You and the AI agreed on the defect."
    }

- Lines are matched to `real_lines` with the same ±2 tolerance as `/grade`.
- `you_caught_ai_missed` is the "celebrate" set — real defect lines the student
  got and the AI did not.
- `ai_available: false` (no key / model error) → `ai_findings: []`, `ai_lines:
  []`, and `headline` says AI review is unavailable.
- The AI review is cached per exercise (it does not depend on the student).

Response 404 if `exercise_id` is unknown.

---

## GET /profile/{session_id}

The weakness profile for a session.

Response 200:

    {
      "session_id": "web-8f3a2c",
      "total_attempts": 7,
      "by_class": [
        { "defect_class": "error-handling", "attempts": 3, "catch_rate": 0.43, "avg_explanation": 0.5 },
        { "defect_class": "injection", "attempts": 4, "catch_rate": 0.88, "avg_explanation": 0.7 }
      ],
      "weakest_class": "error-handling",
      "recommendation": "Your weakest area is error-handling (catch rate 43% over 3 attempts). Queued: 3 more error-handling exercises."
    }

- `by_class` is sorted weakest first. `catch_rate` is the mean localisation
  score (0.0–1.0) for that class.
- `weakest_class` is `null` until at least one class has 2+ attempts.
  `clean` is never chosen as the weakest class.

---

## GET /progress/{session_id}

Attempts over time, for a trend line.

Response 200:

    {
      "session_id": "web-8f3a2c",
      "total_attempts": 3,
      "timeline": [
        {
          "n": 1,
          "created_at": "2026-08-28T09:00:00+00:00",
          "exercise_id": "ex-001",
          "defect_class": "injection",
          "localisation_score": 1.0,
          "explanation_score": 0.8,
          "cumulative_catch_rate": 1.0
        }
      ],
      "by_class": [
        {
          "defect_class": "auth",
          "attempts": 2,
          "scores": [0.0, 1.0],
          "first_catch_rate": 0.0,
          "latest_catch_rate": 1.0,
          "improved": true
        }
      ]
    }

- `timeline` is every attempt in chronological order. `cumulative_catch_rate`
  is the running mean of `localisation_score` up to and including that point —
  plot it directly as the trend line.
- `by_class[].scores` is that class's `localisation_score` per attempt, in
  order. `improved` is `latest > first`.
- Empty session → `total_attempts: 0`, `timeline: []`, `by_class: []`.

---

## GET /leaderboard

Sessions ranked by review skill.

Query params (all optional):

| param | default | meaning |
|---|---|---|
| `limit` | 20 | max rows in `entries` (1–100) |
| `min_attempts` | 3 | only rank sessions with at least this many graded submissions (1–50) |
| `tier` | — | filter to one tier (`beginner` \| `intermediate` \| `pro`); 422 if unknown |
| `session_id` | — | also return a `you` row with that session's rank |

Response 200:

    {
      "generated_at": "2026-08-29T18:20:00+00:00",
      "min_attempts": 3,
      "total_ranked": 42,
      "entries": [
        {
          "rank": 1,
          "session_id": "web-8f3a2c",
          "tier": "intermediate",
          "attempts": 27,
          "catch_rate": 0.88,
          "avg_explanation": 0.71,
          "score": 0.829
        }
      ],
      "you": {
        "rank": 14,
        "session_id": "web-1a2b3c",
        "tier": "beginner",
        "attempts": 9,
        "catch_rate": 0.62,
        "avg_explanation": 0.40,
        "score": 0.554
      }
    }

- `score` = `0.7 * catch_rate + 0.3 * avg_explanation`, rounded to 3dp.
  `catch_rate` is the mean `localisation_score`, `avg_explanation` the mean
  `explanation_score`, over all the session's attempts.
- Sorted by `score` desc, then `attempts` desc, then `session_id`.
- `total_ranked` counts every session meeting `min_attempts` and can exceed
  `len(entries)` when `limit` is smaller.
- `you` is `null` when no `session_id` is given, or when that session is not
  ranked (too few attempts, or filtered out by `tier`).
- Empty / not-enough-data → `entries: []`, `total_ranked: 0`, `you: null`.

---

## GET /concepts

Recommendation engine — the six defect-class concepts.

Response 200: `[ { "id": "injection", "title": "Injection / Input Validation" }, ... ]`

---

## GET /concept/{id}

One concept: explanation, before/after example, videos, practice pointers.
`id` is a defect class (`injection`, `auth`, `error-handling`, `concurrency`,
`logic`, `resource`). The frontend calls this with `weakest_class` from
`/profile`.

Response 200:

    {
      "id": "injection",
      "title": "Injection / Input Validation",
      "summary": "2-4 sentences on the mechanism and the fix.",
      "example_bad": "q = f\"... {email} ...\"",
      "example_good": "db.execute(sql, (email,))",
      "videos": [ { "title": "SQL Injection - Computerphile", "url": "https://youtube.com/watch?v=..." } ],
      "practice_exercise_ids": ["ex-001", "ex-004", "ex-005"],
      "micro_check_count": 3
    }

Response 404 if the concept id is unknown.

---

## GET /concept/{id}/micro-check

The concept's short comprehension quiz, **without** the answer key. Show it
after the learner has read the concept; grade with the POST below.

Response 200:

    {
      "concept_id": "injection",
      "questions": [
        { "id": "q1", "prompt": "Which change most reliably prevents SQL injection?",
          "options": ["Escaping quotes", "Parameterised query", "Length limit", "Low-privilege user"] }
      ]
    }

Response 404 if the concept id is unknown.

---

## POST /concept/{id}/micro-check

Grade submitted answers. Unknown `question_id`s are ignored; missing or
out-of-range answers count as wrong. Every question comes back with its
correct index and an explanation, so the result doubles as teaching.

Request:

    { "answers": [ { "question_id": "q1", "choice_index": 1 }, { "question_id": "q2", "choice_index": 2 } ] }

Response 200:

    {
      "concept_id": "injection",
      "total": 3,
      "correct": 2,
      "score": 0.67,
      "passed": true,                       // score >= 2/3
      "results": [
        { "question_id": "q1", "correct": true,  "your_index": 1, "correct_index": 1,
          "explanation": "Bound parameters keep the value as data ..." },
        { "question_id": "q2", "correct": false, "your_index": 0, "correct_index": 2,
          "explanation": "..." }
      ],
      "practice_exercise_ids": ["ex-001", "ex-004", "ex-005"]   // show these when not passed
    }

Response 404 if the concept id is unknown.

---

## GET /session/{session_id}

The session's tier. Auto-creates the session at `beginner` on first call.

Response 200:

    {
      "session_id": "web-8f3a2c",
      "tier": "beginner",
      "next_tier": "intermediate",
      "promotion_test_available": true
    }

- `next_tier` is `null` at `pro`. `promotion_test_available` is false at `pro`.

---

## GET /promotion-test/{session_id}

The 3 curated exercises from the next tier up that make up the promotion test.

Response 200:

    {
      "session_id": "web-8f3a2c",
      "eligible": true,
      "from_tier": "beginner",
      "to_tier": "intermediate",
      "exercise_ids": ["ex-005", "ex-006", "ex-002"],
      "reason": "Review these 3 intermediate exercises. First-attempt mean localisation >= 0.7 promotes you."
    }

- The 3 ids are stable for a given tier. The student reviews each through the
  normal `POST /grade`. Generated exercises are never used.
- At `pro`: `eligible: false`, `to_tier: null`.

---

## POST /promotion-test/{session_id}/evaluate

Check the test and promote if passed. Looks at the student's **first** attempt
at each of the 3 exercises.

Response 200:

    {
      "session_id": "web-8f3a2c",
      "passed": true,
      "from_tier": "beginner",
      "to_tier": "intermediate",
      "tier_after": "intermediate",
      "scores": [1.0, 0.8, 1.0],
      "mean_score": 0.93,
      "needed": 0.7,
      "missing": []
    }

- `passed` requires all 3 attempted **and** `mean_score >= needed` (0.7).
- `missing` lists test exercises not yet attempted; while non-empty,
  `passed` is false and `tier_after` is unchanged.
- On pass, the session's tier is persisted; `tier_after == to_tier`.
