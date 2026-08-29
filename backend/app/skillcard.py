"""GET /profile/{id}/card — a compact, shareable summary of a session's
review skill. Same composite as the leaderboard; adds a headline label,
strongest/weakest class, false-positive discipline, and leaderboard rank.
"""
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.leaderboard import _W_EXPL, _W_LOC, build_leaderboard
from app.models import Attempt
from app.schemas import SkillCard
from app.tiers import get_or_create

_NAMED_CLASSES = {"injection", "auth", "error-handling", "concurrency", "logic", "resource"}
_MIN_FOR_EXTREMES = 2       # attempts in a class before it can be strongest/weakest
_LEADERBOARD_MIN = 3       # keep in step with GET /leaderboard's default


def _headline(score: float, attempts: int) -> str:
    if attempts < 3:
        return "Just Started"
    if score >= 0.85:
        return "Sharp Reviewer"
    if score >= 0.70:
        return "Solid Reviewer"
    if score >= 0.50:
        return "Developing Reviewer"
    if score >= 0.25:
        return "Warming Up"
    return "Just Started"


def build_skill_card(db: Session, session_id: str) -> SkillCard:
    tier = get_or_create(db, session_id).tier

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

    per_class = {
        dc: {"n": int(n), "catch": float(loc or 0.0), "expl": float(expl or 0.0)}
        for dc, n, loc, expl in rows
    }
    total = sum(c["n"] for c in per_class.values())

    if total:
        catch_rate = round(sum(c["catch"] * c["n"] for c in per_class.values()) / total, 3)
        avg_expl = round(sum(c["expl"] * c["n"] for c in per_class.values()) / total, 3)
    else:
        catch_rate = avg_expl = 0.0
    skill_score = round(_W_LOC * catch_rate + _W_EXPL * avg_expl, 3)

    named = {
        dc: c for dc, c in per_class.items()
        if dc in _NAMED_CLASSES and c["n"] >= _MIN_FOR_EXTREMES
    }
    strongest = max(named, key=lambda dc: named[dc]["catch"], default=None)
    weakest = min(named, key=lambda dc: named[dc]["catch"], default=None)
    if strongest is not None and strongest == weakest:
        weakest = None  # only one qualifying class — don't report it as both

    fp = per_class.get("clean")
    fp_discipline = round(fp["catch"], 3) if fp else None

    board = build_leaderboard(
        db, limit=1, min_attempts=_LEADERBOARD_MIN, session_id=session_id
    )

    return SkillCard(
        session_id=session_id,
        generated_at=datetime.now(timezone.utc).isoformat(),
        tier=tier,
        total_attempts=total,
        classes_covered=len(_NAMED_CLASSES & per_class.keys()),
        catch_rate=catch_rate,
        avg_explanation=avg_expl,
        skill_score=skill_score,
        headline=_headline(skill_score, total),
        strongest_class=strongest,
        weakest_class=weakest,
        false_positive_discipline=fp_discipline,
        leaderboard_rank=board.you.rank if board.you else None,
        ranked_out_of=board.total_ranked,
    )
