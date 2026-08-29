"""Stateless topic prediction: serve a larger Python file, grade a predicted
defect-class set by set-overlap precision / recall / F1. Reveals the answer +
per-class teaching notes. No DB write. Loaded from data/topic_exercises.json.

Same lifecycle as the concept micro-check: the GET serves the file without the
key, the POST grades and reveals everything, and nothing is persisted.
"""
import ast
import json
import re
from pathlib import Path

from fastapi import HTTPException

from app.concepts import _CONCEPTS  # reuse the curated practice pointers
from app.schemas import (
    TopicClassResult,
    TopicFile,
    TopicPredictResult,
    TopicSummary,
)

_DATA = Path(__file__).parent / "data" / "topic_exercises.json"

# Canonical order — used for every response list except ignored_classes.
CANDIDATES = ("injection", "auth", "error-handling", "concurrency", "logic", "resource")
PREDICT_PASS = 2 / 3  # mirrors concepts.MICRO_CHECK_PASS ("2 of 3")
EPS = 1e-9
_ID_RE = re.compile(r"^topic-\d{3}$")
_INSTRUCTIONS = (
    "Predict which of these defect classes appear in this file. "
    "Select all that apply. At least one is present; "
    "'clean' is not an option here."
)


def _top_level_defs(code: str) -> int:
    return code.count("\ndef ") + (1 if code.startswith("def ") else 0)


def _load() -> dict[str, dict]:
    """Fail fast at import if any record violates the loader rules."""
    with _DATA.open(encoding="utf-8") as f:
        records = json.load(f)

    out: dict[str, dict] = {}
    for r in records:
        rid = r["id"]
        assert _ID_RE.match(rid), f"bad topic id: {rid!r}"
        assert rid not in out, f"duplicate topic id: {rid!r}"

        code = r["code"]
        ast.parse(code)  # raises SyntaxError on malformed source

        n_lines = len(code.splitlines())
        assert 30 <= n_lines <= 80, f"{rid}: {n_lines} lines, want 30-80"
        assert _top_level_defs(code) >= 3, f"{rid}: fewer than 3 top-level defs"

        present = r["present_classes"]
        assert present, f"{rid}: present_classes is empty"
        assert len(present) == len(set(present)), f"{rid}: duplicate present_classes"
        assert set(present) <= set(CANDIDATES), f"{rid}: unknown class in present_classes"
        assert "clean" not in present, f"{rid}: 'clean' is not a selectable class"
        assert len(present) <= 3, f"{rid}: more than 3 present_classes"

        notes = r["notes"]
        assert set(notes) == set(CANDIDATES), f"{rid}: notes keys must be exactly the 6 classes"
        assert all(str(v).strip() for v in notes.values()), f"{rid}: every note must be non-empty"

        assert r["language"] == "python", f"{rid}: language must be python"

        out[rid] = r
    return out


_TOPICS = _load()


def list_topics() -> list[TopicSummary]:
    """Metadata only — no answer data, and nothing that leaks how many classes
    are present."""
    return [
        TopicSummary(
            id=r["id"],
            title=r["title"],
            language=r["language"],
            line_count=len(r["code"].splitlines()),
            function_count=_top_level_defs(r["code"]),
            difficulty=r["difficulty"],
        )
        for r in _TOPICS.values()
    ]


def _require(topic_id: str) -> dict:
    r = _TOPICS.get(topic_id)
    if r is None:
        raise HTTPException(status_code=404, detail="unknown topic")
    return r


def get_topic(topic_id: str) -> TopicFile:
    """The file to analyse, with the fixed candidate list. Strips
    present_classes + notes."""
    r = _require(topic_id)
    return TopicFile(
        id=r["id"],
        title=r["title"],
        language=r["language"],
        filename=r["filename"],
        code=r["code"],
        line_count=len(r["code"].splitlines()),
        function_count=_top_level_defs(r["code"]),
        candidate_classes=list(CANDIDATES),
        instructions=_INSTRUCTIONS,
        difficulty=r["difficulty"],
    )


