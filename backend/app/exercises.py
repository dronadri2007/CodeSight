"""Load the exercise set and serve it.

Two pools, merged: data/exercises.json (curated, human-reviewed) and, if
present, data/exercises.generated.json (LLM-generated, source="generated").
Answer data (real_lines, fix_diff, reference) is never sent to the client.
"""
import json
from pathlib import Path

from fastapi import HTTPException

from app.hints import score_multiplier
from app.schemas import ExerciseFile, ExerciseSummary, HintResponse

_DIR = Path(__file__).parent / "data"
_CURATED = _DIR / "exercises.json"
_GENERATED = _DIR / "exercises.generated.json"

TIER_ORDER = ["beginner", "intermediate", "pro"]


def next_tier(tier: str) -> str | None:
    i = TIER_ORDER.index(tier)
    return TIER_ORDER[i + 1] if i + 1 < len(TIER_ORDER) else None


def _load() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for path, src in ((_CURATED, "curated"), (_GENERATED, "generated")):
        if not path.exists():
            continue
        for r in json.loads(path.read_text(encoding="utf-8")):
            r.setdefault("difficulty", "beginner")
            r.setdefault("source", src)
            out[r["id"]] = r
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
) -> list[ExerciseSummary]:
    """`tier` is cumulative — tier="intermediate" returns beginner + intermediate.
    `source` filters to exactly that pool. `hidden_ids` are excluded (reported)."""
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
        and (allowed is None or r["difficulty"] in allowed)
        and (source is None or r["source"] == source)
    ]


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
