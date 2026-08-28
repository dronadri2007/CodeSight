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

Response 200:

    [
      {
        "id": "ex-001",
        "language": "python",
        "title": "User lookup by email",
        "defect_class": "injection",
        "line_count": 3
      }
    ]

---

## GET /exercises/{id}

One exercise's file for review. No answer data.

Response 200:

    {
      "id": "ex-001",
      "language": "python",
      "filename": "users.py",
      "code": "def get_user(email):\n    ...",
      "line_count": 3
    }

Response 404 if the id is unknown.

---

## POST /grade

Submit a review for grading.

Request:

    {
      "session_id": "web-8f3a2c",
      "exercise_id": "ex-001",
      "selected_lines": [2],
      "explanation": "User input is interpolated straight into the SQL string."
    }

- `session_id` — any stable string the client generates once and reuses
  (localStorage). Ties attempts together for the weakness profile. No auth.
- `selected_lines` — 1-indexed. `[]` is allowed (e.g. "this file is clean").
- `explanation` — max 4000 chars.

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
      "reference_fix": "Use a parameterised query and bind email as a parameter."
    }

Field rules:

- `localisation` is scored deterministically in Python from line overlap
  (tolerance ±2 lines).
  - `localisation.verdict`: `hit` | `near` | `miss` | `false_positive`.
  - A **clean** exercise has `real_lines: []`; selecting nothing scores 1.0
    (`hit`), selecting anything scores 0.0 (`false_positive`).
- `explanation` + `teaching` come from one Claude call. If the model is
  unavailable the call degrades gracefully: `explanation.score` 0.0,
  `verdict` `weak`, and `teaching` points at the reference.
  - `explanation.verdict`: `strong` | `partial` | `weak`.

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
