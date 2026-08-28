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
        "line_count": 34
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
      "line_count": 34
    }

Response 404 if the id is unknown.

---

## POST /grade

Submit a review for grading.

Request:

    {
      "exercise_id": "ex-001",
      "selected_lines": [12, 13],
      "explanation": "User input goes straight into the SQL string, so a crafted email can inject."
    }

Response 200:

    {
      "localisation": {
        "score": 1.0,
        "verdict": "hit",
        "real_lines": [12, 13],
        "note": "You marked the exact lines the fix changed."
      },
      "explanation": {
        "score": 0.8,
        "verdict": "strong",
        "note": "Correct mechanism. You did not mention parameterised queries as the fix."
      },
      "teaching": {
        "where": "Line 12 builds the query with f-string interpolation of email.",
        "why_missed": "You scanned the loop first; the risk is the string built above it.",
        "pattern": "Any user value concatenated into a query string is an injection risk."
      },
      "defect_class": "injection",
      "reference_fix": "Use a parameterised query: cursor.execute(sql, (email,))"
    }

Field rules:

- `localisation.score` (0.0-1.0) is the overlap between `selected_lines` and
  the lines the fix changed.
- `localisation.verdict`: `hit` | `near` | `miss` | `false_positive`.
- `explanation.verdict`: `strong` | `partial` | `weak`.
- A **clean** exercise has `real_lines: []`; any selection scores
  localisation 0 with verdict `false_positive`.
- A different but genuine defect the student found gets partial explanation
  credit, noted as "plausible, unverified".
