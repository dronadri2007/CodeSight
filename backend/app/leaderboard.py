"""GET /leaderboard — rank sessions by review skill.

Score is a composite so neither grinding volume nor a couple of lucky easy
catches tops the board:

    score = 0.7 * mean(localisation_score) + 0.3 * mean(explanation_score)

Only sessions with at least `min_attempts` graded submissions are ranked.
Ties break by attempts (more = higher), then by session id for stability.
"""
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.exercises import TIER_ORDER
from app.models import Attempt, LearnerSession
from app.schemas import Leaderboard, LeaderboardEntry

_W_LOC = 0.7
_W_EXPL = 0.3


def is_valid_tier(tier: str) -> bool:
    return tier in TIER_ORDER


def build_leaderboard(
    db: Session,
    *,
    limit: int = 20,
    min_attempts: int = 3,
    tier: str | None = None,
    session_id: str | None = None,
) -> Leaderboard:
    tiers = {s.session_id: s.tier for s in db.query(LearnerSession).all()}

    rows = db.execute(
        select(
            Attempt.session_id,
            func.count(Attempt.id),
            func.avg(Attempt.localisation_score),
            func.avg(Attempt.explanation_score),
        ).group_by(Attempt.session_id)
    ).all()

    ranked: list[LeaderboardEntry] = []
    for sid, n, loc, expl in rows:
        n = int(n)
        if n < min_attempts:
            continue
        s_tier = tiers.get(sid, "beginner")
        if tier is not None and s_tier != tier:
            continue
        catch = round(float(loc or 0.0), 3)
        avg_expl = round(float(expl or 0.0), 3)
        ranked.append(
            LeaderboardEntry(
                rank=0,
                session_id=sid,
                tier=s_tier,
                attempts=n,
                catch_rate=catch,
                avg_explanation=avg_expl,
                score=round(_W_LOC * catch + _W_EXPL * avg_expl, 3),
            )
        )

    ranked.sort(key=lambda e: (-e.score, -e.attempts, e.session_id))
    for i, e in enumerate(ranked, 1):
        e.rank = i

    you = next((e for e in ranked if e.session_id == session_id), None) if session_id else None

    return Leaderboard(
        generated_at=datetime.now(timezone.utc).isoformat(),
        min_attempts=min_attempts,
        total_ranked=len(ranked),
        entries=ranked[:limit],
        you=you,
    )
