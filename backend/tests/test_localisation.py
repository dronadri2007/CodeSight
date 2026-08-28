"""Smoke tests for the deterministic localisation scorer. No API key needed:
    cd backend && python -m pytest -q
"""
from app.localisation import score_localisation


def test_exact_hit():
    r = score_localisation([12, 13], [12, 13])
    assert r["verdict"] == "hit"
    assert r["score"] == 1.0


def test_near_within_tolerance():
    r = score_localisation([11], [12, 13])
    assert r["verdict"] in {"hit", "near"}
    assert r["score"] > 0.0


def test_total_miss():
    r = score_localisation([40], [12])
    assert r["verdict"] in {"miss", "false_positive"}
    assert r["score"] == 0.0


def test_no_selection_on_buggy_file():
    r = score_localisation([], [7])
    assert r["verdict"] == "miss"
    assert r["score"] == 0.0


def test_clean_file_no_selection_is_correct():
    r = score_localisation([], [])
    assert r["verdict"] == "hit"
    assert r["score"] == 1.0


def test_clean_file_flagged_is_false_positive():
    r = score_localisation([5], [])
    assert r["verdict"] == "false_positive"
    assert r["score"] == 0.0


def test_stray_line_lowers_score():
    clean = score_localisation([12], [12])
    with_stray = score_localisation([12, 40], [12])
    assert with_stray["score"] < clean["score"]
