"""Learner tiers and promotion tests.

Tiers: beginner -> intermediate -> pro. Each session starts at beginner.
A promotion test is 3 CURATED exercises from the next tier up; passing needs
the student's FIRST-attempt mean localisation score >= PROMOTION_PASS.
Generated exercises are never used in a test.
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import exercises as ex
from app.models import Attempt, LearnerSession
from app.schemas import PromotionResult, PromotionTest, SessionInfo

PROMOTION_TEST_SIZE = 3
PROMOTION_PASS = 0.7


def get_or_create(db: Session, session_id: str) -> LearnerSession:
    row = db.get(LearnerSession, session_id)
    if row is None:
        row = LearnerSession(session_id=session_id, tier="beginner")
        db.add(row)
        db.commit()
    return row


def _test_exercise_ids(to_tier: str) -> list[str]:
    return ex.curated_ids_for_tier(to_tier)[:PROMOTION_TEST_SIZE]


def session_info(db: Session, session_id: str) -> SessionInfo:
    s = get_or_create(db, session_id)
    nxt = ex.next_tier(s.tier)
    available = nxt is not None and len(_test_exercise_ids(nxt)) == PROMOTION_TEST_SIZE
    return SessionInfo(
        session_id=session_id,
        tier=s.tier,
        next_tier=nxt,
        promotion_test_available=available,
    )


def promotion_test(db: Session, session_id: str) -> PromotionTest:
    s = get_or_create(db, session_id)
    nxt = ex.next_tier(s.tier)
    if nxt is None:
        return PromotionTest(
            session_id=session_id, eligible=False, from_tier=s.tier, to_tier=None,
            exercise_ids=[], reason="Already at the top tier (pro).",
        )
    ids = _test_exercise_ids(nxt)
    if len(ids) < PROMOTION_TEST_SIZE:
        return PromotionTest(
            session_id=session_id, eligible=False, from_tier=s.tier, to_tier=nxt,
            exercise_ids=ids,
            reason=f"Not enough curated {nxt} exercises for a test yet.",
        )
    return PromotionTest(
        session_id=session_id, eligible=True, from_tier=s.tier, to_tier=nxt,
        exercise_ids=ids,
        reason=f"Review these {PROMOTION_TEST_SIZE} {nxt} exercises. "
               f"First-attempt mean localisation >= {PROMOTION_PASS} promotes you.",
    )


def _first_attempt_score(db: Session, session_id: str, exercise_id: str) -> float | None:
    row = db.execute(
        select(Attempt.localisation_score)
        .where(Attempt.session_id == session_id, Attempt.exercise_id == exercise_id)
        .order_by(Attempt.created_at, Attempt.seq)
        .limit(1)
    ).first()
    return row[0] if row else None


def evaluate_promotion(db: Session, session_id: str) -> PromotionResult:
    s = get_or_create(db, session_id)
    from_tier = s.tier
    nxt = ex.next_tier(from_tier)
    if nxt is None:
        return PromotionResult(
            session_id=session_id, passed=False, from_tier=from_tier, to_tier=None,
            tier_after=from_tier, scores=[], mean_score=0.0, needed=PROMOTION_PASS,
            missing=[],
        )

    ids = _test_exercise_ids(nxt)
    scores: list[float] = []
    missing: list[str] = []
    for xid in ids:
        sc = _first_attempt_score(db, session_id, xid)
        if sc is None:
            missing.append(xid)
        else:
            scores.append(round(sc, 2))

    if missing:
        return PromotionResult(
            session_id=session_id, passed=False, from_tier=from_tier, to_tier=nxt,
            tier_after=from_tier, scores=scores,
            mean_score=round(sum(scores) / len(scores), 2) if scores else 0.0,
            needed=PROMOTION_PASS, missing=missing,
        )

    mean = round(sum(scores) / len(scores), 2)
    passed = mean >= PROMOTION_PASS
    if passed:
        s.tier = nxt
        db.commit()
    return PromotionResult(
        session_id=session_id, passed=passed, from_tier=from_tier, to_tier=nxt,
        tier_after=s.tier, scores=scores, mean_score=mean,
        needed=PROMOTION_PASS, missing=[],
    )
