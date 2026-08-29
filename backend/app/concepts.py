"""Recommendation engine: concept explanations + curated videos + practice
pointers + a short micro-check quiz, one per defect class. Loaded from
data/concepts.json."""
import json
from pathlib import Path

from fastapi import HTTPException

from app.schemas import (
    Concept,
    ConceptSummary,
    MicroCheck,
    MicroCheckQuestion,
    MicroCheckQuestionResult,
    MicroCheckResult,
)

_DATA = Path(__file__).parent / "data" / "concepts.json"

MICRO_CHECK_PASS = 2 / 3  # 2 of 3 correct


def _load() -> dict[str, dict]:
    with _DATA.open(encoding="utf-8") as f:
        return {c["id"]: c for c in json.load(f)}


_CONCEPTS = _load()


def list_concepts() -> list[ConceptSummary]:
    return [ConceptSummary(id=c["id"], title=c["title"]) for c in _CONCEPTS.values()]


def _require(concept_id: str) -> dict:
    c = _CONCEPTS.get(concept_id)
    if c is None:
        raise HTTPException(status_code=404, detail="unknown concept")
    return c


def get_concept(concept_id: str) -> Concept:
    c = _require(concept_id)
    return Concept(
        id=c["id"],
        title=c["title"],
        summary=c["summary"],
        example_bad=c["example_bad"],
        example_good=c["example_good"],
        videos=[{"title": v["title"], "url": v["url"]} for v in c.get("videos", [])],
        practice_exercise_ids=c.get("practice_exercise_ids", []),
        micro_check_count=len(c.get("micro_check", [])),
    )


def get_micro_check(concept_id: str) -> MicroCheck:
    """The quiz without its answer key."""
    c = _require(concept_id)
    return MicroCheck(
        concept_id=c["id"],
        questions=[
            MicroCheckQuestion(id=q["id"], prompt=q["prompt"], options=q["options"])
            for q in c.get("micro_check", [])
        ],
    )


def grade_micro_check(concept_id: str, answers: list) -> MicroCheckResult:
    """Grade submitted answers. Unknown question ids are ignored; missing or
    out-of-range answers count as wrong. Every question comes back with its
    correct index and explanation so the result is a teaching moment."""
    c = _require(concept_id)
    questions = c.get("micro_check", [])
    picked = {a.question_id: a.choice_index for a in answers}

    results: list[MicroCheckQuestionResult] = []
    correct = 0
    for q in questions:
        n_opts = len(q["options"])
        your = picked.get(q["id"])
        valid = your if isinstance(your, int) and 0 <= your < n_opts else None
        is_correct = valid == q["answer_index"]
        correct += is_correct
        results.append(
            MicroCheckQuestionResult(
                question_id=q["id"],
                correct=is_correct,
                your_index=valid,
                correct_index=q["answer_index"],
                explanation=q["explanation"],
            )
        )

    total = len(questions)
    score = correct / total if total else 0.0
    return MicroCheckResult(
        concept_id=c["id"],
        total=total,
        correct=correct,
        score=round(score, 2),
        passed=score >= MICRO_CHECK_PASS,
        results=results,
        practice_exercise_ids=c.get("practice_exercise_ids", []),
    )
