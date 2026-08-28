"""Load the curated exercise set from data/exercises.json and serve it.

Each record carries answer data (real_lines, fix_diff, reference) that must
never be sent to the client — only the grader uses it.
"""
import json
from pathlib import Path

from fastapi import HTTPException

from app.hints import score_multiplier
from app.schemas import ExerciseFile, ExerciseSummary, HintResponse

_DATA = Path(__file__).parent / "data" / "exercises.json"


def _load() -> dict[str, dict]:
    with _DATA.open(encoding="utf-8") as f:
        records = json.load(f)
    return {r["id"]: r for r in records}


_EXERCISES = _load()


def _line_count(code: str) -> int:
    return code.count("\n") if code.endswith("\n") else code.count("\n") + 1


def list_summaries() -> list[ExerciseSummary]:
    return [
        ExerciseSummary(
            id=r["id"],
            language=r["language"],
            title=r["title"],
            defect_class=r["defect_class"],
            line_count=_line_count(r["code"]),
        )
        for r in _EXERCISES.values()
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
    """Answer data for the grader only. Raises 404 if unknown."""
    r = _EXERCISES.get(exercise_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown exercise")
    return r
