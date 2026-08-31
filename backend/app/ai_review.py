"""AI Reviewer vs You.

Runs the model as an independent reviewer of the same file the student saw
(blind to the student's answer), then compares AI findings, the student's
marked lines, and the ground-truth fix lines.
"""
import json

import structlog
from google.genai import types

from app.config import GRADER_MODEL
from app.gemini import client as _client
from app.gemini import generate
from app.schemas import AiReviewOutput

log = structlog.get_logger("codesight.ai_review")

TOLERANCE = 2

REVIEWER_SYSTEM = """You are a senior code reviewer. Review the file you are given
and list every defect you find.

For each defect: the 1-based line number(s), a one-sentence description of the
issue, and a severity of "high", "medium", or "low".

If the file has no defects, return an empty findings list. Do not rewrite or
fix the code - only report what is wrong.
"""

# AI review depends only on the file, so cache by exercise id.
_cache: dict[str, list[dict]] = {}


def _near_any(line: int, targets: list[int]) -> bool:
    return any(abs(line - t) <= TOLERANCE for t in targets)


def ai_findings(exercise_id: str, code: str) -> tuple[list[dict], bool, str | None]:
    """Returns (findings, ai_available, error). findings: [{lines, issue, severity}]."""
    if exercise_id in _cache:
        return _cache[exercise_id], True, None
    if _client is None:
        return [], False, "no api key"

    try:
        resp = generate(
            model=GRADER_MODEL,
            contents=f"Review this file:\n\n{code}",
            config=types.GenerateContentConfig(
                system_instruction=REVIEWER_SYSTEM,
                temperature=0.0,
                response_mime_type="application/json",
                response_schema=AiReviewOutput,
                max_output_tokens=1200,
            ),
        )
        parsed = getattr(resp, "parsed", None)
        data = parsed.model_dump() if parsed is not None else json.loads(resp.text)
        findings = [
            {
                "lines": [int(x) for x in f.get("lines", [])],
                "issue": str(f.get("issue", "")),
                "severity": f.get("severity", "medium"),
            }
            for f in data.get("findings", [])
        ]
    except Exception as e:  # noqa: BLE001 - surface the reason for now
        reason = f"{type(e).__name__}: {e}"
        log.warning("ai_review_failed", exercise_id=exercise_id, reason=reason)
        return [], False, reason

    _cache[exercise_id] = findings
    return findings, True, None


def compare(real_lines: list[int], student_lines: list[int], findings: list[dict]) -> dict:
    real = sorted({int(x) for x in real_lines})
    student = sorted({int(x) for x in student_lines})
    ai_lines = sorted({ln for f in findings for ln in f["lines"]})

    if not real:  # clean file
        student_fp = bool(student)
        ai_fp = bool(ai_lines)
        if not student_fp and not ai_fp:
            headline = "You and the AI agreed: the file is clean."
        elif student_fp and not ai_fp:
            headline = "The AI held its ground - you raised a false positive."
        elif ai_fp and not student_fp:
            headline = "You held your ground - the AI raised a false positive."
        else:
            headline = "Both of you flagged clean code."
        return {
            "real_lines": [],
            "you_found": student,
            "ai_lines": ai_lines,
            "ai_findings": findings,
            "both_found": [],
            "you_caught_ai_missed": [],
            "ai_caught_you_missed": [],
            "both_missed": [],
            "headline": headline,
        }

    student_hit = [r for r in real if _near_any(r, student)]
    ai_hit = [r for r in real if _near_any(r, ai_lines)]
    both = [r for r in student_hit if r in ai_hit]
    you_only = [r for r in student_hit if r not in ai_hit]
    ai_only = [r for r in ai_hit if r not in student_hit]
    missed = [r for r in real if r not in student_hit and r not in ai_hit]

    if you_only and not ai_only:
        headline = f"You caught {len(you_only)} defect line(s) the AI missed."
    elif ai_only and not you_only:
        headline = f"The AI caught {len(ai_only)} defect line(s) you missed."
    elif both and not you_only and not ai_only and not missed:
        headline = "You and the AI agreed on the defect."
    elif not student_hit and not ai_hit:
        headline = "Neither you nor the AI found the defect."
    else:
        headline = (
            f"You found {len(student_hit)}/{len(real)} defect lines, "
            f"the AI found {len(ai_hit)}/{len(real)}."
        )

    return {
        "real_lines": real,
        "you_found": student,
        "ai_lines": ai_lines,
        "ai_findings": findings,
        "both_found": both,
        "you_caught_ai_missed": you_only,
        "ai_caught_you_missed": ai_only,
        "both_missed": missed,
        "headline": headline,
    }
