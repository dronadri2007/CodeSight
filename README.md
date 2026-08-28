# CodeSight — Code Review Practice Platform

Tech Eximius 2026 · Team HackHive

A practice platform where students review real broken code, mark the suspect
lines, explain the defect, and get AI feedback on where they were wrong and
why.

## Repo layout

    backend/     FastAPI + Gemini grading. Built by the backend pair.
    frontend/    React (Stitch + Antigravity) + Monaco review surface.
                 Built by the frontend pair.
    CONTRACT.md  The API shape. Both sides build against this file.

Rule: the backend pair only edits `backend/`, the frontend pair only edits
`frontend/`. Because the two never touch the same files, git merges are clean.

## Run locally

Backend:

    cd backend
    python -m venv .venv
    .venv\Scripts\activate        # Windows
    # source .venv/bin/activate   # macOS / Linux
    pip install -r requirements.txt
    copy .env.example .env         # then paste your GEMINI_API_KEY
    uvicorn app.main:app --reload --port 8000

Frontend:

    cd frontend
    npm install
    echo VITE_API_BASE_URL=http://localhost:8000 > .env.local
    npm run dev

## Deploy

- Backend to Railway. Set `GEMINI_API_KEY` and `ALLOWED_ORIGINS`.
- Frontend to Vercel. Set `VITE_API_BASE_URL` to the Railway URL.
