"""Test fixtures. Each `client` test gets a fresh in-memory SQLite DB via a
dependency override, so no real database or API key is needed.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401  (register the Attempt table on Base)
from app import adminauth as _adminauth
from app import ai_review as _ai_review_mod
from app import db as _db_mod
from app import exercises as _ex_mod
from app import gemini as _gemini_mod
from app import grader as _grader_mod
from app.db import Base, get_db
from app.main import app  # NB: `app` here is the FastAPI instance, not the package

TEST_ADMIN_PW = "test-admin-pw"


@pytest.fixture(autouse=True)
def _disable_rate_limit():
    from app.ratelimit import limiter

    prev = limiter.enabled
    limiter.enabled = False
    yield
    limiter.enabled = prev


@pytest.fixture(autouse=True, scope="session")
def _no_real_gemini():
    """Force the grader/reviewer fallback path even if a real GEMINI_API_KEY is
    present in the environment — tests must never hit the live API."""
    _gemini_mod.client = None
    _grader_mod._client = None
    _ai_review_mod._client = None
    yield


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def _override():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    # Route DI, the admin overlay's own SessionLocal(), and admin auth all at
    # the fresh in-memory DB; reset the exercise-overlay cache around each test.
    app.dependency_overrides[get_db] = _override
    _prev_sessionlocal = _db_mod.SessionLocal
    _db_mod.SessionLocal = TestingSession
    _prev_pw = _adminauth.ADMIN_PASSWORD
    _adminauth.ADMIN_PASSWORD = TEST_ADMIN_PW
    _ex_mod.invalidate()

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    _db_mod.SessionLocal = _prev_sessionlocal
    _adminauth.ADMIN_PASSWORD = _prev_pw
    _ex_mod.invalidate()
    engine.dispose()


@pytest.fixture
def admin_headers(client):
    """Bearer header for a logged-in admin (ADMIN_PASSWORD patched to TEST_ADMIN_PW)."""
    r = client.post("/admin/login", json={"password": TEST_ADMIN_PW})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}
