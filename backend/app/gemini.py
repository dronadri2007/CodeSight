"""Shared Gemini client + a small retry wrapper.

Gemini returns transient 503 ("high demand") and 429 (rate limit) under load.
`generate` retries those a few times with backoff; every other error is raised
to the caller, which degrades to its own fallback.
"""
import time

import structlog
from google import genai
from google.genai import errors as genai_errors

from app.config import GEMINI_API_KEY

log = structlog.get_logger("codesight.gemini")

client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


def _is_retryable(e: Exception) -> bool:
    if isinstance(e, genai_errors.ServerError):  # 5xx
        return True
    if isinstance(e, genai_errors.ClientError):  # 4xx
        s = str(e)
        return "429" in s or "RESOURCE_EXHAUSTED" in s
    return False


def generate(*, model: str, contents, config, attempts: int = 3):
    """Wraps client.models.generate_content with backoff on 503/429."""
    if client is None:
        raise RuntimeError("no GEMINI_API_KEY")
    last: Exception | None = None
    for i in range(attempts):
        try:
            return client.models.generate_content(
                model=model, contents=contents, config=config
            )
        except genai_errors.APIError as e:
            last = e
            if _is_retryable(e) and i < attempts - 1:
                wait = 1.5 * (2**i)
                log.warning(
                    "gemini_transient_error",
                    attempt=i + 1,
                    attempts=attempts,
                    wait_s=wait,
                    error=str(e),
                )
                time.sleep(wait)
                continue
            raise
    raise last  # pragma: no cover
