"""Database models. One table: a graded submission ("attempt")."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


def _uuid() -> str:
    return str(uuid.uuid4())


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

    localisation_score: Mapped[float] = mapped_column(Float, default=0.0)
    localisation_verdict: Mapped[str] = mapped_column(String(32), default="")
    explanation_score: Mapped[float] = mapped_column(Float, default=0.0)
    explanation_verdict: Mapped[str] = mapped_column(String(32), default="")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
