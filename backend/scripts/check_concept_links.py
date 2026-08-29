"""Verify every YouTube link in app/data/concepts.json still resolves.

    cd backend
    python scripts/check_concept_links.py

Uses YouTube's public oEmbed endpoint - no API key, no quota. For each video:

    HTTP 200  OK     - public and embeddable; prints the real title
    HTTP 401  WARN   - video exists but embedding is disabled (link still works)
    HTTP 404  DEAD   - removed, private, or never existed  -> exit code 1

Also flags when the stored title looks nothing like the real one, so a
mislabelled entry gets caught even though the link is fine.

Run it before a demo, or wire it into CI on a weekly schedule. The companion
tests/test_concept_links.py does the same check but is skipped unless
RUN_NETWORK_TESTS=1.
"""
import json
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

CONCEPTS = pathlib.Path(__file__).resolve().parents[1] / "app" / "data" / "concepts.json"
OEMBED = "https://www.youtube.com/oembed"
TIMEOUT = 10


def _oembed(video_url: str) -> tuple[int, dict]:
    """(status_code, payload). payload is {} for anything but a 200."""
    qs = urllib.parse.urlencode({"url": video_url, "format": "json"})
    req = urllib.request.Request(f"{OEMBED}?{qs}", headers={"User-Agent": "codesight-linkcheck"})
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            return resp.status, json.load(resp)
    except urllib.error.HTTPError as e:
        return e.code, {}
    except urllib.error.URLError as e:
        print(f"  network error: {e}", file=sys.stderr)
        return 0, {}


def _looks_mislabelled(stored: str, actual: str) -> bool:
    """True when the stored title shares almost no words with the real one."""
    def toks(s: str) -> set[str]:
        return {w for w in "".join(c.lower() if c.isalnum() else " " for c in s).split() if len(w) > 3}

    a, b = toks(stored), toks(actual)
    if not a or not b:
        return False
    return len(a & b) / len(a | b) < 0.15


def main() -> int:
    concepts = json.loads(CONCEPTS.read_text(encoding="utf-8"))
    dead, warn, mislabelled = [], [], []
    total = 0

    for concept in concepts:
        for video in concept["videos"]:
            total += 1
            cid, stored, url = concept["id"], video["title"], video["url"]
            code, data = _oembed(url)

            if code == 200:
                actual = data.get("title", "")
                tag = "OK  "
                if _looks_mislabelled(stored, actual):
                    tag = "LABEL"
                    mislabelled.append((cid, stored, actual))
                print(f"  {tag:5} {cid:14} {url}")
                if tag == "LABEL":
                    print(f"        stored : {stored}")
                    print(f"        actual : {actual}")
            elif code == 401:
                warn.append((cid, url))
                print(f"  WARN  {cid:14} {url}  (embedding disabled)")
            else:
                dead.append((cid, stored, url, code))
                print(f"  DEAD  {cid:14} {url}  (HTTP {code})")

    print(f"\n{total} links: {len(dead)} dead, {len(warn)} not embeddable, {len(mislabelled)} mislabelled")
    if mislabelled:
        print("\nMislabelled (link fine, title wrong):")
        for cid, stored, actual in mislabelled:
            print(f"  [{cid}] {stored!r} -> {actual!r}")
    if dead:
        print("\nDead links - fix concepts.json:")
        for cid, stored, url, code in dead:
            print(f"  [{cid}] {stored!r}  {url}  (HTTP {code})")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
