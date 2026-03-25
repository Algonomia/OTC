from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from typing import Any, Dict, List, Optional, Type

from pydantic import BaseModel, RootModel

from otc.validation.post_generation_checks import extra_schema_check_report
from otc.llm.structured import ask_for_model

__all__ = [
    "retry_schema_failures",
    "check_schema_failures",
]

_SCHEMA_RETRY_SYSTEM_PROMPT = (
    "You fix JSON extraction outputs based on validation feedback. "
    "Follow user instructions exactly and return valid JSON only."
)

_TEMPLATE_BY_TASK: Dict[str, str] = {
    "deadline": "retry_prompt_deadline_template_v1.txt",
    "threshold": "retry_prompt_threshold_template_v1.txt",
    "penalty": "retry_prompt_penalty_template_v1.txt",
}


class _RetryPatchResponse(RootModel[Dict[str, Any]]):
    pass


def _context_override(task_type: str, keys: List[str]) -> Dict[str, str]:
    normalized = task_type.lower().strip()
    if normalized == "deadline":
        return {k: "deadline" for k in keys}
    if normalized == "threshold":
        return {k: "threshold" for k in keys}
    if normalized == "penalty":
        return {k: "penalty" for k in keys}
    return {}


def _build_value_map(task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    normalized = task_type.lower().strip()

    if normalized == "deadline":
        out: Dict[str, Any] = {}
        for key in ("deadline_preparation", "deadline_filing", "deadline_extension"):
            field = payload.get(key)
            out[key] = field.get("value") if isinstance(field, dict) else None
        return out

    if normalized == "threshold":
        # New threshold schema has two fields; keep legacy fallback for old single-field payloads.
        if "threshold_preparation" in payload or "threshold_filing" in payload:
            out: Dict[str, Any] = {}
            for key in ("threshold_preparation", "threshold_filing"):
                field = payload.get(key)
                out[key] = field.get("value") if isinstance(field, dict) else None
            return out
        return {"Threshold": payload.get("value")}

    if normalized == "penalty":
        return {"Penalty": payload.get("value")}

    raise ValueError(f"Unsupported task_type for schema retry: {task_type}")


def check_schema_failures(
    *,
    task_type: str,
    payload: Dict[str, Any],
    fail_on_warnings: bool,
) -> Dict[str, Dict[str, List[str]]]:
    value_map = _build_value_map(task_type, payload)
    keys = list(value_map.keys())
    report = extra_schema_check_report(
        value_map,
        key_context_override=_context_override(task_type, keys),
        include_warning_only_keys=fail_on_warnings,
    )

    if fail_on_warnings:
        return report

    return {k: v for k, v in report.items() if v.get("errors")}


def _load_template(retry_prompts_dir: Path, task_type: str) -> str:
    key = task_type.lower().strip()
    name = _TEMPLATE_BY_TASK.get(key)
    if not name:
        raise ValueError(f"No retry template configured for task_type={task_type}")
    path = retry_prompts_dir / name
    if not path.exists() or not path.is_file():
        raise FileNotFoundError(f"Retry template not found: {path}")
    return path.read_text(encoding="utf-8")


def _render_retry_prompt(
    *,
    template: str,
    original_system_prompt: str,
    source_text: str,
    failing_output: Dict[str, Any],
    validation_report: Dict[str, Dict[str, List[str]]],
) -> str:
    prompt = template
    replacements = {
        "<<ORIGINAL_SYSTEM_PROMPT>>": original_system_prompt,
        "<<SOURCE_TEXT>>": source_text,
        "<<FAILING_KEYS_PREVIOUS_OUTPUT_JSON>>": json.dumps(failing_output, ensure_ascii=False, indent=2),
        "<<VALIDATION_REPORT_JSON>>": json.dumps(validation_report, ensure_ascii=False, indent=2),
    }
    for placeholder, value in replacements.items():
        prompt = prompt.replace(placeholder, value)
    return prompt


def _build_failing_output(
    *,
    task_type: str,
    payload: Dict[str, Any],
    failing_keys: List[str],
) -> Dict[str, Any]:
    normalized = task_type.lower().strip()

    if normalized == "deadline":
        return {
            key: payload.get(key)
            for key in failing_keys
            if key in {"deadline_preparation", "deadline_filing", "deadline_extension"}
        }

    if normalized == "threshold":
        if "threshold_preparation" in payload or "threshold_filing" in payload:
            return {
                key: payload.get(key)
                for key in failing_keys
                if key in {"threshold_preparation", "threshold_filing"}
            }
        return {"Threshold": payload}

    if normalized == "penalty":
        return {"Penalty": payload}

    return {}


def _apply_patch(
    *,
    task_type: str,
    payload: Dict[str, Any],
    patch: Dict[str, Any],
) -> Dict[str, Any]:
    normalized = task_type.lower().strip()
    candidate = deepcopy(payload)

    if normalized == "deadline":
        for key in ("deadline_preparation", "deadline_filing", "deadline_extension"):
            if key in patch:
                candidate[key] = patch[key]
        return candidate

    if normalized == "threshold":
        if "threshold_preparation" in candidate or "threshold_filing" in candidate:
            for key in ("threshold_preparation", "threshold_filing"):
                if key in patch:
                    candidate[key] = patch[key]
            return candidate
        wrapped = patch.get("Threshold")
        if isinstance(wrapped, dict):
            return wrapped
        if any(k in patch for k in ("value", "notes", "references", "tag_notes", "additional_values")):
            return patch
        return candidate

    wrapper_key = "Penalty"
    wrapped = patch.get(wrapper_key)
    if isinstance(wrapped, dict):
        return wrapped

    if any(k in patch for k in ("value", "notes", "references", "tag_notes", "additional_values")):
        return patch

    return candidate


def retry_schema_failures(
    *,
    client,
    schema_cls: Type[BaseModel],
    task_type: str,
    current_model: BaseModel,
    original_system_prompt: str,
    source_text: str,
    retry_prompts_dir: Path,
    max_tries: int,
    fail_on_warnings: bool,
    mlflow_ctx: Optional[dict] = None,
) -> tuple[BaseModel, Dict[str, Dict[str, List[str]]], bool]:
    payload = current_model.model_dump(mode="json", exclude_none=False)
    report = check_schema_failures(
        task_type=task_type,
        payload=payload,
        fail_on_warnings=fail_on_warnings,
    )

    if not report:
        return current_model, report, False

    result_model = current_model
    patched = False

    tries = max(0, int(max_tries))
    if tries == 0:
        return current_model, report, False

    template = _load_template(retry_prompts_dir, task_type)

    for _ in range(tries):
        failing_keys = list(report.keys())
        failing_output = _build_failing_output(
            task_type=task_type,
            payload=payload,
            failing_keys=failing_keys,
        )

        prompt = _render_retry_prompt(
            template=template,
            original_system_prompt=original_system_prompt,
            source_text=source_text,
            failing_output=failing_output,
            validation_report=report,
        )

        patch_model = ask_for_model(
            client,
            _SCHEMA_RETRY_SYSTEM_PROMPT,
            prompt,
            _RetryPatchResponse,
            retries=0,
            mlflow_ctx=mlflow_ctx,
        )
        patch_obj = patch_model.root if hasattr(patch_model, "root") else {}
        if not isinstance(patch_obj, dict):
            continue

        candidate_payload = _apply_patch(
            task_type=task_type,
            payload=payload,
            patch=patch_obj,
        )

        try:
            candidate_model = schema_cls.model_validate(candidate_payload)
        except Exception as exc:
            report = {
                "__schema_model_validation__": {
                    "errors": [f"ERROR: root — corrected output failed schema model validation: {exc}"],
                    "warnings": [],
                }
            }
            patched = True
            continue

        payload = candidate_model.model_dump(mode="json", exclude_none=False)
        report = check_schema_failures(
            task_type=task_type,
            payload=payload,
            fail_on_warnings=fail_on_warnings,
        )
        result_model = candidate_model
        patched = True

        if not report:
            break

    return result_model, report, patched
