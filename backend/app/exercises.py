"""Load the exercise set and serve it.

Two pools, merged: data/exercises.json (curated, human-reviewed) and, if
present, data/exercises.generated.json (LLM-generated, source="generated").
Answer data (real_lines, fix_diff, reference) is never sent to the client.

A third file, data/exercises.review.json, is an append-only sidecar written
by scripts/review_exercises.py: {id: {status, by, at, note?, patch?}}. It is
merged here at load time so a teammate can review generated exercises on a
separate machine by editing only that file (no merge conflicts with
generation, which only ever appends to exercises.generated.json). status is
one of "approved" | "rejected" | "edited"; "rejected" drops the exercise
from listings, "patch" overrides fields on an "edited" one. Curated
exercises are implicitly "approved".
"""
import json
from pathlib import Path

from fastapi import HTTPException

from app.hints import score_multiplier
from app.schemas import ExerciseFile, ExerciseSummary, HintResponse

_DIR = Path(__file__).parent / "data"
_CURATED = _DIR / "exercises.json"
_GENERATED = _DIR / "exercises.generated.json"
_REVIEW = _DIR / "exercises.review.json"

TIER_ORDER = ["beginner", "intermediate", "pro"]


def next_tier(tier: str) -> str | None:
    i = TIER_ORDER.index(tier)
    return TIER_ORDER[i + 1] if i + 1 < len(TIER_ORDER) else None


def _load_reviews() -> dict[str, dict]:
    if not _REVIEW.exists():
        return {}
    raw = json.loads(_REVIEW.read_text(encoding="utf-8"))
    return raw if isinstance(raw, dict) else {}


def _load() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for path, src in ((_CURATED, "curated"), (_GENERATED, "generated")):
        if not path.exists():
            continue
        for r in json.loads(path.read_text(encoding="utf-8")):
            r.setdefault("difficulty", "beginner")
            r.setdefault("source", src)
            r["review_status"] = "approved" if src == "curated" else "unreviewed"
            out[r["id"]] = r

    for ex_id, entry in _load_reviews().items():
        r = out.get(ex_id)
        if r is None:
            continue
        r["review_status"] = entry.get("status", r["review_status"])
        if isinstance(entry.get("patch"), dict):
            r.update(entry["patch"])
    return out


_EXERCISES = _load()

# --- admin overlay (Postgres) ---------------------------------------------
# Admin edits live in the exercise_overrides table and layer on top of the
# JSON base here, lazily loaded and cached. app/adminstore.py calls
# invalidate() after every write.
_EFFECTIVE: dict[str, dict] | None = None

# Memoised ExerciseSummary lists, keyed by (tier, source, reviewed_only). The
# ~1018 Pydantic models are built once per key; hidden/reported filtering and
# the limit/offset slice happen per-request on a copy. Cleared by invalidate().
_SUMMARY_CACHE: dict[tuple, list[ExerciseSummary]] = {}


def _load_overrides() -> list:
    try:
        from app.db import SessionLocal
        from app.models import ExerciseOverride

        with SessionLocal() as db:
            return [
                {
                    "id": o.id,
                    "op": o.op,
                    "data": o.data or {},
                    "review_status": o.review_status or "",
                }
                for o in db.query(ExerciseOverride).all()
            ]
    except Exception:  # DB not ready / table absent — no overrides
        return []


def _apply_override(merged: dict[str, dict], ov: dict) -> None:
    oid, op = ov["id"], ov["op"]
    if op == "delete":
        merged.pop(oid, None)
        return
    if op == "create":
        rec = dict(ov["data"])
        rec["id"] = oid
        rec.setdefault("source", "admin")
        rec.setdefault("difficulty", "beginner")
        rec.setdefault("language", "python")
        rec.setdefault("hints", [])
        rec["review_status"] = ov["review_status"] or "approved"
        merged[oid] = rec
        return
    base = merged.get(oid)
    if base is None:
        return
    base = dict(base)
    base.update(ov["data"])
    if ov["review_status"]:
        base["review_status"] = ov["review_status"]
    merged[oid] = base


def _effective() -> dict[str, dict]:
    global _EFFECTIVE
    if _EFFECTIVE is not None:
        return _EFFECTIVE
    merged = {k: dict(v) for k, v in _EXERCISES.items()}
    for ov in _load_overrides():
        _apply_override(merged, ov)
    _EFFECTIVE = merged
    return merged


def invalidate() -> None:
    """Drop the effective-set + summary caches — call after any admin write."""
    global _EFFECTIVE
    _EFFECTIVE = None
    _SUMMARY_CACHE.clear()


