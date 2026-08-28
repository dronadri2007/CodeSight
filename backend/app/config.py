"""Runtime settings, read once from the environment."""
import os

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
GRADER_MODEL: str = os.getenv("GRADER_MODEL", "gemini-3.6-flash")

ALLOWED_ORIGINS: list[str] = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if o.strip()
]

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
