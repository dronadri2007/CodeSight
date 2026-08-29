# CodeSight API

FastAPI service for CodeSight — deterministic localisation scoring in Python;
one Gemini call per submission for explanation + teaching feedback.

Tech Eximius 2026 · Team HackHive. Frontend lives in a separate repo
(`codesight-code-review`); both sides build against `../CONTRACT.md` here.
Deployed on Railway (repo root — no subdirectory).

## Run

    python -m venv .venv
    .venv\Scripts\activate            # Windows
    pip install -r requirements.txt
    copy .env.example .env             # paste GEMINI_API_KEY; DATABASE_URL optional
    uvicorn app.main:app --reload --port 8000

Without `DATABASE_URL` it uses a local `codesight.db` SQLite file (dev only).
Without `GEMINI_API_KEY` the `/grade` endpoint still works — the explanation
half degrades to a reference-based fallback.

## Test

    python -m pytest -q          # offline, no API key needed

    RUN_NETWORK_TESTS=1 python -m pytest tests/test_concept_links.py -q
                                # checks every concepts.json YouTube link resolves

## Grader benchmark

    python scripts/run_benchmark.py

Runs the explanation grader over `benchmark/gold_set.json` (28 human-labelled
student submissions) and reports how often its verdict + score band match the
label. Localisation is checked separately (deterministic). Results cache to
`benchmark/cache.json`; details in `benchmark/README.md`.

## Checking concept video links

    python scripts/check_concept_links.py

Hits YouTube's keyless oEmbed endpoint for every video in
`app/data/concepts.json`: flags dead links (exit 1), non-embeddable videos,
and entries whose stored title no longer matches the real one. Run before a
demo or on a CI schedule.

## Module map

| File | Responsibility |
|---|---|
| `app/main.py` | routes, CORS, startup table creation |
| `app/config.py` | env → settings (key, model, origins, DB URL) |
| `app/db.py` / `app/models.py` | SQLAlchemy engine + the `attempts` table |
| `app/schemas.py` | request/response shapes (mirror `../CONTRACT.md`) |
| `app/exercises.py` | load curated + generated pools, merge `exercises.review.json` sidecar, serve file vs. answer data |
| `app/localisation.py` | line-overlap scoring (±2 tolerance), pure Python |
| `app/grader.py` | Gemini call for explanation + teaching, hash-cached, safe fallback |
| `app/ai_review.py` | Gemini as an independent reviewer; diffs AI vs student vs ground truth |
| `app/hints.py` | progressive-hint score decay (1.0 / 0.9 / 0.75 / 0.5) |
| `app/integrity.py` | optional `/grade` telemetry → integrity score + flags (advisory, never rescores) |
| `app/profile.py` | aggregate a session's attempts → weakest class + next step |
| `app/progress.py` | attempt timeline + running catch-rate + per-class first-vs-latest |
| `app/concepts.py` | recommendation engine — `data/concepts.json` (6 defect-class concepts + videos + a 3-question micro-check quiz) |
| `app/tiers.py` | beginner/intermediate/pro, promotion test (3 curated next-tier exercises, mean loc >= 0.7) |
| `app/reports.py` | exercise reporting — 3 distinct sessions hides an exercise from listings |

## Generating exercises in bulk

    python scripts/generate_exercises.py --count 200

Writes `app/data/exercises.generated.json` (`source: "generated"`, ids
`ex-gNNNN`). Needs `GEMINI_API_KEY`. Validates each (parses, line numbers in
range, deduped); resumes from the last id. Generated exercises are never used
in a promotion test and can be flagged via `POST /exercises/{id}/report`.

The free tier caps `gemini-3.5-flash-lite` at 500 requests/day per project.
To keep going the same day, add `GEMINI_API_KEY2` (and `...3`, `...4`) from
other projects to `.env` — the script rotates to the next key on a per-day
`RESOURCE_EXHAUSTED` and stops cleanly when all keys are spent. These extra
keys are script-only; the deployed API still uses just `GEMINI_API_KEY`.

## Reviewing generated exercises

    python scripts/review_exercises.py --difficulty beginner   # a/r/e/s/q per exercise
    python scripts/review_exercises.py --status                # progress counts

Verdicts land in the append-only sidecar `app/data/exercises.review.json`
(`{id: {status, by, at, note?, patch?}}`), merged in `exercises.py` at load:
`rejected` hides an exercise from listings, `edited` applies its `patch`,
`approved` marks it human-reviewed. Stdlib only — a reviewer needs just
Python, not the full backend. Full runbook: `REVIEW.md`.

## Adding exercises

Append to `app/data/exercises.json`. Each record needs `real_lines` (the lines
the fix changed; `[]` for a clean file), `fix_diff`, and `reference`. Answer
fields never leave the server — only `/grade` reads them.

## Endpoints

`GET /health` · `GET /exercises[?tier=&source=]` · `GET /exercises/{id}` ·
`GET /exercises/{id}/hints/{n}` · `POST /grade` · `POST /ai-review` ·
`GET /profile/{session_id}` · `GET /progress/{session_id}` ·
`GET /concepts` · `GET /concept/{id}` ·
`GET /concept/{id}/micro-check` · `POST /concept/{id}/micro-check` ·
`GET /session/{id}` ·
`GET /promotion-test/{id}` · `POST /promotion-test/{id}/evaluate` ·
`POST /exercises/{id}/report` — full shapes in `../CONTRACT.md`.
