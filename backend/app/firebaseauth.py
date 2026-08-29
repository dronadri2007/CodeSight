"""Firebase Admin SDK: verify client ID tokens and write user profiles.

FIREBASE_SERVICE_ACCOUNT_JSON (the whole service-account file, as one string)
enables this. When unset, ``firebase_enabled()`` is False and every helper here
is a no-op — /grade and /promotion-test fall back to anonymous-session behaviour
with no Firestore writes.

The Admin SDK bypasses Firestore security rules, so this is the only place that
may raise a user's XP, rank or catch-rate.
"""
from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import Header

from app.config import FIREBASE_SERVICE_ACCOUNT_JSON

log = logging.getLogger("codesight.firebase")

_app = None
_db = None
_init_tried = False


def _init() -> None:
    global _app, _db, _init_tried
    if _init_tried:
        return
    _init_tried = True
    if not FIREBASE_SERVICE_ACCOUNT_JSON:
        return
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        cred = credentials.Certificate(json.loads(FIREBASE_SERVICE_ACCOUNT_JSON))
        _app = firebase_admin.initialize_app(cred)
        _db = firestore.client()
        log.info("Firebase Admin SDK initialised.")
    except Exception:  # bad JSON, missing package, network — degrade gracefully
        log.exception("Firebase Admin init failed; auth disabled.")
        _app = None
        _db = None


def firebase_enabled() -> bool:
    _init()
    return _db is not None


def verify_id_token(token: str) -> dict | None:
    """Decode+verify a client ID token. Returns the claims, or None if invalid."""
    _init()
    if _app is None:
        return None
    try:
        from firebase_admin import auth as fb_auth

        return fb_auth.verify_id_token(token)
    except Exception:
        return None


def maybe_user(authorization: str | None = Header(default=None)) -> dict | None:
    """FastAPI dependency. Returns {uid, email, ...} for a valid Bearer token,
    or None. Never raises — existing anonymous endpoints keep working."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    return verify_id_token(authorization[7:].strip())


# --------------------------------------------------------------------------- #
#  Firestore profile writes (Admin SDK — bypasses rules)                      #
# --------------------------------------------------------------------------- #

_MAX_SUBMISSIONS = 20


def _user_ref(uid: str):
    _init()
    return _db.collection("users").document(uid) if _db is not None else None


def record_graded_submission(
    uid: str,
    *,
    defect_class: str,
    localisation_score: float,
    total_score: int,
    passed: bool,
    submission: dict[str, Any],
) -> None:
    """Server-authoritative profile update after a graded attempt.

    Mirrors what the client used to do locally (recordSubmission +
    updateWeaknessCatchRate), but only the backend may do it now.
    """
    ref = _user_ref(uid)
    if ref is None:
        return
    try:
        from firebase_admin import firestore

        snap = ref.get()
        data = snap.to_dict() if snap.exists else {}

        subs = list(data.get("recentSubmissions") or [])
        subs.insert(0, submission)
        subs = subs[:_MAX_SUBMISSIONS]

        rates = dict(data.get("weaknessCatchRates") or {})
        if defect_class:
            cur = float(rates.get(defect_class, 50))
            rates[defect_class] = max(0.0, min(100.0, cur + (5 if localisation_score >= 0.7 else -4)))

        xp_gain = int(total_score) * 5
        elo_delta = round(int(total_score) / 10) if passed else -5

        ref.set(
            {
                "recentSubmissions": subs,
                "weaknessCatchRates": rates,
                "problemsSolved": firestore.Increment(1 if passed else 0),
                "totalXP": firestore.Increment(xp_gain),
                "eloRating": firestore.Increment(elo_delta),
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )
    except Exception:
        log.exception("record_graded_submission failed for uid=%s", uid)


def record_promotion(uid: str, *, new_level: str, new_level_index: int) -> None:
    ref = _user_ref(uid)
    if ref is None:
        return
    try:
        from firebase_admin import firestore

        ref.set(
            {
                "level": new_level,
                "levelIndex": new_level_index,
                "hasPassedPromotionalTest": True,
                "updatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )
    except Exception:
        log.exception("record_promotion failed for uid=%s", uid)
