"""CodeSight API.

Endpoints (see CONTRACT.md):
  GET  /health · GET /debug
  GET  /exercises [?tier= &source=] · GET /exercises/{id} · GET /exercises/{id}/hints/{n}
  POST /grade · POST /ai-review · POST /exercises/{id}/report
  GET  /profile/{session_id} [+/card] · GET /progress/{session_id} · GET /leaderboard
  GET  /session/{session_id} · GET /session/{session_id}/integrity
  GET  /admin/stats · GET /admin/exercises
  GET  /concepts · GET /concept/{id}
  GET  /concept/{id}/micro-check · POST /concept/{id}/micro-check
  GET  /topics · GET /topic/{id} · POST /topic/{id}/predict
  GET  /promotion-test/{session_id} · POST /promotion-test/{session_id}/evaluate
"""
import time
import uuid
from contextlib import asynccontextmanager

import structlog
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.orm import Session

from app import admin as adm
from app import adminauth, adminstore
from app import ai_review, concepts, leaderboard as lb, reports, tiers, topics
from app import exercises as ex
from app.config import (
    ADMIN_TOKEN_TTL_HOURS,
    ALLOWED_ORIGIN_REGEX,
    ALLOWED_ORIGINS,
    DB_IS_SQLITE,
    FIREBASE_SERVICE_ACCOUNT_JSON,
    GEMINI_API_KEY,
    GRADER_MODEL,
)
from app.db import get_db, init_db
from app.firebaseauth import maybe_user, record_graded_submission
from app.grader import diagnostics, grade_explanation
from app.hints import score_multiplier
from app.integrity import build_session_integrity, score_integrity
from app.localisation import score_localisation
from app.models import Attempt
from app.profile import build_profile
from app.progress import build_progress
from app.skillcard import build_skill_card
from app.schemas import (
    AiReviewRequest,
    AiReviewResponse,
    Concept,
    ConceptSummary,
    ExerciseFile,
    ExerciseList,
    GradeRequest,
    GradeResponse,
    HintResponse,
    Leaderboard,
    MicroCheck,
    MicroCheckRequest,
    MicroCheckResult,
    AdminExerciseCreate,
    AdminExerciseFull,
    AdminExercisePatch,
    AdminExercises,
    AdminLoginRequest,
    AdminReviewRequest,
    AdminStats,
    AdminToken,
    AdminWriteResult,
    ProgressReport,
    SessionIntegrity,
    SkillCard,
    PromotionResult,
    PromotionTest,
    ReportRequest,
    ReportResponse,
    SessionInfo,
    TopicFile,
    TopicPredictRequest,
    TopicPredictResult,
    TopicSummary,
    WeaknessProfile,
)

from app.logging import configure_logging
from app.ratelimit import limiter

configure_logging()
log = structlog.get_logger("codesight")


# Create tables at import time so any ASGI runner (and TestClient without a
# lifespan context) has them. create_all is idempotent.
init_db()


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    init_db()
    from app import firebaseauth

    log.info(
        "startup",
        db="sqlite" if DB_IS_SQLITE else "postgres",
        grader_model=GRADER_MODEL,
        gemini_key=bool(GEMINI_API_KEY),
        firebase=bool(FIREBASE_SERVICE_ACCOUNT_JSON),
        admin_api=adminauth.admin_enabled(),
        cors_origins=ALLOWED_ORIGINS,
        cors_regex=bool(ALLOWED_ORIGIN_REGEX),
    )
    log.info("grader_probe", **diagnostics(run_probe=False))
    log.info("firebase_probe", **firebaseauth.status())
    yield


app = FastAPI(title="CodeSight API", lifespan=lifespan)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
def _rate_limited(request: Request, exc: RateLimitExceeded):
    # Sync on purpose: slowapi's SlowAPIMiddleware.sync_check_limits discards a
    # coroutine handler and falls back to its own default body. A plain
    # JSONResponse awaits nothing, so sync is correct on both dispatch paths.
    return JSONResponse(status_code=429, content={"detail": "rate limit exceeded"})


app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX or None,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)


import re as _re

_origin_re = _re.compile(ALLOWED_ORIGIN_REGEX) if ALLOWED_ORIGIN_REGEX else None


