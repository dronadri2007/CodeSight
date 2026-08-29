"""Turn optional behavioural telemetry from a /grade submission into an
integrity score.

Framing is "practice, not exam": a low score is recorded on the attempt and
returned in the response so the learner (and later, a mentor view) can see
it, but it never blocks the submission or changes the grade.

Signals, roughly in order of how much they move the needle:
  1. A large paste into the explanation field (pasted text dominates the answer)
  2. Far fewer keystrokes than characters of text (text appeared without typing)
  3. Submitted implausibly fast for the amount written
  4. Long time spent off-tab during the attempt
"""
from app.schemas import GradeTelemetry, IntegritySignal

_MIN_EXPL_FOR_CHECKS = 60      # skip the checks on trivially short answers
_PASTE_DOMINATES = 0.5        # pasted_chars >= this * len(explanation)
_TYPED_RATIO_LOW = 0.4       # keystrokes / len(explanation) below this is suspect
_FAST_MS_PER_CHAR = 25      # < this many ms per typed char is implausibly fast
_BLUR_MS_CONCERN = 15_000  # > 15s unfocused during the attempt


def score_integrity(explanation: str, tel: GradeTelemetry) -> IntegritySignal:
    text = explanation.strip()
    n = len(text)
    flags: list[str] = []
    penalty = 0.0

    # 1. Paste into the explanation.
    if tel.paste_count > 0:
        if n >= _MIN_EXPL_FOR_CHECKS and tel.pasted_chars >= _PASTE_DOMINATES * n:
            flags.append(
                f"most of the explanation (~{tel.pasted_chars} chars) was pasted, not typed"
            )
            penalty += 0.7
        elif tel.pasted_chars >= 40:
            flags.append(f"{tel.pasted_chars} characters pasted into the explanation")
            penalty += 0.25
        else:
            flags.append("a paste event occurred in the explanation field")
            penalty += 0.1

    # 2. Text present without matching typing.
    if n >= _MIN_EXPL_FOR_CHECKS and tel.keystroke_count > 0:
        if tel.keystroke_count / n < _TYPED_RATIO_LOW and tel.pasted_chars < n:
            flags.append(
                f"only {tel.keystroke_count} keystrokes for {n} characters of text"
            )
            penalty += 0.3

    # 3. Implausibly fast for the amount written.
    if tel.time_to_submit_ms is not None and n >= _MIN_EXPL_FOR_CHECKS:
        if tel.time_to_submit_ms / n < _FAST_MS_PER_CHAR:
            flags.append(
                f"submitted very fast for {n} characters ({tel.time_to_submit_ms} ms total)"
            )
            penalty += 0.25

    # 4. Time spent off-tab during the attempt.
    if tel.tab_blur_ms >= _BLUR_MS_CONCERN:
        flags.append(f"tab was not focused for ~{round(tel.tab_blur_ms / 1000)}s during the attempt")
        penalty += 0.35
    elif tel.tab_blur_count >= 3:
        flags.append(f"switched away from the tab {tel.tab_blur_count} times")
        penalty += 0.1

    score = max(0.0, round(1.0 - penalty, 2))
    verdict = "clean" if score >= 0.8 else "review" if score >= 0.4 else "flagged"
    return IntegritySignal(score=score, verdict=verdict, flags=flags)
