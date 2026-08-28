"""CodeSight API — Day 1 stub.

Every endpoint returns data in the shape defined in CONTRACT.md so the
frontend can build against it immediately. Day 2: replace the /grade stub
with the real Claude call in app/grader.py, and the in-memory exercise
data with the curated store.
"""
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="CodeSight API")

_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- stub exercise data -------------------------------------------------------
# Day 2: replace with the curated exercise store (15-20 real bug-fix commits).
_EXERCISES = [
    {
        "id": "ex-001",
        "language": "python",
        "title": "User lookup by email",
        "defect_class": "injection",
        "line_count": 3,
    },
]

_FILES = {
    "ex-001": {
        "id": "ex-001",
        "language": "python",
        "filename": "users.py",
        "code": (
            "def get_user(email):\n"
            "    q = f\"SELECT * FROM users WHERE email = '{email}'\"\n"
            "    return db.execute(q).fetchone()\n"
        ),
        "line_count": 3,
    },
}


class GradeRequest(BaseModel):
    exercise_id: str
    selected_lines: list[int]
    explanation: str


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/exercises")
def list_exercises():
    return _EXERCISES


@app.get("/exercises/{exercise_id}")
def get_exercise(exercise_id: str):
    f = _FILES.get(exercise_id)
    if f is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return f


@app.post("/grade")
def grade(req: GradeRequest):
    # STUB — fixed response in the CONTRACT.md shape.
    # Day 2: from app.grader import grade_review; call it here.
    return {
        "localisation": {
            "score": 1.0,
            "verdict": "hit",
            "real_lines": [2],
            "note": "stub response — not really graded yet",
        },
        "explanation": {
            "score": 0.8,
            "verdict": "strong",
            "note": "stub response",
        },
        "teaching": {
            "where": "Line 2 builds the query with f-string interpolation of email.",
            "why_missed": "stub",
            "pattern": "User input concatenated into a query string is an injection risk.",
        },
        "defect_class": "injection",
        "reference_fix": "Use a parameterised query: db.execute(sql, (email,))",
    }
