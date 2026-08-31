import re

from app.config import ALLOWED_ORIGIN_REGEX


def test_cors_regex_is_anchored_and_matches_expected_origins():
    assert ALLOWED_ORIGIN_REGEX.startswith("^") and ALLOWED_ORIGIN_REGEX.endswith("$")
    pat = re.compile(ALLOWED_ORIGIN_REGEX)
    assert pat.fullmatch("https://codesight-code-review.vercel.app")
    assert pat.fullmatch("http://localhost:5173")
    assert not pat.fullmatch("https://evil.example.com")
