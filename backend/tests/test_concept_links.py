"""Network check: every YouTube link in concepts.json still resolves.

Skipped by default so the normal suite stays offline and fast. Run it with:

    RUN_NETWORK_TESTS=1 python -m pytest tests/test_concept_links.py -q

Same logic as scripts/check_concept_links.py, one parametrised case per video.
"""
import json
import os
import pathlib
import urllib.error
import urllib.parse
import urllib.request

import pytest

pytestmark = pytest.mark.skipif(
    os.getenv("RUN_NETWORK_TESTS") != "1",
    reason="network test - set RUN_NETWORK_TESTS=1 to run",
)

CONCEPTS = pathlib.Path(__file__).resolve().parents[1] / "app" / "data" / "concepts.json"
_VIDEOS = [
    pytest.param(v["url"], v["title"], id=f"{c['id']}-{v['url'].rsplit('=', 1)[-1]}")
    for c in json.loads(CONCEPTS.read_text(encoding="utf-8"))
    for v in c["videos"]
]


def _oembed_status(video_url: str) -> int:
    qs = urllib.parse.urlencode({"url": video_url, "format": "json"})
    req = urllib.request.Request(
        f"https://www.youtube.com/oembed?{qs}",
        headers={"User-Agent": "codesight-linkcheck"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code


@pytest.mark.parametrize(("url", "title"), _VIDEOS)
def test_concept_video_resolves(url, title):
    status = _oembed_status(url)
    # 200 = public + embeddable, 401 = exists but embedding off (link still valid).
    assert status in (200, 401), f"{title!r} ({url}) returned HTTP {status}"
