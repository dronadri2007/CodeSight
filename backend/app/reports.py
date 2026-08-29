"""Exercise reporting. Because the generated pool is unvalidated, an exercise
reported by REPORT_THRESHOLD distinct sessions is dropped from listings and
practice (it still resolves by id so an in-progress attempt finishes)."""
from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from app.models import ExerciseReport

REPORT_THRESHOLD = 3


def record_report(db: Session, exercise_id: str, session_id: str, reason: str) -> tuple[int, bool]:
    db.add(ExerciseReport(exercise_id=exercise_id, session_id=session_id, reason=reason))
    db.commit()
    count = db.scalar(
        select(func.count(distinct(ExerciseReport.session_id))).where(
            ExerciseReport.exercise_id == exercise_id
        )
    ) or 0
    return count, count >= REPORT_THRESHOLD


def hidden_exercise_ids(db: Session) -> set[str]:
    rows = db.execute(
        select(ExerciseReport.exercise_id)
        .group_by(ExerciseReport.exercise_id)
        .having(func.count(distinct(ExerciseReport.session_id)) >= REPORT_THRESHOLD)
    ).all()
    return {r[0] for r in rows}


def report_counts(db: Session) -> dict[str, int]:
    """{exercise_id: distinct-session report count} for every reported exercise."""
    rows = db.execute(
        select(ExerciseReport.exercise_id, func.count(distinct(ExerciseReport.session_id)))
        .group_by(ExerciseReport.exercise_id)
    ).all()
    return {eid: int(n) for eid, n in rows}
