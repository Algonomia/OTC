from __future__ import annotations

import logging
from typing import Any, Dict, Iterable, Optional

logger = logging.getLogger("otc.chunking.telemetry")


class ChunkingTelemetry:
    """Base telemetry hook; subclasses provide concrete integrations."""

    def log_metric(self, name: str, value: float, *, step: Optional[int] = None) -> None:
        return None

    def log_params(self, params: Dict[str, Any]) -> None:
        return None

    def set_tags(self, tags: Dict[str, Any]) -> None:
        return None


class NullChunkingTelemetry(ChunkingTelemetry):
    """No-op telemetry implementation."""

    pass


class LoggingChunkingTelemetry(ChunkingTelemetry):
    """Telemetry adapter that emits events to the standard logger."""

    def __init__(self, target_logger: Optional[logging.Logger] = None) -> None:
        self.logger = target_logger or logger

    def log_metric(self, name: str, value: float, *, step: Optional[int] = None) -> None:
        self.logger.debug("chunking.metric %s=%s step=%s", name, value, step)

    def log_params(self, params: Dict[str, Any]) -> None:
        self.logger.debug("chunking.params %s", params)

    def set_tags(self, tags: Dict[str, Any]) -> None:
        self.logger.debug("chunking.tags %s", tags)


class MlflowChunkingTelemetry(ChunkingTelemetry):
    """Telemetry adapter backed by MLflow."""

    def __init__(self, mlflow_module=None) -> None:
        self._delegate: Optional[ChunkingTelemetry] = None
        if mlflow_module is None:
            try:
                import mlflow as mlflow_module  # type: ignore
            except Exception as exc:  # pragma: no cover - fallback to logging
                logger.warning("Unable to import mlflow for telemetry: %s", exc)
                self._delegate = LoggingChunkingTelemetry()
                self._mlflow = None
                return
        self._mlflow = mlflow_module

    def log_metric(self, name: str, value: float, *, step: Optional[int] = None) -> None:
        if self._delegate is not None:
            self._delegate.log_metric(name, value, step=step)
            return
        try:
            if step is None:
                self._mlflow.log_metric(name, value)
            else:
                self._mlflow.log_metric(name, value, step=step)
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("mlflow.log_metric failed (%s): %s", name, exc)

    def log_params(self, params: Dict[str, Any]) -> None:
        if self._delegate is not None:
            self._delegate.log_params(params)
            return
        try:
            if params:
                self._mlflow.log_params(params)
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("mlflow.log_params failed: %s", exc)

    def set_tags(self, tags: Dict[str, Any]) -> None:
        if self._delegate is not None:
            self._delegate.set_tags(tags)
            return
        try:
            if tags:
                self._mlflow.set_tags(tags)
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("mlflow.set_tags failed: %s", exc)


class CompositeChunkingTelemetry(ChunkingTelemetry):
    """Fan out telemetry events to multiple delegates."""

    def __init__(self, delegates: Iterable[ChunkingTelemetry]) -> None:
        self.delegates = list(delegates)

    def log_metric(self, name: str, value: float, *, step: Optional[int] = None) -> None:
        for delegate in self.delegates:
            try:
                delegate.log_metric(name, value, step=step)
            except Exception:  # pragma: no cover - guard each delegate
                logger.exception("Telemetry delegate failed in log_metric")

    def log_params(self, params: Dict[str, Any]) -> None:
        for delegate in self.delegates:
            try:
                delegate.log_params(params)
            except Exception:  # pragma: no cover
                logger.exception("Telemetry delegate failed in log_params")

    def set_tags(self, tags: Dict[str, Any]) -> None:
        for delegate in self.delegates:
            try:
                delegate.set_tags(tags)
            except Exception:  # pragma: no cover
                logger.exception("Telemetry delegate failed in set_tags")


__all__ = [
    "ChunkingTelemetry",
    "NullChunkingTelemetry",
    "LoggingChunkingTelemetry",
    "MlflowChunkingTelemetry",
    "CompositeChunkingTelemetry",
]
