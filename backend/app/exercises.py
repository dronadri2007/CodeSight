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


def list_summaries(
    tier: str | None = None,
    source: str | None = None,
    hidden_ids: set[str] | None = None,
    reviewed_only: bool = False,
) -> list[ExerciseSummary]:
    """`tier` is cumulative — tier="intermediate" returns beginner + intermediate.
    `source` filters to exactly that pool. `hidden_ids` are excluded (reported).
    Exercises a reviewer marked "rejected" are always excluded; `reviewed_only`
    additionally drops anything not yet "approved"."""
    allowed = None
    if tier is not None:
        if tier not in TIER_ORDER:
            raise HTTPException(status_code=422, detail="unknown tier")
        allowed = set(TIER_ORDER[: TIER_ORDER.index(tier) + 1])
    hidden = hidden_ids or set()
    return [
        _summary(r)
        for r in _EXERCISES.values()
        if r["id"] not in hidden
        and r.get("review_status") != "rejected"
        and (not reviewed_only or r.get("review_status") == "approved")
        and (allowed is None or r["difficulty"] in allowed)
        and (source is None or r["source"] == source)
    ]


def review_counts() -> dict[str, int]:
    """{status: n} across all exercises — for scripts/review status output."""
    out: dict[str, int] = {}
    for r in _EXERCISES.values():
        out[r["review_status"]] = out.get(r["review_status"], 0) + 1
    return out


def curated_ids_for_tier(tier: str) -> list[str]:
    """Curated exercise ids at exactly this difficulty, stable order."""
    return [
        r["id"]
        for r in _EXERCISES.values()
        if r["source"] == "curated" and r["difficulty"] == tier
    ]


def get_file(exercise_id: str) -> ExerciseFile:
    r = _EXERCISES.get(exercise_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return ExerciseFile(
        id=r["id"],
        language=r["language"],
        filename=r["filename"],
        code=r["code"],
        line_count=_line_count(r["code"]),
        hint_count=len(r.get("hints", [])),
        difficulty=r["difficulty"],
        source=r["source"],
    )


def get_hint(exercise_id: str, index: int) -> HintResponse:
    """index is 1-based. 404 for an unknown exercise or an out-of-range hint."""
    r = _EXERCISES.get(exercise_id)
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
    r = _EXERCISES.get(exercise_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return r


def exists(exercise_id: str) -> bool:
    return exercise_id in _EXERCISES
