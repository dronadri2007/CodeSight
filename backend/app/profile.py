"""Weakness profile: aggregate a session's attempts by defect class and turn
the weakest one into a concrete next step."""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Attempt
from app.schemas import ClassProgress, WeaknessProfile

_MIN_ATTEMPTS_FOR_RECOMMENDATION = 2

# "clean" is the false-positive-trap category, not a skill to drill.
_NOT_A_WEAKNESS = {"clean"}


def build_profile(db: Session, session_id: str) -> WeaknessProfile:
    rows = db.execute(
        select(
            Attempt.defect_class,
            func.count(Attempt.id),
            func.avg(Attempt.localisation_score),
            func.avg(Attempt.explanation_score),
        )
        .where(Attempt.session_id == session_id)
        .group_by(Attempt.defect_class)
    ).all()

    by_class = [
        ClassProgress(
            defect_class=dc,
            attempts=int(n),
            catch_rate=round(float(loc or 0.0), 2),
            avg_explanation=round(float(expl or 0.0), 2),
        )
        for dc, n, loc, expl in rows
    ]
    by_class.sort(key=lambda c: c.catch_rate)

    total = sum(c.attempts for c in by_class)
    weakest = next(
        (
            c
            for c in by_class
            if c.attempts >= _MIN_ATTEMPTS_FOR_RECOMMENDATION
            and c.defect_class not in _NOT_A_WEAKNESS
        ),
        None,
    )

    if weakest is None:
        rec = "Do a few more exercises — not enough attempts yet to spot a pattern."
        weakest_name = None
    else:
        pct = round(weakest.catch_rate * 100)
        weakest_name = weakest.defect_class
        rec = (
            f"Your weakest area is {weakest.defect_class} "
            f"(catch rate {pct}% over {weakest.attempts} attempts). "
            f"Queued: 3 more {weakest.defect_class} exercises."
        )

    return WeaknessProfile(
        session_id=session_id,
        total_attempts=total,
        by_class=by_class,
        weakest_class=weakest_name,
        recommendation=rec,
    )
