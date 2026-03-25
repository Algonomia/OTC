from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple

from pydantic import BaseModel, Field, ValidationError, field_validator

from otc.llm.client import ChatMessage, OpenAICompatClient
from otc.logging import setup_logger

from .candidates import get_allowed_obligation_values
from .models import ChunkLabel
from .telemetry import ChunkingTelemetry, NullChunkingTelemetry


logger = setup_logger("otc.chunking.labeler")
_OBLIGATION_VALUE_LOOKUP = {
    value.lower(): value for value in get_allowed_obligation_values()
}


class ChunkLabelingError(RuntimeError):
    """Raised when labeling exhausts all retries without a usable response."""


@dataclass
class ChunkLabelingResult:
    labels: List[ChunkLabel]
    attempts: int
    duration_seconds: float
    used_structured: bool


class ChunkLabelItem(BaseModel):
    jurisdiction: str = Field(..., description="Jurisdiction mentioned in the chunk")
    obligation_type: str = Field(..., description="Obligation type discussed for the jurisdiction")
    relevance_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Relative importance of the chunk content for this jurisdiction and obligation (0-1)",
    )

    @field_validator("jurisdiction")
    @classmethod
    def _normalize_jurisdiction(cls, value: str) -> str:
        return str(value or "").strip().upper()

    @field_validator("obligation_type")
    @classmethod
    def _validate_obligation_type(cls, value: str) -> str:
        clean = str(value or "").strip()
        mapped = _OBLIGATION_VALUE_LOOKUP.get(clean.lower())
        if mapped is None:
            allowed = ", ".join(sorted(_OBLIGATION_VALUE_LOOKUP.values()))
            raise ValueError(
                f"Unknown obligation_type '{clean}'. Allowed values: {allowed}"
            )
        return mapped


class ChunkLabelResponse(BaseModel):
    labels: List[ChunkLabelItem] = Field(default_factory=list)


