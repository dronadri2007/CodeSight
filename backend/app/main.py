"""CodeSight API.

Endpoints (see CONTRACT.md):
  GET  /health
  GET  /exercises
  GET  /exercises/{id}
  POST /grade
  GET  /profile/{session_id}
"""
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import exercises as ex
from app.config import ALLOWED_ORIGINS, DB_IS_SQLITE, GRADER_MODEL
from app.db import get_db, init_db
from app.grader import grade_explanation
from app.localisation import score_localisation
from app.models import Attempt
from app.profile import build_profile
from app.schemas import (
    ExerciseFile,
    ExerciseSummary,
    GradeRequest,
    GradeResponse,
    WeaknessProfile,
)

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("codesight")


# Create tables at import time so any ASGI runner (and TestClient without a
# lifespan context) has them. create_all is idempotent.
init_db()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    if DB_IS_SQLITE:
        log.warning("DATABASE_URL unset — using local SQLite file (dev only).")
    log.info("grader model: %s", GRADER_MODEL)
    yield


app = FastAPI(title="CodeSight API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/exercises", response_model=list[ExerciseSummary])
def list_exercises():
    return ex.list_summaries()


@app.get("/exercises/{exercise_id}", response_model=ExerciseFile)
def get_exercise(exercise_id: str):
    return ex.get_file(exercise_id)


@app.post("/grade", response_model=GradeResponse)
def grade(req: GradeRequest, db: Session = Depends(get_db)):
    answer = ex.get_answer(req.exercise_id)

    loc = score_localisation(req.selected_lines, answer["real_lines"])

    expl = grade_explanation(
        exercise_id=req.exercise_id,
        code=answer["code"],
        fix_diff=answer["fix_diff"],
        reference=answer["reference"],
        selected_lines=req.selected_lines,
        explanation=req.explanation,
        localisation_verdict=loc["verdict"],
    )

    db.add(
        Attempt(
            session_id=req.session_id,
            exercise_id=req.exercise_id,
            defect_class=answer["defect_class"],
            selected_lines=req.selected_lines,
            explanation=req.explanation,
            localisation_score=loc["score"],
            localisation_verdict=loc["verdict"],
            explanation_score=expl["explanation_score"],
            explanation_verdict=expl["explanation_verdict"],
        )
    )
    db.commit()

    return GradeResponse(
        localisation=loc,
        explanation={
            "score": expl["explanation_score"],
            "verdict": expl["explanation_verdict"],
            "note": expl["explanation_note"],
        },
        teaching={
            "where": expl["teaching_where"],
            "why_missed": expl["teaching_why_missed"],
            "pattern": expl["teaching_pattern"],
        },
        defect_class=answer["defect_class"],
        reference_fix=answer["reference"],
    )


@app.get("/profile/{session_id}", response_model=WeaknessProfile)
def profile(session_id: str, db: Session = Depends(get_db)):
    return build_profile(db, session_id)
