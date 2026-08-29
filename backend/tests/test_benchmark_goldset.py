"""Offline checks on benchmark/gold_set.json - shape, and that every
expect_localisation matches the deterministic scorer. No Gemini call.
scripts/run_benchmark.py does the live grader comparison.
"""
import json
import pathlib

import pytest

from app import exercises as ex
from app.localisation import score_localisation

GOLD = pathlib.Path(__file__).resolve().parents[1] / "benchmark" / "gold_set.json"
_CASES = json.loads(GOLD.read_text(encoding="utf-8"))["cases"]

VERDICTS = {"strong", "partial", "weak"}
BANDS = {  # documented in gold_set.json; each case's band must sit inside its quality band
    "strong": (0.55, 1.0),
    "partial": (0.30, 0.75),
    "weak": (0.0, 0.40),
}


def test_gold_set_is_non_trivial():
    assert len(_CASES) >= 20
    ids = [c["id"] for c in _CASES]
    assert len(ids) == len(set(ids)), "duplicate case ids"


@pytest.mark.parametrize("case", _CASES, ids=[c["id"] for c in _CASES])
def test_case_is_well_formed(case):
    assert ex.exists(case["exercise_id"])
    assert isinstance(case["selected_lines"], list)
    assert case["quality"] in VERDICTS
    assert case["expect_verdict"] in VERDICTS
    lo, hi = case["score_min"], case["score_max"]
    assert 0.0 <= lo < hi <= 1.0
    qlo, qhi = BANDS[case["quality"]]
    assert qlo <= lo and hi <= qhi, f"{case['id']} band {[lo, hi]} outside {case['quality']} band {[qlo, qhi]}"
    assert case["explanation"].strip()


@pytest.mark.parametrize("case", _CASES, ids=[c["id"] for c in _CASES])
def test_expected_localisation_matches_scorer(case):
    answer = ex.get_answer(case["exercise_id"])
    got = score_localisation(case["selected_lines"], answer["real_lines"])["verdict"]
    assert got == case["expect_localisation"], (
        f"{case['id']}: gold says {case['expect_localisation']}, scorer says {got}"
    )


def test_quality_matches_expected_verdict():
    # the label we assign a case should be the verdict we expect the grader to return
    for c in _CASES:
        assert c["quality"] == c["expect_verdict"], c["id"]
