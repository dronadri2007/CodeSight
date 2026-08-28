"""Deterministic localisation scoring — pure Python, no API call.

Compares the student's selected line numbers against the lines the real fix
changed. A line within TOLERANCE of a real line counts as found.
"""

TOLERANCE = 2


def _near_any(line: int, targets: list[int]) -> bool:
    return any(abs(line - t) <= TOLERANCE for t in targets)


def score_localisation(selected: list[int], real_lines: list[int]) -> dict:
    sel = sorted({int(x) for x in selected})
    real = sorted({int(x) for x in real_lines})

    # Clean exercise: the correct move is to flag nothing.
    if not real:
        if not sel:
            return {
                "score": 1.0,
                "verdict": "hit",
                "real_lines": [],
                "note": "Correct — this file has no defect and you flagged nothing.",
            }
        return {
            "score": 0.0,
            "verdict": "false_positive",
            "real_lines": [],
            "note": f"This file is clean. Line(s) {sel} are valid code — a false positive.",
        }

    if not sel:
        return {
            "score": 0.0,
            "verdict": "miss",
            "real_lines": real,
            "note": f"No lines selected. The defect is at line(s) {real}.",
        }

    found = [r for r in real if _near_any(r, sel)]
    stray = [s for s in sel if not _near_any(s, real)]
    recall = len(found) / len(real)
    stray_ratio = len(stray) / len(sel)
    score = max(0.0, min(1.0, recall - 0.5 * stray_ratio))

    if recall == 0:
        verdict = "false_positive" if stray else "miss"
        note = f"None of your lines are near the defect at {real}."
    elif not stray and recall == 1.0:
        verdict = "hit"
        note = "You marked the lines the fix changed."
    elif score >= 0.5:
        verdict = "near"
        note = f"Partly there. Real defect line(s): {real}."
        if stray:
            note += f" Lines {stray} were not part of it."
    else:
        verdict = "miss"
        note = f"Mostly off. Real defect line(s): {real}."

    return {
        "score": round(score, 2),
        "verdict": verdict,
        "real_lines": real,
        "note": note,
    }
