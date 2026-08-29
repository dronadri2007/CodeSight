"""SQLAlchemy engine + session. Tables are created on startup (no migrations
for a 3-day build)."""
import logging
from collections.abc import Iterator

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import DATABASE_URL, DB_IS_SQLITE

log = logging.getLogger("codesight.db")

_connect_args = {"check_same_thread": False} if DB_IS_SQLITE else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=_connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    from app import models  # noqa: F401  (register models before create_all)

    Base.metadata.create_all(bind=engine)
    _ensure_columns()


# create_all never ALTERs an existing table. Add columns introduced after the
# attempts table was first deployed (no Alembic for a 3-day build).
_ADDED_COLUMNS = {
    "attempts": {
        "hints_used": "INTEGER NOT NULL DEFAULT 0",
        "seq": "INTEGER NOT NULL DEFAULT 0",
        "integrity_score": "FLOAT",
        "integrity_verdict": "VARCHAR(16) NOT NULL DEFAULT ''",
        "telemetry": "JSON",
    },
}


def _ensure_columns() -> None:
    insp = inspect(engine)
    for table, cols in _ADDED_COLUMNS.items():
        if not insp.has_table(table):
            continue
        existing = {c["name"] for c in insp.get_columns(table)}
        for name, ddl in cols.items():
            if name in existing:
                continue
            with engine.begin() as conn:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))
            log.info("added column %s.%s", table, name)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