def predict(topic_id: str, predicted_classes: list[str]) -> TopicPredictResult:
    """Grade a predicted set by set-overlap P/R/F1 and reveal the answer plus a
    teaching note for every one of the 6 classes. Stateless — nothing written."""
    r = _require(topic_id)

    raw = predicted_classes or []
    stripped = [c.strip() for c in raw]
    valid = {c for c in stripped if c in CANDIDATES}
    ignored = [c for c in stripped if c not in CANDIDATES]  # input order, dups kept

    P = [c for c in CANDIDATES if c in valid]                       # valid, deduped
    A = [c for c in CANDIDATES if c in set(r["present_classes"])]   # 1 <= len(A) <= 3
    p_set, a_set = set(P), set(A)

    tp = [c for c in A if c in p_set]
    fp = [c for c in P if c not in a_set]
    fn = [c for c in A if c not in p_set]

    precision = len(tp) / len(P) if P else 0.0     # empty prediction -> 0.0
    recall = len(tp) / len(A)                       # len(A) >= 1 -> safe
    denom = precision + recall
    f1 = (2 * precision * recall / denom) if denom > 0 else 0.0

    exact_match = p_set == a_set
    predicted_all = len(P) == len(CANDIDATES)       # anti-gaming carve-out

    # All threshold decisions use the UNROUNDED f1.
    passed = (f1 + EPS >= PREDICT_PASS) and not predicted_all
    near_miss = (0.5 <= f1 < 1.0) and (len(fp) + len(fn) == 1)

    if p_set == a_set:
        verdict = "perfect"
    elif P and not fn and fp:
        verdict = "over_predicted"
    elif P and not fp and fn:
        verdict = "under_predicted"
    elif f1 >= 0.5:
        verdict = "partial"
    else:
        verdict = "miss"

    join = ", ".join
    if verdict == "perfect":
        summary = f"All {len(A)} class(es) correct."
    elif verdict == "over_predicted":
        summary = f"Found all {len(A)}, but over-flagged {join(fp)}."
    elif verdict == "under_predicted":
        summary = f"Every pick correct, but missed {join(fn)}."
    elif verdict == "partial":
        summary = f"{len(tp)} of {len(P)} correct."
        if fn:
            summary += f" Missed {join(fn)}."
        if fp:
            summary += f" Over-flagged {join(fp)}."
    elif P:
        summary = f"Mostly off. Classes present: {join(A)}."
    else:
        summary = f"Nothing predicted. This file has {len(A)} defect class(es)."

    notes = r["notes"]
    classes: list[TopicClassResult] = []
    for c in CANDIDATES:
        present = c in a_set
        predicted = c in p_set
        if present and predicted:
            outcome = "true_positive"
        elif predicted:
            outcome = "false_positive"
        elif present:
            outcome = "false_negative"
        else:
            outcome = "true_negative"
        classes.append(
            TopicClassResult(
                defect_class=c,
                present=present,
                predicted=predicted,
                outcome=outcome,
                note=notes[c],
            )
        )

    # Practice pointers for every missed class, curated from concepts.json so
    # there is one source of truth. Iterate missed classes in canonical order.
    practice_ids: list[str] = []
    for c in fn:
        for ex_id in _CONCEPTS.get(c, {}).get("practice_exercise_ids", []):
            if ex_id not in practice_ids:
                practice_ids.append(ex_id)

    return TopicPredictResult(
        id=r["id"],
        predicted_classes=P,
        ignored_classes=ignored,
        present_classes=A,
        true_positives=tp,
        false_positives=fp,
        false_negatives=fn,
        precision=round(precision, 2),
        recall=round(recall, 2),
        f1=round(f1, 2),
        exact_match=exact_match,
        verdict=verdict,
        passed=passed,
        near_miss=near_miss,
        summary=summary,
        classes=classes,
        practice_exercise_ids=practice_ids,
    )


# Alias for the task-list name; identical behaviour.
grade_topics = predict
