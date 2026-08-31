"""Read-only admin views over the exercise corpus.

CodeSight has no auth and no exercise CRUD API — exercises are committed JSON
and the review workflow is scripts/review_exercises.py writing a sidecar. This
module just aggregates what already exists so an admin dashboard can show
corpus + review-progress at a glance.
"""
from collections import Counter

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import exercises as ex
from app import reports
from app.models import Attempt, ExerciseReport, LearnerSession
from app.schemas import AdminExerciseRow, AdminExercises, AdminStats

# review_status  ->  the dashboard's status vocabulary
_STATUS = {
    "approved": "Approved",
    "unreviewed": "Pending",
    "edited": "Draft",
    "rejected": "Archived",
}
# backend tier  ->  the dashboard's difficulty vocabulary
_DIFF = {"beginner": "Easy", "intermediate": "Medium", "pro": "Hard"}


def _row(r: dict, report_n: int) -> AdminExerciseRow:
    code = r.get("code", "")
    return AdminExerciseRow(
        id=r["id"],
        title=r["title"],
        defect_class=r["defect_class"],
        difficulty=r["difficulty"],
        difficulty_label=_DIFF.get(r["difficulty"], r["difficulty"]),
        source=r["source"],
        review_status=r.get("review_status", "unreviewed"),
        status_label=_STATUS.get(r.get("review_status", "unreviewed"), "Pending"),
        reports=report_n,
        line_count=code.count("\n") + (0 if code.endswith("\n") else 1),
        hint_count=len(r.get("hints", [])),
    )


def list_exercises(
    db: Session,
    *,
    search: str | None = None,
    difficulty: str | None = None,
    status: str | None = None,
    source: str | None = None,
    limit: int = 500,
) -> AdminExercises:
    _VALID_STATUS = {
        "all",
        *(_STATUS.keys()),  # approved, unreviewed, edited, rejected
        *(v.lower() for v in _STATUS.values()),  # approved, pending, draft, archived
        "deleted",
    }
    if status and status.lower() not in _VALID_STATUS:
        raise HTTPException(status_code=422, detail="unknown status filter")

    rc = reports.report_counts(db)
    rows = [_row(r, rc.get(r["id"], 0)) for r in ex.all_rows()]
    total = len(rows)

    q = (search or "").strip().lower()
    if q:
        rows = [x for x in rows if q in x.title.lower() or q in x.defect_class.lower() or q in x.id.lower()]
    if difficulty and difficulty not in ("All", "all"):
        d = difficulty.lower()
        rows = [x for x in rows if x.difficulty == d or x.difficulty_label.lower() == d]
    if status and status not in ("All", "all"):
        s = status.lower()
        rows = [x for x in rows if x.review_status == s or x.status_label.lower() == s]
    if source and source not in ("All", "all"):
        rows = [x for x in rows if x.source == source.lower()]

    rows.sort(key=lambda x: x.id)
    return AdminExercises(total=total, matched=len(rows), exercises=rows[:limit])


def stats(db: Session) -> AdminStats:
    rows = ex.all_rows()
    rc = reports.report_counts(db)
    by_status = Counter(_STATUS.get(r.get("review_status", "unreviewed"), "Pending") for r in rows)
    return AdminStats(
        total=len(rows),
        by_status=dict(by_status),
        by_source=dict(Counter(r["source"] for r in rows)),
        by_difficulty=dict(Counter(r["difficulty"] for r in rows)),
        by_defect_class=dict(Counter(r["defect_class"] for r in rows)),
        reported=len(rc),
        hidden=len(reports.hidden_exercise_ids(db)),
        sessions=db.scalar(select(func.count(LearnerSession.session_id))) or 0,
        attempts=db.scalar(select(func.count(Attempt.id))) or 0,
        distinct_reporters=db.scalar(select(func.count(func.distinct(ExerciseReport.session_id)))) or 0,
    )
