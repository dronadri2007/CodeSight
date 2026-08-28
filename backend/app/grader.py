"""Claude grading call. Day 2: wire grade_review() into POST /grade.

The ANTHROPIC_API_KEY stays server-side only. Never return it, log it, or
send it to the client.
"""
import hashlib
import os

from anthropic import Anthropic

client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-5"

RUBRIC = """You are grading a student's code review, not writing one.

You are given the broken code, the fix diff (ground truth for the one known
defect), a reference explanation, and the student's selected line numbers and
written finding.

Return JSON only, in this shape:
{
  "localisation": {"score": 0.0-1.0, "verdict": "hit|near|miss|false_positive", "real_lines": [int], "note": str},
  "explanation":  {"score": 0.0-1.0, "verdict": "strong|partial|weak", "note": str},
  "teaching": {"where": str, "why_missed": str, "pattern": str}
}

Rules:
- localisation.score is the overlap of selected_lines with the lines the fix changed.
- A different but genuine defect the student found: partial explanation credit,
  note it as "plausible, unverified".
- Flagging correct code is a false positive: verdict "false_positive", score 0.
- teaching.why_missed says what the student likely looked at instead.
- teaching.pattern is the reusable lesson, one sentence.
"""

# simple in-process cache so the same answer always scores the same
_cache: dict[str, dict] = {}


def _key(exercise_id: str, selected_lines: list[int], explanation: str) -> str:
    raw = f"{exercise_id}|{sorted(selected_lines)}|{explanation.strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def grade_review(
    exercise_id: str,
    code: str,
    fix_diff: str,
    reference: str,
    selected_lines: list[int],
    explanation: str,
) -> dict:
    """TODO Day 2:
    - build the user message from code / fix_diff / reference / student input
    - client.messages.create(model=MODEL, temperature=0, max_tokens=800, ...)
    - parse the JSON out of the response
    - store in _cache[_key(...)] and return it
    """
    ck = _key(exercise_id, selected_lines, explanation)
    if ck in _cache:
        return _cache[ck]
    raise NotImplementedError("wire up the Claude call")
