from __future__ import annotations

import json
from dataclasses import dataclass
from enum import Enum
from typing import Any, Dict, Optional

from otc.llm.client import OpenAICompatClient
from otc.llm.structured import ask_for_model

from .utils import load_module_from_path, resolve_project_path


@dataclass
class OverviewJudgeConfig:
    system_prompt_path: str
    schema_path: str
    retries: int = 2
    max_source_chars: Optional[int] = None


def normalize_value(val: Any) -> Any:
    if val is None:
        return None
    if isinstance(val, Enum):
        return val.value
    if isinstance(val, list):
        return [normalize_value(v) for v in val]
    return val


class OverviewJudge:
    def __init__(self, client: OpenAICompatClient, config: OverviewJudgeConfig) -> None:
        self.client = client
        self.config = config
        self._system_prompt: Optional[str] = None
        self._report_model = None
        self._load_assets()

    def _load_assets(self) -> None:
        schema_mod = load_module_from_path("schema_overview_judge", self.config.schema_path)
        report_model = getattr(schema_mod, "OTCOverviewJudgeReport", None)
        if report_model is None:
            raise AttributeError("schema module missing OTCOverviewJudgeReport")
        # Rebuild to resolve forward refs when importing dynamically
        try:
            report_model.model_rebuild(_types_namespace=vars(schema_mod))
        except Exception:
            pass
        results_model = getattr(schema_mod, "OverviewJudgeResults", None)
        if results_model is not None:
            try:
                results_model.model_rebuild(_types_namespace=vars(schema_mod))
            except Exception:
                pass
        self._report_model = report_model

        prompt_path = resolve_project_path(self.config.system_prompt_path)
        self._system_prompt = prompt_path.read_text(encoding="utf-8")

    def _truncate_source(self, source_text: str) -> str:
        if not source_text:
            return ""
        max_chars = self.config.max_source_chars
        if max_chars and len(source_text) > max_chars:
            head = source_text[: max_chars // 2]
            tail = source_text[-max_chars // 2 :]
            return head + "\n\n[...TRUNCATED...]\n\n" + tail
        return source_text

    @staticmethod
    def build_user_prompt(
        jurisdiction: str,
        obligation_type_id: str,
        candidate_values: Dict[str, Any],
        source_text: str,
    ) -> str:
        return (
            f"jurisdiction: {jurisdiction}\n"
            f"obligation_type_id: {obligation_type_id}\n"
            f"candidate_values: {json.dumps(candidate_values, ensure_ascii=False)}\n"
            "source_text:\n"
            f"{source_text}"
        )

    def judge_pair(
        self,
        *,
        jurisdiction: str,
        obligation_type_id: str,
        candidate_values: Dict[str, Any],
        source_text: str,
        mlflow_ctx: Optional[dict] = None,
    ):
        if not self._system_prompt or self._report_model is None:
            raise RuntimeError("OverviewJudge assets not loaded")
        user_prompt = self.build_user_prompt(
            jurisdiction=jurisdiction,
            obligation_type_id=obligation_type_id,
            candidate_values=candidate_values,
            source_text=self._truncate_source(source_text),
        )
        return ask_for_model(
            self.client,
            self._system_prompt,
            user_prompt,
            self._report_model,
            retries=self.config.retries,
            mlflow_ctx=mlflow_ctx,
        )