def _line_count(code: str) -> int:
    return code.count("\n") if code.endswith("\n") else code.count("\n") + 1


def _summary(r: dict) -> ExerciseSummary:
    return ExerciseSummary(
        id=r["id"],
        language=r["language"],
        title=r["title"],
        defect_class=r["defect_class"],
        line_count=_line_count(r["code"]),
        difficulty=r["difficulty"],
        source=r["source"],
    )


def _summaries_for(
    tier: str | None, source: str | None, reviewed_only: bool
) -> list[ExerciseSummary]:
    """Memoised ExerciseSummary list for a (tier, source, reviewed_only) key.
    Cache lookup happens before validation, so an invalid key re-validates (and
    raises) every call rather than being cached. Never mutate the returned list."""
    key = (tier, source, reviewed_only)
    cached = _SUMMARY_CACHE.get(key)
    if cached is not None:
        return cached

    allowed = None
    if tier is not None:
        if tier not in TIER_ORDER:
            raise HTTPException(status_code=422, detail="unknown tier")
        allowed = set(TIER_ORDER[: TIER_ORDER.index(tier) + 1])
    if source is not None and source not in ("curated", "generated"):
        raise HTTPException(status_code=422, detail="unknown source")

    built = [
        _summary(r)
        for r in _effective().values()
        if r.get("review_status") != "rejected"
        and (not reviewed_only or r.get("review_status") == "approved")
        and (allowed is None or r["difficulty"] in allowed)
        and (source is None or r["source"] == source)
    ]
    _SUMMARY_CACHE[key] = built
    return built


def list_summaries(
    tier: str | None = None,
    source: str | None = None,
    hidden_ids: set[str] | None = None,
    reviewed_only: bool = False,
    limit: int | None = None,
    offset: int = 0,
) -> tuple[list[ExerciseSummary], int]:
    """Returns (page, total). `total` is the count after tier/source/hidden/
    reviewed filters, before the limit/offset slice. `limit=None` -> no slice.

    `tier` is cumulative — tier="intermediate" returns beginner + intermediate.
    `source` filters to exactly that pool. `hidden_ids` are excluded (reported).
    Exercises a reviewer marked "rejected" are always excluded; `reviewed_only`
    additionally drops anything not yet "approved"."""
    built = _summaries_for(tier, source, reviewed_only)
    hidden = hidden_ids or set()
    filtered = [s for s in built if s.id not in hidden] if hidden else built
    total = len(filtered)
    if limit is None:
        return list(filtered), total
    return filtered[offset : offset + limit], total


def review_counts() -> dict[str, int]:
    """{status: n} across all exercises — for scripts/review status output."""
    out: dict[str, int] = {}
    for r in _effective().values():
        out[r["review_status"]] = out.get(r["review_status"], 0) + 1
    return out


def all_rows() -> list[dict]:
    """Shallow copies of every exercise record (admin view). Includes answer
    fields — callers must strip what the client shouldn't see."""
    return [dict(r) for r in _effective().values()]


def curated_ids_for_tier(tier: str) -> list[str]:
    """Curated exercise ids at exactly this difficulty, stable order."""
    return [
        r["id"]
        for r in _effective().values()
        if r["source"] == "curated" and r["difficulty"] == tier
    ]


def get_file(exercise_id: str) -> ExerciseFile:
    r = _effective().get(exercise_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return ExerciseFile(
        id=r["id"],
        language=r["language"],
        title=r["title"],
        defect_class=r["defect_class"],
        filename=r["filename"],
        code=r["code"],
        line_count=_line_count(r["code"]),
        hint_count=len(r.get("hints", [])),
        difficulty=r["difficulty"],
        source=r["source"],
    )


def get_hint(exercise_id: str, index: int) -> HintResponse:
    """index is 1-based. 404 for an unknown exercise or an out-of-range hint."""
    r = _effective().get(exercise_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    hints = r.get("hints", [])
    if index < 1 or index > len(hints):
        raise HTTPException(status_code=404, detail="no such hint")
    return HintResponse(
        index=index,
        text=hints[index - 1],
        total=len(hints),
        score_multiplier=score_multiplier(index),
    )


def get_answer(exercise_id: str) -> dict:
    """Answer data for the grader only. Raises 404 if unknown. Resolves by id
    even for a reported/hidden exercise, so an in-progress attempt still works."""
    r = _effective().get(exercise_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return r


def exists(exercise_id: str) -> bool:
    return exercise_id in _effective()
