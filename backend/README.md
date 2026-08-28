# backend

FastAPI service. Deterministic localisation scoring in Python; one Claude call
per submission for explanation + teaching feedback.

## Run

    python -m venv .venv
    .venv\Scripts\activate            # Windows
    pip install -r requirements.txt
    copy .env.example .env             # paste ANTHROPIC_API_KEY; DATABASE_URL optional
    uvicorn app.main:app --reload --port 8000

Without `DATABASE_URL` it uses a local `codesight.db` SQLite file (dev only).
Without `ANTHROPIC_API_KEY` the `/grade` endpoint still works — the explanation
half degrades to a reference-based fallback.

## Test

    python -m pytest -q          # localisation scorer, no API key needed

## Module map

| File | Responsibility |
|---|---|
| `app/main.py` | routes, CORS, startup table creation |
| `app/config.py` | env → settings (key, model, origins, DB URL) |
| `app/db.py` / `app/models.py` | SQLAlchemy engine + the `attempts` table |
| `app/schemas.py` | request/response shapes (mirror `../CONTRACT.md`) |
| `app/exercises.py` | load `data/exercises.json`, serve file vs. answer data |
| `app/localisation.py` | line-overlap scoring (±2 tolerance), pure Python |
| `app/grader.py` | Claude call for explanation + teaching, hash-cached, safe fallback |
| `app/profile.py` | aggregate a session's attempts → weakest class + next step |

## Adding exercises

Append to `app/data/exercises.json`. Each record needs `real_lines` (the lines
the fix changed; `[]` for a clean file), `fix_diff`, and `reference`. Answer
fields never leave the server — only `/grade` reads them.

## Endpoints

`GET /health` · `GET /exercises` · `GET /exercises/{id}` · `POST /grade` ·
`GET /profile/{session_id}` — full shapes in `../CONTRACT.md`.
