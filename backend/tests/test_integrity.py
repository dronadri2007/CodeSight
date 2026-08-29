"""Unit tests for the integrity scorer. No API key or DB needed."""
from app.integrity import score_integrity
from app.schemas import GradeTelemetry

LONG = "The email value is concatenated directly into the SQL string. " * 3  # ~180 chars


def _tel(**kw) -> GradeTelemetry:
    return GradeTelemetry(**kw)


def test_no_signals_is_clean():
    r = score_integrity(LONG, _tel(time_to_submit_ms=90_000, keystroke_count=len(LONG)))
    assert r.score == 1.0
    assert r.verdict == "clean"
    assert r.flags == []


def test_dominant_paste_is_flagged():
    r = score_integrity(LONG, _tel(paste_count=1, pasted_chars=len(LONG), keystroke_count=2))
    assert r.verdict == "flagged"
    assert r.score < 0.4
    assert any("pasted" in f for f in r.flags)


def test_small_paste_is_a_soft_flag_only():
    r = score_integrity(LONG, _tel(paste_count=1, pasted_chars=12, keystroke_count=len(LONG)))
    assert r.verdict in {"clean", "review"}
    assert r.score < 1.0
    assert r.flags


def test_few_keystrokes_for_much_text():
    r = score_integrity(LONG, _tel(keystroke_count=10))
    assert r.score < 1.0
    assert any("keystrokes" in f for f in r.flags)


def test_implausibly_fast_submit():
    r = score_integrity(LONG, _tel(time_to_submit_ms=1_000, keystroke_count=len(LONG)))
    assert r.score < 1.0
    assert any("fast" in f for f in r.flags)


def test_long_off_tab_time():
    r = score_integrity(LONG, _tel(tab_blur_count=1, tab_blur_ms=20_000, keystroke_count=len(LONG)))
    assert any("focused" in f for f in r.flags)


def test_short_answer_skips_content_checks():
    r = score_integrity("sql injection on line 2", _tel(time_to_submit_ms=100, keystroke_count=1))
    assert r.verdict == "clean"
    assert r.flags == []


def test_score_never_negative():
    r = score_integrity(
        LONG,
        _tel(paste_count=3, pasted_chars=len(LONG), keystroke_count=1,
             time_to_submit_ms=200, tab_blur_count=9, tab_blur_ms=120_000),
    )
    assert r.score == 0.0
    assert r.verdict == "flagged"