def _cors_headers_for(request: Request) -> dict:
    """CORS headers for a response Starlette's CORSMiddleware never sees.

    Starlette's ``ServerErrorMiddleware`` renders the 500 envelope outside
    ``CORSMiddleware``, so a cross-origin ``fetch()`` hitting a 500 would see an
    opaque error instead of the JSON body. Mirror the allow-list check here and
    stamp the headers directly when the request carries an allowed ``Origin``.
    """
    origin = request.headers.get("origin")
    if not origin:
        return {}
    if origin in ALLOWED_ORIGINS or (_origin_re and _origin_re.fullmatch(origin)):
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Expose-Headers": "X-Request-ID",
            "Vary": "Origin",
        }
    return {}


@app.middleware("http")
async def request_context(request: Request, call_next):
    rid = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
    request.state.request_id = rid
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(request_id=rid)
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        dur_ms = round((time.perf_counter() - start) * 1000, 1)
        # No exc_info here: the unhandled-exception handler logs the single
        # traceback for this request. Logging it in both places put two full
        # stacks per 500 in the prod JSON logs.
        log.error(
            "request_error",
            method=request.method,
            path=request.url.path,
            duration_ms=dur_ms,
        )
        raise
    dur_ms = round((time.perf_counter() - start) * 1000, 1)
    log.info(
        "request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=dur_ms,
    )
    response.headers["X-Request-ID"] = rid
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    rid = getattr(request.state, "request_id", None) or request.headers.get("x-request-id", "")
    log.exception("unhandled_error", request_id=rid, path=request.url.path)
    headers = {"X-Request-ID": rid, **_cors_headers_for(request)}
    return JSONResponse(
        status_code=500,
        content={"detail": "internal error", "request_id": rid},
        headers=headers,
    )


@app.get("/")
@limiter.exempt
def root():
    return {"service": "codesight-api", "docs": "/docs", "health": "/health"}


@app.get("/health")
@limiter.exempt
def health():
    return {"ok": True}


@app.get("/debug", dependencies=[Depends(adminauth.require_admin)])
def debug(probe: bool = False):
    """Deploy sanity check. /debug?probe=1 runs one live grader call and
    returns the exception if it fails. No secrets in the response."""
    return {
        "db": "sqlite" if DB_IS_SQLITE else "postgres",
        "allowed_origins": ALLOWED_ORIGINS,
        "allowed_origin_regex": ALLOWED_ORIGIN_REGEX,
        "grader": diagnostics(run_probe=probe),
    }


