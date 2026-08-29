"""Minimal admin auth: one shared password (ADMIN_PASSWORD env var) issues a
short-lived HMAC-signed bearer token. No user table, no JWT lib.

If ADMIN_PASSWORD is unset the whole /admin/* surface returns 503.
"""
import hashlib
import hmac
import time

from fastapi import Header, HTTPException

from app.config import ADMIN_PASSWORD, ADMIN_TOKEN_TTL_HOURS


def admin_enabled() -> bool:
    return bool(ADMIN_PASSWORD)


def _sign(payload: str) -> str:
    return hmac.new(ADMIN_PASSWORD.encode(), payload.encode(), hashlib.sha256).hexdigest()


def mint_token() -> str:
    exp = int(time.time()) + ADMIN_TOKEN_TTL_HOURS * 3600
    payload = f"admin.{exp}"
    return f"{payload}.{_sign(payload)}"


def _token_ok(token: str) -> bool:
    try:
        head, exp_s, sig = token.rsplit(".", 2)
        payload = f"{head}.{exp_s}"
    except ValueError:
        return False
    if not hmac.compare_digest(sig, _sign(payload)):
        return False
    return int(exp_s) > time.time()


def check_password(password: str) -> bool:
    return bool(ADMIN_PASSWORD) and hmac.compare_digest(password, ADMIN_PASSWORD)


def require_admin(authorization: str | None = Header(default=None)) -> None:
    """FastAPI dependency — 503 if admin is disabled, 401 on a bad/expired token."""
    if not ADMIN_PASSWORD:
        raise HTTPException(status_code=503, detail="admin API disabled (ADMIN_PASSWORD unset)")
    token = (authorization or "").removeprefix("Bearer ").strip()
    if not token or not _token_ok(token):
        raise HTTPException(status_code=401, detail="invalid or expired admin token")
