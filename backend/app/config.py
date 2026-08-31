"""Runtime settings, read once from the environment."""
import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
GRADER_MODEL: str = os.getenv("GRADER_MODEL", "gemini-3.6-flash")

# Admin API. Unset -> the whole /admin/* surface returns 503 (disabled).
ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "")
ADMIN_TOKEN_TTL_HOURS: int = int(os.getenv("ADMIN_TOKEN_TTL_HOURS", "12"))

# Firebase Admin SDK service-account JSON (the whole file, as one string).
# Unset -> Firebase auth is disabled: /grade and /promotion-test keep working
# on anonymous sessions only, with no Firestore profile writes.
FIREBASE_SERVICE_ACCOUNT_JSON: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")

ALLOWED_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")
    if o.strip()
]

# Any Vercel deploy (production + previews) plus localhost on any port, without
# needing the exact URL. Override with ALLOWED_ORIGIN_REGEX; set to "" to disable.
ALLOWED_ORIGIN_REGEX: str = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"^(https://[a-z0-9-]+\.vercel\.app|http://localhost:\d+)$",
)

# Postgres in prod; local SQLite file if DATABASE_URL is unset.
_raw_db_url = os.getenv("DATABASE_URL", "").strip()
if _raw_db_url:
    # Railway/Neon sometimes hand out "postgres://" — SQLAlchemy wants the driver.
    if _raw_db_url.startswith("postgres://"):
        _raw_db_url = _raw_db_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif _raw_db_url.startswith("postgresql://"):
        _raw_db_url = _raw_db_url.replace("postgresql://", "postgresql+psycopg://", 1)
    DATABASE_URL = _raw_db_url
    DB_IS_SQLITE = False
else:
    DATABASE_URL = "sqlite:///./codesight.db"
    DB_IS_SQLITE = True
