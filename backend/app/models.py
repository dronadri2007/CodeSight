"""Database models. One table: a graded submission ("attempt")."""
import itertools
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base

# Process-local monotonic counter — a tiebreaker for attempts written in the
# same millisecond (order_by uses created_at first, so cross-process ordering
# still relies on the timestamp).
_seq = itertools.count(1)


def _uuid() -> str:
    return str(uuid.uuid4())


def _next_seq() -> int:
    return next(_seq)


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Attempt(Base):
    __tablename__ = "attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String(64), index=True)
    exercise_id: Mapped[str] = mapped_column(String(64), index=True)
    defect_class: Mapped[str] = mapped_column(String(64), index=True)

    selected_lines: Mapped[list] = mapped_column(JSON, default=list)
    explanation: Mapped[str] = mapped_column(Text, default="")
    hints_used: Mapped[int] = mapped_column(Integer, default=0)

    localisation_score: Mapped[float] = mapped_column(Float, default=0.0)
    localisation_verdict: Mapped[str] = mapped_column(String(32), default="")
    explanation_score: Mapped[float] = mapped_column(Float, default=0.0)
    explanation_verdict: Mapped[str] = mapped_column(String(32), default="")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    seq: Mapped[int] = mapped_column(Integer, default=_next_seq, index=True)
