"""Write path for admin exercise edits — a Postgres overlay on the committed
JSON. Every write bumps app.exercises' effective-set cache via invalidate().
"""
import ast
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app import exercises as ex
from app.models import ExerciseOverride

REVIEW_STATES = {"approved", "rejected", "edited", "unreviewed"}
_CLASSES = {"injection", "auth", "error-handling", "concurrency", "logic", "resource", "clean"}
_TIERS = {"beginner", "intermediate", "pro"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _next_admin_id(db: Session) -> str:
    n = 0
    for (oid,) in db.query(ExerciseOverride.id).filter(ExerciseOverride.id.like("adm-%")):
        try:
            n = max(n, int(oid.split("-")[1]))
        except (IndexError, ValueError):
            pass
    return f"adm-{n + 1:04d}"


def _validate(rec: dict, *, full: bool) -> None:
    if full:
        missing = {"title", "defect_class", "difficulty", "code"} - rec.keys()
        if missing:
            raise ValueError(f"missing required fields: {sorted(missing)}")
    if rec.get("defect_class") and rec["defect_class"] not in _CLASSES:
        raise ValueError(f"defect_class must be one of {sorted(_CLASSES)}")
    if rec.get("difficulty") and rec["difficulty"] not in _TIERS:
        raise ValueError(f"difficulty must be one of {sorted(_TIERS)}")
    if "code" in rec and rec["code"] is not None:
        try:
            ast.parse(rec["code"])
        except SyntaxError as e:
            raise ValueError(f"code does not parse: {e}") from None
    if "real_lines" in rec and rec["real_lines"] is not None:
        if not isinstance(rec["real_lines"], list) or not all(isinstance(x, int) for x in rec["real_lines"]):
            raise ValueError("real_lines must be a list of ints")


def _upsert(db: Session, exid: str, *, op: str, data: dict | None = None,
            review_status: str | None = None, note: str | None = None, by: str = "admin") -> ExerciseOverride:
    row = db.get(ExerciseOverride, exid)
    if row is None:
        row = ExerciseOverride(id=exid, op=op)
        db.add(row)
    row.op = op
    if data is not None:
        row.data = {**(row.data or {}), **data}
    if review_status is not None:
        row.review_status = review_status
    if note is not None:
        row.note = note
    row.updated_by = by
    row.updated_at = _now()
    db.commit()
    ex.invalidate()
    return row


def effective_status(exid: str) -> str:
    return ex._effective().get(exid, {}).get("review_status", "")


def exists(exid: str) -> bool:
    return exid in ex._effective()


def create(db: Session, rec: dict, by: str = "admin") -> str:
    _validate(rec, full=True)
    exid = _next_admin_id(db)
    full = {
        "id": exid,
        "language": rec.get("language", "python"),
        "title": rec["title"],
        "defect_class": rec["defect_class"],
        "difficulty": rec["difficulty"],
        "filename": rec.get("filename") or "snippet.py",
        "code": rec["code"],
        "real_lines": rec.get("real_lines", []),
        "fix_diff": rec.get("fix_diff", ""),
        "reference": rec.get("reference", ""),
        "hints": rec.get("hints", []),
        "source": "admin",
    }
    _upsert(db, exid, op="create", data=full,
            review_status=rec.get("review_status") or "approved", by=by)
    return exid


def patch(db: Session, exid: str, data: dict, by: str = "admin") -> None:
    if not exists(exid):
        raise KeyError(exid)
    clean = {k: v for k, v in data.items() if v is not None}
    _validate(clean, full=False)
    existing = db.get(ExerciseOverride, exid)
    op = "create" if existing is not None and existing.op == "create" else "patch"
    _upsert(db, exid, op=op, data=clean, by=by)


def delete(db: Session, exid: str, by: str = "admin") -> None:
    if not exists(exid):
        raise KeyError(exid)
    _upsert(db, exid, op="delete", by=by)


def set_review(db: Session, exid: str, status: str, note: str = "", by: str = "admin") -> None:
    if status not in REVIEW_STATES:
        raise ValueError(f"status must be one of {sorted(REVIEW_STATES)}")
    if not exists(exid):
        raise KeyError(exid)
    existing = db.get(ExerciseOverride, exid)
    op = "create" if existing is not None and existing.op == "create" else "patch"
    _upsert(db, exid, op=op, review_status=status, note=note, by=by)
