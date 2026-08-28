"""CodeSight API.

Endpoints (see CONTRACT.md):
  GET  /health
  GET  /exercises
  GET  /exercises/{id}
  GET  /exercises/{id}/hints/{n}
  POST /grade
  POST /ai-review
  GET  /profile/{session_id}
  GET  /progress/{session_id}
"""
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import ai_review
from app import exercises as ex
from app.config import ALLOWED_ORIGINS, DB_IS_SQLITE, GRADER_MODEL
from app.db import get_db, init_db
from app.grader import diagnostics, grade_explanation
from app.hints import score_multiplier
from app.localisation import score_localisation
from app.models import Attempt
from app.profile import build_profile
from app.progress import build_progress
from app.schemas import (
    AiReviewRequest,
    AiReviewResponse,
    ExerciseFile,
    ExerciseSummary,
    GradeRequest,
    GradeResponse,
    HintResponse,
    ProgressReport,
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


@app.get("/")
def root():
    return {"service": "codesight-api", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/debug")
def debug(probe: bool = False):
    """Deploy sanity check. /debug?probe=1 runs one live grader call and
    returns the exception if it fails. No secrets in the response."""
    return {
        "db": "sqlite" if DB_IS_SQLITE else "postgres",
        "allowed_origins": ALLOWED_ORIGINS,
        "grader": diagnostics(run_probe=probe),
    }


@app.get("/exercises", response_model=list[ExerciseSummary])
def list_exercises():
    return ex.list_summaries()


@app.get("/exercises/{exercise_id}", response_model=ExerciseFile)
def get_exercise(exercise_id: str):
    return ex.get_file(exercise_id)


@app.get("/exercises/{exercise_id}/hints/{index}", response_model=HintResponse)
def get_hint(exercise_id: str, index: int):
    """One hint at a time. `index` is 1-based. `score_multiplier` is what the
    final grade is scaled by if the student stops asking here."""
    return ex.get_hint(exercise_id, index)


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

    # Raw scores are stored unchanged so the weakness profile stays unaided.
    # Hints only scale the score shown for this attempt.
    mult = score_multiplier(req.hints_used)
    combined = (loc["score"] + expl["explanation_score"]) / 2
    score_after_hints = round(combined * mult, 2)

    db.add(
        Attempt(
            session_id=req.session_id,
            exercise_id=req.exercise_id,
            defect_class=answer["defect_class"],
            selected_lines=req.selected_lines,
            explanation=req.explanation,
            hints_used=req.hints_used,
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
        hints_used=req.hints_used,
        hint_multiplier=mult,
        score_after_hints=score_after_hints,
    )


@app.post("/ai-review", response_model=AiReviewResponse)
def ai_review_endpoint(req: AiReviewRequest):
    """Run the model as an independent reviewer of the same file, then compare
    its findings with the student's marked lines and the ground-truth fix."""
    answer = ex.get_answer(req.exercise_id)
    findings, available = ai_review.ai_findings(req.exercise_id, answer["code"])
    cmp = ai_review.compare(answer["real_lines"], req.selected_lines, findings)
    if not available:
        cmp["headline"] = "AI review is unavailable right now - showing your findings only."
    return AiReviewResponse(exercise_id=req.exercise_id, ai_available=available, **cmp)


@app.get("/profile/{session_id}", response_model=WeaknessProfile)
def profile(session_id: str, db: Session = Depends(get_db)):
    return build_profile(db, session_id)


@app.get("/progress/{session_id}", response_model=ProgressReport)
def progress(session_id: str, db: Session = Depends(get_db)):
    return build_progress(db, session_id)
