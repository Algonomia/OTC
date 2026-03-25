import logging, sys
__all__ = ["setup_logger"]
def setup_logger(name: str = "otc_poc", level: int = logging.INFO) -> logging.Logger:
    log = logging.getLogger(name)
    if log.handlers: return log
    log.setLevel(level)
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s"))
    log.addHandler(h)
    return log
