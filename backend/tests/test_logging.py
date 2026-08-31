import logging
import structlog
from app.logging import configure_logging


def test_configure_logging_is_idempotent_and_binds_stdlib():
    configure_logging()
    configure_logging()  # second call must not raise or double-add handlers
    root = logging.getLogger()
    assert len(root.handlers) == 1

    log = structlog.get_logger("codesight.test")
    # a structlog call with kwargs must not raise
    log.info("smoke", answer=42)


def test_stdlib_logging_flows_through_structlog(capsys):
    configure_logging()
    logging.getLogger("some.legacy.module").warning("legacy line")
    out = capsys.readouterr().out
    assert "legacy line" in out
