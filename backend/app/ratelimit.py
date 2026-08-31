"""Shared slowapi limiter. Keyed by client IP (best-effort behind a proxy —
enough to blunt brute force). Disabled in tests by a conftest fixture."""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
