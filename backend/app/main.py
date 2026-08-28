"""CodeSight API.

Endpoints (see CONTRACT.md):
  GET  /health · GET /debug
  GET  /exercises [?tier= &source=] · GET /exercises/{id} · GET /exercises/{id}/hints/{n}
  POST /grade · POST /ai-review · POST /exercises/{id}/report
  GET  /profile/{session_id} · GET /progress/{session_id}
  GET  /session/{session_id}
  GET  /concepts · GET /concept/{id}
  GET  /promotion-test/{session_id} · POST /promotion-test/{session_id}/evaluate
"""
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app import ai_review, concepts, reports, tiers
from app import exercises as ex
from app.config import (
    ALLOWED_ORIGIN_REGEX,
    ALLOWED_ORIGINS,
    DB_IS_SQLITE,
    GRADER_MODEL,
)
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
    Concept,
    ConceptSummary,
    ExerciseFile,
    ExerciseSummary,
    GradeRequest,
    GradeResponse,
    HintResponse,
    ProgressReport,
    PromotionResult,
    PromotionTest,
    ReportRequest,
    ReportResponse,
    SessionInfo,
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
    allow_origin_regex=ALLOWED_ORIGIN_REGEX or None,
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
        "allowed_origin_regex": ALLOWED_ORIGIN_REGEX,
        "grader": diagnostics(run_probe=probe),
    }


@app.get("/exercises", response_model=list[ExerciseSummary])
def list_exercises(
    tier: str | None = None,
    source: str | None = None,
    db: Session = Depends(get_db),
):
    """`tier` gates cumulatively (beginner -> +intermediate -> +pro).
    `source=curated` hides generated exercises. Exercises reported by 3+
    sessions are omitted."""
    return ex.list_summaries(
        tier=tier, source=source, hidden_ids=reports.hidden_exercise_ids(db)
    )


@app.get("/exercises/{exercise_id}", response_model=ExerciseFile)
def get_exercise(exercise_id: str):
    return ex.get_file(exercise_id)


@app.post("/exercises/{exercise_id}/report", response_model=ReportResponse)
def report_exercise(exercise_id: str, req: ReportRequest, db: Session = Depends(get_db)):
    if not ex.exists(exercise_id):
        raise HTTPException(status_code=404, detail="unknown exercise")
    count, hidden = reports.record_report(db, exercise_id, req.session_id, req.reason)
    return ReportResponse(exercise_id=exercise_id, reports=count, hidden=hidden)


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
    findings, available, err = ai_review.ai_findings(req.exercise_id, answer["code"])
    cmp = ai_review.compare(answer["real_lines"], req.selected_lines, findings)
    if not available:
        cmp["headline"] = "AI review is unavailable right now - showing your findings only."
    return AiReviewResponse(
        exercise_id=req.exercise_id, ai_available=available, ai_error=err, **cmp
    )


@app.get("/profile/{session_id}", response_model=WeaknessProfile)
def profile(session_id: str, db: Session = Depends(get_db)):
    return build_profile(db, session_id)


@app.get("/progress/{session_id}", response_model=ProgressReport)
def progress(session_id: str, db: Session = Depends(get_db)):
    return build_progress(db, session_id)


# --- concepts (recommendation engine) --------------------------------
@app.get("/concepts", response_model=list[ConceptSummary])
def list_concepts():
    return concepts.list_concepts()


@app.get("/concept/{concept_id}", response_model=Concept)
def get_concept(concept_id: str):
    return concepts.get_concept(concept_id)


# --- tiers + promotion -------------------------------------------
@app.get("/session/{session_id}", response_model=SessionInfo)
def get_session(session_id: str, db: Session = Depends(get_db)):
    return tiers.session_info(db, session_id)


@app.get("/promotion-test/{session_id}", response_model=PromotionTest)
def get_promotion_test(session_id: str, db: Session = Depends(get_db)):
    return tiers.promotion_test(db, session_id)


@app.post("/promotion-test/{session_id}/evaluate", response_model=PromotionResult)
def evaluate_promotion_test(session_id: str, db: Session = Depends(get_db)):
    return tiers.evaluate_promotion(db, session_id)
