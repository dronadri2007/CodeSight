"""structlog configuration.

JSON lines in production (Railway / Postgres), coloured console in dev
(SQLite). Standard-library logging (uvicorn, sqlalchemy) is routed through
the same formatter so there is one stream.
"""
import logging
import sys

import structlog

from app.config import DB_IS_SQLITE

_CONFIGURED = False


def configure_logging() -> None:
    global _CONFIGURED

    timestamper = structlog.processors.TimeStamper(fmt="iso", utc=True)
    pre_chain = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        timestamper,
        structlog.stdlib.ExtraAdder(),
    ]
    renderer = (
        structlog.dev.ConsoleRenderer(colors=False)
        if DB_IS_SQLITE
        else structlog.processors.JSONRenderer()
    )
    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=pre_chain,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
    )
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    root = logging.getLogger()
    # Assigning the list (rather than addHandler) keeps this idempotent even if
    # something else has attached handlers to the root logger since last call.
    root.handlers = [handler]
    root.setLevel(logging.INFO)

    if _CONFIGURED:
        return

    structlog.configure(
        processors=[
            *pre_chain,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    _CONFIGURED = True
