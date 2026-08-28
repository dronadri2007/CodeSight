"""Progress-over-time: a session's attempts in order, with a running catch-rate
and a per-class first-vs-latest trend."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Attempt
from app.schemas import ClassTrend, ProgressReport, TimelinePoint


def build_progress(db: Session, session_id: str) -> ProgressReport:
    rows = db.scalars(
        select(Attempt)
        .where(Attempt.session_id == session_id)
        .order_by(Attempt.created_at, Attempt.seq)
    ).all()

    timeline: list[TimelinePoint] = []
    running_sum = 0.0
    per_class: dict[str, list[float]] = {}

    for i, a in enumerate(rows, start=1):
        running_sum += a.localisation_score
        timeline.append(
            TimelinePoint(
                n=i,
                created_at=a.created_at.isoformat(),
                exercise_id=a.exercise_id,
                defect_class=a.defect_class,
                localisation_score=round(a.localisation_score, 2),
                explanation_score=round(a.explanation_score, 2),
                cumulative_catch_rate=round(running_sum / i, 2),
            )
        )
        per_class.setdefault(a.defect_class, []).append(a.localisation_score)

    by_class = [
        ClassTrend(
            defect_class=dc,
            attempts=len(scores),
            scores=[round(s, 2) for s in scores],
            first_catch_rate=round(scores[0], 2),
            latest_catch_rate=round(scores[-1], 2),
            improved=scores[-1] > scores[0],
        )
        for dc, scores in sorted(per_class.items())
    ]

    return ProgressReport(
        session_id=session_id,
        total_attempts=len(rows),
        timeline=timeline,
        by_class=by_class,
    )
