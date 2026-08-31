"""Shared slowapi limiter. Keyed by client IP (best-effort behind a proxy —
enough to blunt brute force). Disabled in tests by a conftest fixture.

Real per-client limiting requires ``FORWARDED_ALLOW_IPS=*`` (or Railway's proxy
CIDR) set on the service so ``get_remote_address`` can key off ``X-Forwarded-For``;
without it all clients share one bucket and the ``1000/minute`` default is a
combined ceiling on all traffic. ``POST /admin/login``'s ``5/minute`` is
deliberately kept strict (brute-force blunting; admin login is rare).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["1000/minute"])
