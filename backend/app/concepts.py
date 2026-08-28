"""Recommendation engine: concept explanations + curated videos + practice
pointers, one per defect class. Loaded from data/concepts.json."""
import json
from pathlib import Path

from fastapi import HTTPException

from app.schemas import Concept, ConceptSummary

_DATA = Path(__file__).parent / "data" / "concepts.json"


def _load() -> dict[str, dict]:
    with _DATA.open(encoding="utf-8") as f:
        return {c["id"]: c for c in json.load(f)}


_CONCEPTS = _load()


def list_concepts() -> list[ConceptSummary]:
    return [ConceptSummary(id=c["id"], title=c["title"]) for c in _CONCEPTS.values()]


def get_concept(concept_id: str) -> Concept:
    c = _CONCEPTS.get(concept_id)
    if c is None:
        raise HTTPException(status_code=404, detail="unknown concept")
    return Concept(
        id=c["id"],
        title=c["title"],
        summary=c["summary"],
        example_bad=c["example_bad"],
        example_good=c["example_good"],
        videos=[{"title": v["title"], "url": v["url"]} for v in c.get("videos", [])],
        practice_exercise_ids=c.get("practice_exercise_ids", []),
    )
