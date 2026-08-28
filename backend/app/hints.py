"""Progressive-hint score decay.

    0 hints -> 100%
    1 hint  ->  90%
    2 hints ->  75%
    3+ hints -> 50%
"""

_MULTIPLIERS = [1.0, 0.9, 0.75, 0.5]


def score_multiplier(hints_used: int) -> float:
    if hints_used < 0:
        hints_used = 0
    if hints_used >= len(_MULTIPLIERS):
        return _MULTIPLIERS[-1]
    return _MULTIPLIERS[hints_used]