@app.get("/exercises", response_model=ExerciseList)
def list_exercises(
    tier: str | None = None,
    source: str | None = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """`tier` gates cumulatively (beginner -> +intermediate -> +pro).
    `source=curated|generated` filters the pool. Exercises reported by 3+
    sessions are omitted. Paginated: `limit` 1..500 (default 100), `offset`>=0."""
    items, total = ex.list_summaries(
        tier=tier,
        source=source,
        hidden_ids=reports.hidden_exercise_ids(db),
        limit=limit,
        offset=offset,
    )
    return ExerciseList(items=items, total=total, limit=limit, offset=offset)


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


def _write_profile_bg(uid: str, *, defect_class: str, localisation_score: float,
                      total_score: int, passed: bool, submission: dict) -> None:
    """Run the signed-in Firestore profile write off the request path. Wrapped
    here so a future un-guarded raise in ``record_graded_submission`` cannot
    escape the BackgroundTasks runner."""
    try:
        record_graded_submission(
            uid,
            defect_class=defect_class,
            localisation_score=localisation_score,
            total_score=total_score,
            passed=passed,
            submission=submission,
        )
    except Exception:
        log.exception("profile_write_failed", uid=uid, exercise_id=submission.get("exerciseId"))


@app.post("/grade", response_model=GradeResponse)
def grade(
    req: GradeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: dict | None = Depends(maybe_user),
):
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

    # Integrity telemetry is optional and advisory only — it never changes the
    # grade above, it is just recorded and surfaced.
    integrity = score_integrity(req.explanation, req.telemetry) if req.telemetry else None

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
            integrity_score=integrity.score if integrity else None,
            integrity_verdict=integrity.verdict if integrity else "",
            telemetry=req.telemetry.model_dump() if req.telemetry else None,
        )
    )
    db.commit()

    # Server-authoritative profile write for signed-in users (Firestore, Admin
    # SDK). No-op when Firebase is unconfigured or the request is anonymous.
    if user and user.get("uid"):
        from datetime import datetime, timezone

        submission = {
            "exerciseId": req.exercise_id,
            "defectClass": answer["defect_class"],
            "localisationScore": loc["score"],
            "explanationScore": expl["explanation_score"],
            "scoreAfterHints": score_after_hints,
            "pass": combined >= 0.6,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        background_tasks.add_task(
            _write_profile_bg,
            user["uid"],
            defect_class=answer["defect_class"],
            localisation_score=loc["score"],
            total_score=int(round(score_after_hints)),
            passed=combined >= 0.6,
            submission=submission,
        )

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
        integrity=integrity,
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


@app.get("/profile/{session_id}/card", response_model=SkillCard)
def profile_card(session_id: str, db: Session = Depends(get_db)):
    """Compact shareable summary: tier, catch rate, skill score + headline,
    strongest/weakest class, false-positive discipline, leaderboard rank."""
    return build_skill_card(db, session_id)


@app.get("/progress/{session_id}", response_model=ProgressReport)
def progress(session_id: str, db: Session = Depends(get_db)):
    return build_progress(db, session_id)


@app.get("/leaderboard", response_model=Leaderboard)
def leaderboard(
    limit: int = Query(20, ge=1, le=100),
    min_attempts: int = Query(3, ge=1, le=50),
    tier: str | None = Query(None),
    session_id: str | None = Query(None),
    db: Session = Depends(get_db),
):
    """Sessions ranked by 0.7*catch_rate + 0.3*avg_explanation, over sessions
    with >= min_attempts. `tier` filters to one tier; `session_id` adds a
    `you` row with that session's rank."""
    if tier is not None and not lb.is_valid_tier(tier):
        raise HTTPException(status_code=422, detail="unknown tier")
    return lb.build_leaderboard(
        db, limit=limit, min_attempts=min_attempts, tier=tier, session_id=session_id
    )


# --- admin ---------------------------------------------------------
# Auth: POST /admin/login with ADMIN_PASSWORD -> bearer token; everything else
# needs `Authorization: Bearer <token>`. Whole surface is 503 if ADMIN_PASSWORD
# is unset. Writes are a Postgres overlay on the committed exercise JSON.
@app.post("/admin/login", response_model=AdminToken)
@limiter.limit("5/minute")
def admin_login(request: Request, req: AdminLoginRequest):
    if not adminauth.admin_enabled():
        raise HTTPException(status_code=503, detail="admin API disabled (ADMIN_PASSWORD unset)")
    if not adminauth.check_password(req.password):
        raise HTTPException(status_code=401, detail="wrong password")
    return AdminToken(token=adminauth.mint_token(), ttl_hours=ADMIN_TOKEN_TTL_HOURS)


@app.get("/admin/stats", response_model=AdminStats, dependencies=[Depends(adminauth.require_admin)])
def admin_stats(db: Session = Depends(get_db)):
    return adm.stats(db)


@app.get("/admin/exercises", response_model=AdminExercises, dependencies=[Depends(adminauth.require_admin)])
def admin_exercises(
    search: str | None = Query(None),
    difficulty: str | None = Query(None),
    status: str | None = Query(None),
    source: str | None = Query(None),
    limit: int = Query(500, ge=1, le=2000),
    db: Session = Depends(get_db),
):
    """Every exercise with its review status and report count. `status` accepts
    Approved | Pending | Draft | Archived (or the raw review_status)."""
    return adm.list_exercises(
        db, search=search, difficulty=difficulty, status=status, source=source, limit=limit
    )


@app.get("/admin/exercises/{exercise_id}", response_model=AdminExerciseFull,
         dependencies=[Depends(adminauth.require_admin)])
def admin_exercise_detail(exercise_id: str):
    r = ex._effective().get(exercise_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return AdminExerciseFull(
        id=r["id"], language=r.get("language", "python"), title=r["title"],
        defect_class=r["defect_class"], difficulty=r["difficulty"],
        filename=r.get("filename", "snippet.py"), code=r["code"],
        real_lines=r.get("real_lines", []), fix_diff=r.get("fix_diff", ""),
        reference=r.get("reference", ""), hints=r.get("hints", []),
        source=r["source"], review_status=r.get("review_status", ""),
    )


@app.post("/admin/exercises", response_model=AdminWriteResult, status_code=201,
          dependencies=[Depends(adminauth.require_admin)])
def admin_exercise_create(req: AdminExerciseCreate, db: Session = Depends(get_db)):
    try:
        exid = adminstore.create(db, req.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return AdminWriteResult(id=exid, review_status=adminstore.effective_status(exid))


@app.put("/admin/exercises/{exercise_id}", response_model=AdminWriteResult,
         dependencies=[Depends(adminauth.require_admin)])
def admin_exercise_update(exercise_id: str, req: AdminExercisePatch, db: Session = Depends(get_db)):
    try:
        adminstore.patch(db, exercise_id, req.model_dump(exclude_none=True))
    except KeyError:
        raise HTTPException(status_code=404, detail="unknown exercise")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return AdminWriteResult(id=exercise_id, review_status=adminstore.effective_status(exercise_id))


@app.delete("/admin/exercises/{exercise_id}", response_model=AdminWriteResult,
            dependencies=[Depends(adminauth.require_admin)])
def admin_exercise_delete(exercise_id: str, db: Session = Depends(get_db)):
    try:
        adminstore.delete(db, exercise_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return AdminWriteResult(id=exercise_id, review_status="deleted")


@app.post("/admin/exercises/{exercise_id}/review", response_model=AdminWriteResult,
          dependencies=[Depends(adminauth.require_admin)])
def admin_exercise_review(exercise_id: str, req: AdminReviewRequest, db: Session = Depends(get_db)):
    try:
        adminstore.set_review(db, exercise_id, req.status, req.note)
    except KeyError:
        raise HTTPException(status_code=404, detail="unknown exercise")
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    return AdminWriteResult(id=exercise_id, review_status=adminstore.effective_status(exercise_id))


# --- concepts (recommendation engine) --------------------------------
@app.get("/concepts", response_model=list[ConceptSummary])
def list_concepts():
    return concepts.list_concepts()


@app.get("/concept/{concept_id}", response_model=Concept)
def get_concept(concept_id: str):
    return concepts.get_concept(concept_id)


@app.get("/concept/{concept_id}/micro-check", response_model=MicroCheck)
def get_micro_check(concept_id: str):
    return concepts.get_micro_check(concept_id)


@app.post("/concept/{concept_id}/micro-check", response_model=MicroCheckResult)
def submit_micro_check(concept_id: str, req: MicroCheckRequest):
    return concepts.grade_micro_check(concept_id, req.answers)


# --- topic prediction (stateless, deterministic) --------------------
@app.get("/topics", response_model=list[TopicSummary])
def list_topics():
    return topics.list_topics()


@app.get("/topic/{topic_id}", response_model=TopicFile)
@app.get("/topics/{topic_id}", response_model=TopicFile)
def get_topic(topic_id: str):
    return topics.get_topic(topic_id)


@app.post("/topic/{topic_id}/predict", response_model=TopicPredictResult)
@app.post("/topics/{topic_id}/predict", response_model=TopicPredictResult)
def predict_topic(topic_id: str, req: TopicPredictRequest):
    return topics.predict(topic_id, req.predicted_classes)


# --- tiers + promotion -------------------------------------------
@app.get("/session/{session_id}", response_model=SessionInfo)
def get_session(session_id: str, db: Session = Depends(get_db)):
    return tiers.session_info(db, session_id)


@app.get("/session/{session_id}/integrity", response_model=SessionIntegrity)
def get_session_integrity(
    session_id: str,
    verdict: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    """Mentor view: telemetry-carrying attempts for this session with their
    integrity verdict + flags, newest first. `verdict` filters to
    clean|review|flagged."""
    if verdict is not None and verdict not in {"clean", "review", "flagged"}:
        raise HTTPException(status_code=422, detail="verdict must be clean|review|flagged")
    return build_session_integrity(db, session_id, verdict=verdict, limit=limit)


@app.get("/promotion-test/{session_id}", response_model=PromotionTest)
def get_promotion_test(session_id: str, db: Session = Depends(get_db)):
    return tiers.promotion_test(db, session_id)


@app.post("/promotion-test/{session_id}/evaluate", response_model=PromotionResult)
def evaluate_promotion_test(session_id: str, db: Session = Depends(get_db)):
    return tiers.evaluate_promotion(db, session_id)
