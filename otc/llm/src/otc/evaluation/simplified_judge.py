from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, Optional, Type

from pydantic import BaseModel

from otc.llm.client import OpenAICompatClient
from otc.llm.structured import ask_for_model
from otc.utils.import_tools import import_by_path

from .utils import resolve_project_path

_VALID_GROUPS = ("overview", "deadline", "threshold", "penalty")


@dataclass
class SimplifiedEvaluationConfig:
    prompt_paths: Dict[str, str]
    schema_class_path: str = "otc.schemas.schema_simplified_evaluation:OTCSimplifiedEvaluationResult"
    retries: int = 2
    max_source_chars: Optional[int] = None
    max_extraction_context_chars: Optional[int] = None


def _to_json(value: Any) -> str:
    try:
        return json.dumps(value, ensure_ascii=False, default=str)
    except Exception:
        return json.dumps(str(value), ensure_ascii=False)


class SimplifiedEvaluationJudge:
    def __init__(self, client: OpenAICompatClient, config: SimplifiedEvaluationConfig) -> None:
        self.client = client
        self.config = config
        self._schema_cls: Type[BaseModel] = import_by_path(config.schema_class_path)
        self._system_prompts: Dict[str, str] = {}
        self._load_prompts()

    def _load_prompts(self) -> None:
        missing: list[str] = []
        for group in _VALID_GROUPS:
            raw_path = self.config.prompt_paths.get(group)
            if not raw_path:
                missing.append(group)
                continue
            path = resolve_project_path(raw_path)
            self._system_prompts[group] = path.read_text(encoding="utf-8")
        if missing:
            raise ValueError(f"Missing simplified evaluation prompt paths for groups: {', '.join(missing)}")

    def _truncate_source(self, source_text: str) -> str:
        if not source_text:
            return ""
        limit = self.config.max_source_chars
        if not limit or len(source_text) <= limit:
            return source_text
        head = source_text[: limit // 2]
        tail = source_text[-(limit // 2) :]
        return head + "\n\n[...TRUNCATED...]\n\n" + tail

    def _truncate_context(self, text: str) -> str:
        if not text:
            return ""
        limit = self.config.max_extraction_context_chars
        if not limit or len(text) <= limit:
            return text
        return text[:limit]

    def build_user_prompt(
        self,
        *,
        group: str,
        jurisdiction: str,
        obligation_type_id: str,
        indicator_key: str,
        indicator_value: Any,
        source_text: str,
        extraction_prompt_context: str,
        obligation_addendum: str,
    ) -> str:
        extraction_context = self._truncate_context(extraction_prompt_context or "")
        addendum = self._truncate_context(obligation_addendum or "")
        return (
            f"group: {group}\n"
            f"jurisdiction: {jurisdiction}\n"
            f"obligation_type_id: {obligation_type_id}\n"
            f"indicator_key: {indicator_key}\n"
            f"extracted_indicator_value_json: {_to_json(indicator_value)}\n\n"
            "EXTRACTION_PROMPT_CONTEXT:\n"
            f"{extraction_context}\n\n"
            "OBLIGATION_CONTEXT_ADDENDUM:\n"
            f"{addendum}\n\n"
            "SOURCE_TEXT:\n"
            f"{self._truncate_source(source_text)}"
        )

    def evaluate(
        self,
        *,
        group: str,
        jurisdiction: str,
        obligation_type_id: str,
        indicator_key: str,
        indicator_value: Any,
        source_text: str,
        extraction_prompt_context: str,
        obligation_addendum: str,
        mlflow_ctx: Optional[dict] = None,
    ) -> BaseModel:
        normalized_group = (group or "").strip().lower()
        if normalized_group not in _VALID_GROUPS:
            raise ValueError(f"Unsupported simplified evaluation group: {group}")

        system_prompt = self._system_prompts[normalized_group]
        user_prompt = self.build_user_prompt(
            group=normalized_group,
            jurisdiction=jurisdiction,
            obligation_type_id=obligation_type_id,
            indicator_key=indicator_key,
            indicator_value=indicator_value,
            source_text=source_text,
            extraction_prompt_context=extraction_prompt_context,
            obligation_addendum=obligation_addendum,
        )
        return ask_for_model(
            self.client,
            system_prompt,
            user_prompt,
            self._schema_cls,
            retries=self.config.retries,
            mlflow_ctx=mlflow_ctx,
        )