class ChunkLabeler:
    def __init__(
        self,
        client: OpenAICompatClient,
        system_prompt: str,
        candidate_jurisdictions: Optional[Iterable[str]] = None,
        candidate_obligations: Optional[Iterable[str]] = None,
        additional_instructions: Optional[str] = None,
        telemetry: Optional[ChunkingTelemetry] = None,
        max_retries: int = 3,
        retry_backoff_seconds: float = 0.5,
    ) -> None:
        self.client = client
        self.system_prompt = system_prompt
        self.candidate_jurisdictions = list(candidate_jurisdictions or [])
        self.candidate_obligations = list(candidate_obligations or [])
        self.additional_instructions = additional_instructions or ""
        self.telemetry = telemetry or NullChunkingTelemetry()
        self.max_retries = max(1, int(max_retries))
        self.retry_backoff_seconds = max(0.0, float(retry_backoff_seconds))

    def _build_user_prompt(self, chunk_text: str, chunk_id: str, index: int, token_count: int) -> str:
        detail_lines = [
            "You are labeling compliance content describing reporting obligations.",
            "Identify every jurisdiction and obligation type combination discussed in the chunk.",
            "Assign a relevance score between 0 and 1 where 1.0 means the chunk is rich in actionable detail (procedures, deadlines, applicable parties, thresholds, potential penalties, or filing mechanics).",
            "Return unique combinations only; if the same pair appears multiple times, output it once using the highest relevance score you observed.",
        ]

        if self.candidate_jurisdictions:
            detail_lines.append(
                "Candidate jurisdictions (for context only, do not treat as exhaustive): "
                + ", ".join(self.candidate_jurisdictions)
            )
        if self.candidate_obligations:
            detail_lines.append(
                "Candidate obligation types (for context only, do not treat as exhaustive): "
                + ", ".join(self.candidate_obligations)
            )
        if self.additional_instructions:
            detail_lines.append(f"Additional guidance: {self.additional_instructions.strip()}")

        instructions = "\n".join(detail_lines)

        return (
            f"Chunk id: {chunk_id}\n"
            f"Chunk index: {index}\n"
            f"Token count: {token_count}\n"
            f"{instructions}\n\n"
            f"Chunk text:\n" + chunk_text.strip()
        )

    def _label_once(self, messages: List[ChatMessage]) -> Tuple[List[ChunkLabel], bool]:
        used_structured = False
        if getattr(self.client, "use_instructor", False):
            try:
                response = self.client.chat_structured(messages, ChunkLabelResponse)
                labels = [ChunkLabel(**item.model_dump()) for item in response.labels]
                used_structured = True
                return labels, used_structured
            except ValidationError as exc:
                logger.debug("Structured chunk labeling validation failed, falling back to raw JSON: %s", exc)
            except Exception as exc:
                logger.warning("Structured chunk labeling request failed: %s", exc)

        try:
            raw = self.client.chat(messages)
        except Exception as exc:
            raise ChunkLabelingError("LLM chat completion call failed") from exc

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ChunkLabelingError("LLM returned a non-JSON payload") from exc

        labels_raw = data.get("labels") if isinstance(data, dict) else data
        if not isinstance(labels_raw, list):
            raise ChunkLabelingError("LLM response JSON missing 'labels' list")

        result: List[ChunkLabel] = []
        invalid_items: List[str] = []
        for item in labels_raw:
            if not isinstance(item, dict):
                invalid_items.append("non-dict item")
                continue
            try:
                parsed = ChunkLabelItem(**item)
            except ValidationError as exc:
                invalid_items.append(str(exc))
                continue
            result.append(ChunkLabel(**parsed.model_dump()))

        if invalid_items:
            raise ChunkLabelingError(
                "LLM returned invalid chunk label items; "
                f"count={len(invalid_items)} first_error={invalid_items[0]}"
            )

        return result, used_structured

    @staticmethod
    def _format_labels_for_log(labels: List[ChunkLabel]) -> str:
        if not labels:
            return "[]"
        return ", ".join(
            f"{label.jurisdiction}/{label.obligation_type}:{label.relevance_score:.2f}"
            for label in labels
        )

    def label_chunk(self, chunk_text: str, chunk_id: str, index: int, token_count: int) -> ChunkLabelingResult:
        messages = [
            ChatMessage(role="system", content=self.system_prompt),
            ChatMessage(role="user", content=self._build_user_prompt(chunk_text, chunk_id, index, token_count)),
        ]

        logger.info(
            "Labeling chunk %s (index=%s, tokens=%s) with up to %s attempts",
            chunk_id,
            index,
            token_count,
            self.max_retries,
        )
        start = time.perf_counter()
        for attempt in range(1, self.max_retries + 1):
            try:
                labels, used_structured = self._label_once(messages)
                duration = time.perf_counter() - start
                self.telemetry.log_metric("chunking.label.attempts", attempt, step=index)
                self.telemetry.log_metric("chunking.label.duration_seconds", duration, step=index)
                self.telemetry.log_metric("chunking.label.labels_returned", float(len(labels)), step=index)
                logger.info(
                    "Chunk %s labeling result: labels=%s attempts=%s structured=%s duration=%.2fs",
                    chunk_id,
                    self._format_labels_for_log(labels),
                    attempt,
                    used_structured,
                    duration,
                )
                return ChunkLabelingResult(
                    labels=labels,
                    attempts=attempt,
                    duration_seconds=duration,
                    used_structured=used_structured,
                )
            except ChunkLabelingError as exc:
                logger.warning(
                    "Chunk labeling attempt %s failed for chunk %s (%s tokens): %s",
                    attempt,
                    chunk_id,
                    token_count,
                    exc,
                )
                if attempt == self.max_retries:
                    duration = time.perf_counter() - start
                    self.telemetry.log_metric("chunking.label.failures", 1.0, step=index)
                    self.telemetry.log_metric("chunking.label.duration_seconds", duration, step=index)
                    raise

                delay = self.retry_backoff_seconds * attempt
                if delay > 0:
                    time.sleep(delay)

        raise ChunkLabelingError("Exhausted chunk labeling retries")


__all__ = [
    "ChunkLabeler",
    "ChunkLabelingError",
    "ChunkLabelingResult",
]
