from dataclasses import dataclass
import mlflow
import time
from contextlib import nullcontext
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from uuid import uuid4
from otc.logging import setup_logger
from otc.config import load_app_config, load_model_config, load_pipeline_config
from otc.registry.prompt_loader import (
    build_document_packet,
    load_obligation_addendum,
    load_system_prompt,
)
from otc.llm.client import OpenAICompatClient
from otc.io.upstream import iter_requests, load_request
from otc.io.downstream import write_json
from otc.io.text_sources import load_text_from_sources
from otc.utils.import_tools import import_by_path
from otc.utils.schema_tools import schema_hash
from otc.chunking.manager import DocumentChunkManager
from otc.chunking.runtime import build_chunk_runtime
from otc.chunking.telemetry import (
    CompositeChunkingTelemetry,
    LoggingChunkingTelemetry,
    MlflowChunkingTelemetry,
)
from otc.evaluation.simplified_judge import (
    SimplifiedEvaluationConfig,
    SimplifiedEvaluationJudge,
)
from otc.extractors.overview_extractor import extract_overview
from otc.extractors.deadline_extractor import extract_deadline
from otc.extractors.threshold_extractor import extract_threshold
from otc.extractors.penalty_extractor import extract_penalty
from otc.validation.post_generation_checks import (
    STATUS_EMPTY,
    STATUS_GENERATION_FAILED,
    STATUS_POST_GENERATION_SCHEMA_CHECK_FAILED,
    STATUS_SUCCESS,
    check_indicator_value,
)
from otc.validation.schema_retry import retry_schema_failures

log = setup_logger("otc.pipeline")
__all__ = ["PocPipeline"]


@dataclass(frozen=True)
class _RequestPayload:
    source_id: Any
    source_name: str
    organization: str
    organization_type_id: str
    jurisdictions: List[str]
    jurisdiction_names: Dict[str, str]
    obligations: List[str]
    indicators: List[str]
    text: str
    request_name: str
    epoch: int


def _split_indicator_groups(indicators: List[str], groups: Dict[str, List[str]]) -> Dict[str, List[str]]:
    return {k: [i for i in indicators if i in v] for k, v in groups.items()}


def _downstream_row(
    source_id: Any,
    j: str,
    o: str,
    key: str,
    value: Any,
    notes: str = "",
    references: str = "",
) -> Dict[str, Any]:
    return {
        "source_id": source_id,
        "jurisdiction": j,
        "obligation_type_id": o,
        "key": key,
        "value": value,
        "notes": notes,
        "references": references,
    }


def _indicator_value(obj: Any) -> Any:
    """Try to return obj['value'] if present, else obj as dict."""
    if hasattr(obj, "model_dump"):
        d = obj.model_dump(mode="json", exclude_none=True)
    elif isinstance(obj, dict):
        d = obj
    else:
        return obj
    return d["value"] if "value" in d else None


def _refs_from_rule(rule_dict: Dict[str, Any]) -> Tuple[str, str]:
    note = rule_dict.get("notes") or rule_dict.get("note") or ""
    refs = rule_dict.get("references")
    if isinstance(refs, str):
        return note, refs
    legacy_refs = ", ".join(rule_dict.get("legal_reference") or [])
    return note, legacy_refs

# --- pipeline -------------------------------------------------------------

class PocPipeline:
    def __init__(self):
        self.app = load_app_config()
        self.pipe = load_pipeline_config()
        self.retries = int(self.pipe.get("retries", 2))
        self.model_cfg = load_model_config(self.pipe["model_key"])
        mlflow_cfg = self.pipe.get("mlflow", {}) or {}
        raw_mlflow_enabled = mlflow_cfg.get("enabled", False)
        if isinstance(raw_mlflow_enabled, str):
            self.mlflow_enabled_default = raw_mlflow_enabled.strip().lower() in {"1", "true", "yes", "y", "on"}
        else:
            self.mlflow_enabled_default = bool(raw_mlflow_enabled)

        self.client = OpenAICompatClient(
            provider=self.model_cfg.provider,
            model=self.model_cfg.model,
            base_url_env_name=self.model_cfg.base_url_env_name,
            api_key_env_name=self.model_cfg.api_key_env_name,
            temperature=self.model_cfg.temperature,
            max_output_tokens=self.model_cfg.max_output_tokens,
            json_mode=self.model_cfg.json_mode,
            use_instructor=bool(getattr(self.model_cfg, "use_instructor", False)),
            instructor_max_retries=int(getattr(self.model_cfg, "instructor_max_retries", 3)),
            instructor_mode=str(getattr(self.model_cfg, "instructor_mode", "JSON")),
        )

        self.incoming = Path(self.app.incoming_dir)
        self.processed = Path(self.app.processed_dir)

        # Prompts
        unified_prompt_path = self.app.prompts.get("unified_extraction_sys") or self.app.prompts.get("overview_sys")
        if not unified_prompt_path:
            raise KeyError("Missing required prompt config key: prompts.unified_extraction_sys")

        self.unified_extraction_sys = load_system_prompt(unified_prompt_path)
        self.overview_task_spec = load_system_prompt(self.app.prompts["overview_sys"])
        self.deadline_task_spec = load_system_prompt(self.app.prompts["deadline_sys"])
        self.threshold_task_spec = load_system_prompt(self.app.prompts["threshold_sys"])
        penalty_prompt_path = self.app.prompts.get("penalty_sys")
        if not penalty_prompt_path:
            raise KeyError("Missing required prompt config key: prompts.penalty_sys")
        self.penalty_task_spec = load_system_prompt(penalty_prompt_path)

        configured_addendum_dir = self.app.prompts.get("obligation_addendum_dir")
        overview_prompt_path = Path(self.app.prompts["overview_sys"])
        if configured_addendum_dir:
            self.obligation_addendum_dir = Path(configured_addendum_dir)
        else:
            self.obligation_addendum_dir = overview_prompt_path.parent.parent / "obligation_addendum"

        project_root = overview_prompt_path.resolve().parents[2]
        schema_check_cfg = self.pipe.get("schema_verification", {}) or {}
        self.schema_verification_enabled = bool(schema_check_cfg.get("enabled", True))
        self.schema_verification_max_tries = int(schema_check_cfg.get("max_tries", 3))
        self.schema_verification_fail_on_warnings = bool(schema_check_cfg.get("fail_on_warnings", True))
        raw_retry_dir = schema_check_cfg.get("retry_prompts_dir")
        if raw_retry_dir:
            retry_dir = Path(raw_retry_dir)
            if not retry_dir.is_absolute():
                retry_dir = (project_root / retry_dir).resolve()
        else:
            retry_dir = (project_root / "prompts" / "schema_fail_retry").resolve()
        self.schema_retry_prompts_dir = retry_dir

        # Schemas
        self.OverviewRow = import_by_path(self.app.schemas["overview_class"])
        self.DeadlineRes = import_by_path(self.app.schemas["deadline_class"])
        self.ThresholdCls = import_by_path(self.app.schemas["threshold_class"])
        self.PenaltyCls = import_by_path(self.app.schemas["penalty_class"]) 

        # schema hashes
        self.schema_hash_overview = schema_hash(self.OverviewRow)
        self.schema_hash_deadline = schema_hash(self.DeadlineRes)
        self.schema_hash_threshold = schema_hash(self.ThresholdCls)
        self.schema_hash_penalty = schema_hash(self.PenaltyCls)
        self.deadline_field_map = dict(getattr(self.app, "deadline_field_map", {}))
        self.threshold_field_map = dict(getattr(self.app, "threshold_field_map", {}))
        self.overview_field_map = dict(getattr(self.app, "overview_field_map", {}))

        chunk_cfg = self.pipe.get("chunking", {}) or {}
        chunk_runtime = build_chunk_runtime(
            chunk_cfg=chunk_cfg,
            model_cfg=self.model_cfg,
            processed_dir=self.processed,
            chunk_prompt_path=self.app.prompts.get("chunk_labeler_sys"),
            default_model_key=self.pipe["model_key"],
        )
        self.chunk_settings = chunk_runtime.settings
        self.chunk_store = chunk_runtime.store
        self.chunk_label_client = chunk_runtime.labeling_client
        self.chunk_labeler_sys = chunk_runtime.labeling_prompt
        self.chunk_retrieval_top_n = chunk_runtime.retrieval_top_n
        self.chunk_manager_enabled = chunk_runtime.enabled

        # --- evaluation (LLM-as-a-judge) ---------------------------------
        eval_cfg = self.pipe.get("evaluation", {}) or {}
        self.eval_enabled = bool(eval_cfg.get("enabled", False))
        self.eval_source_text_mode = str(eval_cfg.get("source_text_mode", "active")).lower()
        self.eval_attach_to_values = bool(eval_cfg.get("attach_to_values", False))
        self.eval_client: OpenAICompatClient | None = None
        self.simplified_eval_judge: SimplifiedEvaluationJudge | None = None

        if self.eval_enabled:
            eval_model_key = eval_cfg.get("model_key") or self.pipe["model_key"]
            eval_model_cfg = load_model_config(eval_model_key)

            if "json_mode" in eval_cfg:
                eval_json_mode = bool(eval_cfg.get("json_mode"))
            else:
                eval_json_mode = bool(eval_model_cfg.json_mode)

            eval_temperature = eval_cfg.get("temperature")
            if eval_temperature is None:
                eval_temperature = eval_model_cfg.temperature

            eval_max_tokens = eval_cfg.get("max_output_tokens")
            if eval_max_tokens is None:
                eval_max_tokens = eval_model_cfg.max_output_tokens

            eval_use_instructor = bool(eval_cfg.get("use_instructor", eval_model_cfg.use_instructor))
            eval_instructor_mode = str(eval_cfg.get("instructor_mode", "JSON"))
            eval_instructor_max_retries = int(
                eval_cfg.get("instructor_max_retries", eval_model_cfg.instructor_max_retries)
            )

            eval_base_url_env = eval_cfg.get("base_url_env") or eval_model_cfg.base_url_env_name
            eval_api_key_env = eval_cfg.get("api_key_env") or eval_model_cfg.api_key_env_name
            eval_model = eval_cfg.get("model") or eval_model_cfg.model
            eval_provider = eval_cfg.get("provider") or eval_model_cfg.provider

            self.eval_client = OpenAICompatClient(
                provider=eval_provider,
                model=eval_model,
                base_url_env_name=eval_base_url_env,
                api_key_env_name=eval_api_key_env,
                temperature=eval_temperature,
                max_output_tokens=eval_max_tokens,
                json_mode=eval_json_mode,
                use_instructor=eval_use_instructor,
                instructor_max_retries=eval_instructor_max_retries,
                instructor_mode=eval_instructor_mode,
            )
            simplified_cfg = eval_cfg.get("simplified", {}) or {}
            simplified_enabled = bool(simplified_cfg.get("enabled", True))
            if simplified_enabled:
                prompt_paths = dict(simplified_cfg.get("prompts") or {})
                defaults = {
                    "overview": "prompts/evaluation/simplified/sys_prompt_overview_simplified_eval.txt",
                    "deadline": "prompts/evaluation/simplified/sys_prompt_deadline_simplified_eval.txt",
                    "threshold": "prompts/evaluation/simplified/sys_prompt_threshold_simplified_eval.txt",
                    "penalty": "prompts/evaluation/simplified/sys_prompt_penalty_simplified_eval.txt",
                }
                for group, path in defaults.items():
                    prompt_paths.setdefault(group, path)

                schema_class = str(
                    simplified_cfg.get(
                        "schema_class",
                        "otc.schemas.schema_simplified_evaluation:OTCSimplifiedEvaluationResult",
                    )
                )
                retries = int(simplified_cfg.get("retries", self.retries))
                max_source_chars = simplified_cfg.get("max_source_chars")
                max_extraction_context_chars = simplified_cfg.get("max_extraction_context_chars")
                try:
                    self.simplified_eval_judge = SimplifiedEvaluationJudge(
                        self.eval_client,
                        SimplifiedEvaluationConfig(
                            prompt_paths=prompt_paths,
                            schema_class_path=schema_class,
                            retries=retries,
                            max_source_chars=max_source_chars,
                            max_extraction_context_chars=max_extraction_context_chars,
                        ),
                    )
                except Exception as exc:
                    log.warning("Failed to initialize SimplifiedEvaluationJudge: %s", exc)
                    self.simplified_eval_judge = None

    def _normalize_request(
        self,
        req: Dict[str, Any],
        *,
        request_name: Optional[str],
        epoch: Optional[int],
    ) -> _RequestPayload:
        source_id = req.get("source_id", "unknown")
        source_name = str(req.get("source_name", "") or "")
        organization = str(req.get("organization", "") or "")
        organization_type_id = str(req.get("organization_type_id", "") or "")
        jurisdictions = list(req["jurisdictions"])
        raw_jurisdiction_names = req.get("jurisdiction_names") or {}
        jurisdiction_names = raw_jurisdiction_names if isinstance(raw_jurisdiction_names, dict) else {}
        obligations = list(req["obligations_type_ids"])
        indicators = list(req["indicators_ids"])
        file_paths = list(req.get("file_paths") or req.get("file_urls") or [])
        text = req.get("text")

        if not text:
            if not file_paths:
                raise ValueError("Request must provide either 'text' or one of ['file_paths', 'file_urls'].")
            text = load_text_from_sources(file_paths)

        resolved_epoch = epoch or int(time.time())
        resolved_request_name = request_name or f"{source_id}-{resolved_epoch}-{uuid4().hex[:6]}"
        return _RequestPayload(
            source_id=source_id,
            source_name=source_name,
            organization=organization,
            organization_type_id=organization_type_id,
            jurisdictions=jurisdictions,
            jurisdiction_names=jurisdiction_names,
            obligations=obligations,
            indicators=indicators,
            text=str(text),
            request_name=resolved_request_name,
            epoch=resolved_epoch,
        )

    @staticmethod
    def _resolve_jurisdiction_name(jurisdiction_names: Dict[str, str], code: str) -> str:
        candidate = jurisdiction_names.get(code)
        if isinstance(candidate, str) and candidate.strip():
            return candidate.strip()
        return code

    @staticmethod
    def _with_llm_trace_ctx(
        base_ctx: Optional[dict],
        *,
        phase: str,
        indicator: str,
        requested: Optional[List[str]] = None,
    ) -> dict:
        ctx = dict(base_ctx) if isinstance(base_ctx, dict) else {}
        ctx["phase"] = phase
        ctx["indicator"] = indicator
        if requested:
            ctx["requested_indicators"] = ", ".join(requested)
        return ctx

    def _build_extraction_context(
        self,
        *,
        task_prompt: str,
        obligation_addendum: str,
    ) -> str:
        return (
            "UNIFIED_EXTRACTION_SYSTEM_PROMPT:\n"
            f"{self.unified_extraction_sys}\n\n"
            "TASK_SPEC_PROMPT:\n"
            f"{task_prompt}\n\n"
            "OBLIGATION_CONTEXT_ADDENDUM:\n"
            f"{obligation_addendum or ''}"
        )

    def _maybe_retry_schema_output(
        self,
        *,
        task_type: str,
        schema_cls: type,
        extracted_model: Any,
        task_prompt: str,
        active_text: Optional[str],
        ml_ctx: Optional[dict],
        jurisdiction: str,
        obligation_type: str,
        mlflow_enabled: bool,
    ) -> Any:
        if not self.schema_verification_enabled:
            return extracted_model

        try:
            corrected_model, report, retried = retry_schema_failures(
                client=self.client,
                schema_cls=schema_cls,
                task_type=task_type,
                current_model=extracted_model,
                original_system_prompt=task_prompt,
                source_text=active_text or "",
                retry_prompts_dir=self.schema_retry_prompts_dir,
                max_tries=self.schema_verification_max_tries,
                fail_on_warnings=self.schema_verification_fail_on_warnings,
                mlflow_ctx=ml_ctx,
            )
        except Exception as exc:
            log.warning(
                "Schema verification/retry failed for %s %s/%s: %s",
                task_type,
                jurisdiction,
                obligation_type,
                exc,
            )
            if mlflow_enabled:
                mlflow.set_tag(f"{task_type}_schema_retry_error", str(exc)[:1000])
            return extracted_model

        if retried and mlflow_enabled:
            mlflow.log_metric(f"{task_type}_schema_retry_attempted", 1.0)

        if report:
            log.warning(
                "Schema verification unresolved for %s %s/%s after retry: %s",
                task_type,
                jurisdiction,
                obligation_type,
                report,
            )
            if mlflow_enabled:
                mlflow.set_tag(f"{task_type}_schema_retry_unresolved", "true")
                mlflow.log_dict(
                    report,
                    artifact_file=f"schema_validation/{jurisdiction}-{obligation_type}-{task_type}-report.json",
                )
        elif retried:
            log.info(
                "Schema verification corrected %s output for %s/%s",
                task_type,
                jurisdiction,
                obligation_type,
            )

        return corrected_model

    def _store_value_row(
        self,
        *,
        output_values: List[Dict[str, Any]],
        value_row_index: Dict[Tuple[str, str, str], Dict[str, Any]],
        source_id: Any,
        jurisdiction: str,
        obligation_type: str,
        key: str,
        value: Any,
        notes: str = "",
        references: str = "",
    ) -> None:
        row = _downstream_row(source_id, jurisdiction, obligation_type, key, value, notes, references)
        output_values.append(row)
        value_row_index[(jurisdiction, obligation_type, key)] = row

    def _record_missing_requested_audits(
        self,
        *,
        requested: List[str],
        handled: set[str],
        jurisdiction: str,
        obligation_type: str,
        record_audit,
    ) -> None:
        for indicator_id in requested:
            if indicator_id in handled:
                continue
            record_audit(
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                key=indicator_id,
                status=STATUS_EMPTY,
            )

    def _handle_generated_indicator_value(
        self,
        *,
        source_id: Any,
        jurisdiction: str,
        obligation_type: str,
        key: str,
        candidate_value: Any,
        notes: str,
        references: str,
        output_values: List[Dict[str, Any]],
        value_row_index: Dict[Tuple[str, str, str], Dict[str, Any]],
        record_audit,
    ) -> Any:
        if candidate_value is None:
            record_audit(
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                key=key,
                status=STATUS_EMPTY,
                raw_generated_notes=notes,
                raw_generated_references=references,
            )
            return None

        check_result = check_indicator_value(
            indicator_key=key,
            value=candidate_value,
        )
        if not check_result.is_valid:
            error_details = list(check_result.errors)
            error_message = "; ".join(error_details)
            log.warning(
                "Generated response failed additional schema checks for %s/%s/%s: %s",
                jurisdiction,
                obligation_type,
                key,
                error_message,
            )
            record_audit(
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                key=key,
                status=STATUS_POST_GENERATION_SCHEMA_CHECK_FAILED,
                error_message=error_message,
                error_details=error_details,
                raw_generated_value=candidate_value,
                raw_generated_notes=notes,
                raw_generated_references=references,
            )
            return None

        returned_value = check_result.normalized_value
        self._store_value_row(
            output_values=output_values,
            value_row_index=value_row_index,
            source_id=source_id,
            jurisdiction=jurisdiction,
            obligation_type=obligation_type,
            key=key,
            value=returned_value,
            notes=notes,
            references=references,
        )
        record_audit(
            jurisdiction=jurisdiction,
            obligation_type=obligation_type,
            key=key,
            status=STATUS_SUCCESS,
            raw_generated_value=candidate_value,
            raw_generated_notes=notes,
            raw_generated_references=references,
            returned_value=returned_value,
            returned_to_downstream=True,
        )
        return returned_value

    @staticmethod
    def _enrich_value_rows(
        rows: List[Dict[str, Any]],
        evaluations: List[Dict[str, Any]],
    ) -> None:
        eval_by_key: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
        for ev in evaluations:
            if not isinstance(ev, dict):
                continue
            ev_key = (
                ev.get("jurisdiction"),
                ev.get("obligation_type_id"),
                ev.get("key"),
            )
            eval_by_key[ev_key] = ev

        for row in rows:
            raw_value = row.get("value")
            additional_value = None
            tag_notes = None
            if isinstance(raw_value, dict):
                maybe_additional = raw_value.get("additional_values")
                maybe_tag_notes = raw_value.get("tag_notes")
                if isinstance(maybe_additional, dict):
                    additional_value = maybe_additional
                if isinstance(maybe_tag_notes, dict):
                    tag_notes = maybe_tag_notes

            row["additional_value"] = additional_value
            row["tag_notes"] = tag_notes

            key = (
                row.get("jurisdiction"),
                row.get("obligation_type_id"),
                row.get("key"),
            )
            matched_eval = eval_by_key.get(key)
            if matched_eval:
                row["llm_evaluation_score"] = matched_eval.get("llm_evaluation_score")
                row["llm_evaluation_reasoning"] = matched_eval.get("llm_evaluation_reasoning") or ""
            else:
                row["llm_evaluation_score"] = None
                row["llm_evaluation_reasoning"] = ""

    def _prepare_chunk_manager(
        self,
        request: _RequestPayload,
        *,
        mlflow_enabled: bool,
    ) -> tuple[Optional[DocumentChunkManager], bool]:
        if not self.chunk_manager_enabled:
            return None, False

        telemetry = LoggingChunkingTelemetry(target_logger=log)
        if mlflow_enabled:
            telemetry = CompositeChunkingTelemetry([telemetry, MlflowChunkingTelemetry()])
        chunk_manager = DocumentChunkManager(
            settings=self.chunk_settings,
            store=self.chunk_store,
            labeling_client=self.chunk_label_client,
            labeling_prompt=self.chunk_labeler_sys,
            telemetry=telemetry,
        )
        chunk_manager.prepare(
            source_id=request.source_id,
            text=request.text,
            jurisdictions=request.jurisdictions,
            obligations=request.obligations,
        )
        if mlflow_enabled:
            mlflow.log_metric("text_token_count", chunk_manager.total_tokens)

        if chunk_manager.is_active():
            bundle = chunk_manager.bundle
            if bundle and mlflow_enabled:
                mlflow.log_metric("chunk_count", len(bundle.chunks))
                mlflow.log_metric("chunk_size_tokens", bundle.chunk_size_tokens)
                mlflow.log_metric("chunk_overlap_tokens", bundle.overlap_tokens)
                preview = [
                    {
                        "chunk_id": chunk.chunk_id,
                        "index": chunk.index,
                        "token_count": chunk.token_count,
                        "labels": [label.to_dict() for label in chunk.llm_labels],
                    }
                    for chunk in bundle.chunks[:10]
                ]
                mlflow.log_dict(
                    {
                        "source_id": request.source_id,
                        "total_tokens": bundle.total_tokens,
                        "chunk_preview": preview,
                    },
                    artifact_file=f"chunking/{request.source_id}_summary.json",
                )
            return chunk_manager, True

        if mlflow_enabled:
            mlflow.log_metric("chunk_count", 0)
        return chunk_manager, False

    def _extract_overview_group(
        self,
        *,
        source_id: Any,
        jurisdiction: str,
        obligation_type: str,
        requested: List[str],
        active_text: Optional[str],
        document_packet: str,
        obligation_addendum: str,
        output_values: List[Dict[str, Any]],
        value_row_index: Dict[Tuple[str, str, str], Dict[str, Any]],
        ml_ctx: Optional[dict],
        mlflow_enabled: bool,
        run_simplified_eval,
        record_audit,
    ) -> bool:
        candidate_values = {indicator_id: None for indicator_id in requested}
        skip_obligation = False
        try:
            overview_model = extract_overview(
                client=self.client,
                sys_prompt=self.unified_extraction_sys,
                schema_cls=self.OverviewRow,
                text=active_text,
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                requested=requested,
                document_packet=document_packet,
                task_spec_prompt=self.overview_task_spec,
                obligation_addendum=obligation_addendum,
                retries=self.retries,
                mlflow_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="extraction",
                    indicator="Overview",
                    requested=requested,
                ),
            )
            data = overview_model.model_dump(mode="json", exclude_none=True).get("data")
            if not isinstance(data, dict):
                skip_obligation = True
            else:
                for indicator_id in requested:
                    field = self.overview_field_map.get(indicator_id)
                    if not field:
                        continue
                    indicator = data.get(field)
                    if indicator is None:
                        continue
                    value = _indicator_value(indicator)
                    if value is None:
                        continue
                    candidate_values[indicator_id] = value

                iso = data.get("is_obligation_in_place")
                if isinstance(iso, dict):
                    iso_value = iso.get("value")
                    if iso_value is None:
                        skip_obligation = True
                    elif iso_value == "NotExist":
                        if "IsObligationInPlace" in requested:
                            note = iso.get("notes") or iso.get("note") or ""
                            self._store_value_row(
                                output_values=output_values,
                                value_row_index=value_row_index,
                                source_id=source_id,
                                jurisdiction=jurisdiction,
                                obligation_type=obligation_type,
                                key="IsObligationInPlace",
                                value=iso_value,
                                notes=note,
                            )
                            candidate_values["IsObligationInPlace"] = iso_value
                        skip_obligation = True

                if not skip_obligation:
                    for indicator_id, candidate_value in candidate_values.items():
                        if candidate_value is None:
                            continue
                        self._store_value_row(
                            output_values=output_values,
                            value_row_index=value_row_index,
                            source_id=source_id,
                            jurisdiction=jurisdiction,
                            obligation_type=obligation_type,
                            key=indicator_id,
                            value=candidate_value,
                        )
        except Exception as exc:
            if mlflow_enabled:
                mlflow.log_metric("overview_extracted", 0)
                mlflow.set_tag("overview_error", str(exc)[:1000])
            log.warning("Overview extraction failed for %s/%s: %s", jurisdiction, obligation_type, exc)
            for indicator_id in requested:
                record_audit(
                    jurisdiction=jurisdiction,
                    obligation_type=obligation_type,
                    key=indicator_id,
                    status=STATUS_GENERATION_FAILED,
                    error_message=str(exc),
                )
                candidate_values[indicator_id] = None
        else:
            for indicator_id in requested:
                if candidate_values.get(indicator_id) is None:
                    record_audit(
                        jurisdiction=jurisdiction,
                        obligation_type=obligation_type,
                        key=indicator_id,
                        status=STATUS_EMPTY,
                    )
                elif indicator_id not in value_row_index or value_row_index[(jurisdiction, obligation_type, indicator_id)]["value"] != candidate_values[indicator_id]:
                    record_audit(
                        jurisdiction=jurisdiction,
                        obligation_type=obligation_type,
                        key=indicator_id,
                        status=STATUS_EMPTY,
                    )
                else:
                    record_audit(
                        jurisdiction=jurisdiction,
                        obligation_type=obligation_type,
                        key=indicator_id,
                        status=STATUS_SUCCESS,
                        raw_generated_value=candidate_values[indicator_id],
                        returned_value=candidate_values[indicator_id],
                    )

        for indicator_id in requested:
            run_simplified_eval(
                group="overview",
                jurisdiction=jurisdiction,
                obligation_type_id=obligation_type,
                key=indicator_id,
                candidate_value=candidate_values.get(indicator_id),
                active_text=active_text,
                task_prompt=self.overview_task_spec,
                obligation_addendum=obligation_addendum,
                mlflow_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="evaluation",
                    indicator=indicator_id,
                ),
            )
        return skip_obligation

    def _extract_deadline_group(
        self,
        *,
        source_id: Any,
        jurisdiction: str,
        obligation_type: str,
        requested: List[str],
        active_text: Optional[str],
        document_packet: str,
        obligation_addendum: str,
        output_values: List[Dict[str, Any]],
        value_row_index: Dict[Tuple[str, str, str], Dict[str, Any]],
        ml_ctx: Optional[dict],
        mlflow_enabled: bool,
        run_simplified_eval,
        record_audit,
    ) -> None:
        candidate_values = {indicator_id: None for indicator_id in requested}
        handled_indicators: set[str] = set()
        key_map = {
            "DeadlinePreparation": "deadline_preparation",
            "DeadlineFiling": "deadline_filing",
            "DeadlineExtension": "deadline_extension",
        }
        try:
            deadline_model = extract_deadline(
                client=self.client,
                sys_prompt=self.unified_extraction_sys,
                schema_cls=self.DeadlineRes,
                text=active_text,
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                requested=requested,
                document_packet=document_packet,
                task_spec_prompt=self.deadline_task_spec,
                obligation_addendum=obligation_addendum,
                retries=self.retries,
                mlflow_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="extraction",
                    indicator="Deadline",
                    requested=requested,
                ),
            )
            deadline_model = self._maybe_retry_schema_output(
                task_type="deadline",
                schema_cls=self.DeadlineRes,
                extracted_model=deadline_model,
                task_prompt=self.deadline_task_spec,
                active_text=active_text,
                ml_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="schema_retry",
                    indicator="Deadline",
                ),
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                mlflow_enabled=mlflow_enabled,
            )
            deadline_payload = deadline_model.model_dump(mode="json", exclude_none=True)
            for indicator_id in requested:
                field = key_map.get(indicator_id)
                if not field:
                    continue
                rule = deadline_payload.get(field)
                if not isinstance(rule, dict):
                    continue
                candidate_value = rule.get("value")
                note, refs = _refs_from_rule(rule)
                handled_indicators.add(indicator_id)
                candidate_values[indicator_id] = self._handle_generated_indicator_value(
                    source_id=source_id,
                    jurisdiction=jurisdiction,
                    obligation_type=obligation_type,
                    key=indicator_id,
                    candidate_value=candidate_value,
                    notes=note,
                    references=refs,
                    output_values=output_values,
                    value_row_index=value_row_index,
                    record_audit=record_audit,
                )
        except Exception as exc:
            if mlflow_enabled:
                mlflow.log_metric("deadline_extracted", 0)
                mlflow.set_tag("deadline_error", str(exc)[:1000])
            log.warning("Deadline extraction failed for %s/%s: %s", jurisdiction, obligation_type, exc)
            for indicator_id in requested:
                record_audit(
                    jurisdiction=jurisdiction,
                    obligation_type=obligation_type,
                    key=indicator_id,
                    status=STATUS_GENERATION_FAILED,
                    error_message=str(exc),
                    error_details=[str(exc)],
                )
                candidate_values[indicator_id] = None
        else:
            self._record_missing_requested_audits(
                requested=requested,
                handled=handled_indicators,
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                record_audit=record_audit,
            )

        for indicator_id in requested:
            run_simplified_eval(
                group="deadline",
                jurisdiction=jurisdiction,
                obligation_type_id=obligation_type,
                key=indicator_id,
                candidate_value=candidate_values.get(indicator_id),
                active_text=active_text,
                task_prompt=self.deadline_task_spec,
                obligation_addendum=obligation_addendum,
                mlflow_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="evaluation",
                    indicator=indicator_id,
                ),
            )

    def _extract_threshold_group(
        self,
        *,
        source_id: Any,
        jurisdiction: str,
        obligation_type: str,
        requested: List[str],
        active_text: Optional[str],
        document_packet: str,
        obligation_addendum: str,
        output_values: List[Dict[str, Any]],
        value_row_index: Dict[Tuple[str, str, str], Dict[str, Any]],
        ml_ctx: Optional[dict],
        mlflow_enabled: bool,
        run_simplified_eval,
        record_audit,
    ) -> None:
        candidate_values = {indicator_id: None for indicator_id in requested}
        handled_indicators: set[str] = set()
        threshold_key_map = self.threshold_field_map or {
            "ThresholdPreparation": "threshold_preparation",
            "ThresholdFiling": "threshold_filing",
            "Threshold": "threshold_preparation",
        }
        try:
            threshold_model = extract_threshold(
                client=self.client,
                sys_prompt=self.unified_extraction_sys,
                schema_cls=self.ThresholdCls,
                text=active_text,
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                requested=requested,
                document_packet=document_packet,
                task_spec_prompt=self.threshold_task_spec,
                obligation_addendum=obligation_addendum,
                retries=self.retries,
                mlflow_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="extraction",
                    indicator="Threshold",
                    requested=requested,
                ),
            )
            threshold_model = self._maybe_retry_schema_output(
                task_type="threshold",
                schema_cls=self.ThresholdCls,
                extracted_model=threshold_model,
                task_prompt=self.threshold_task_spec,
                active_text=active_text,
                ml_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="schema_retry",
                    indicator="Threshold",
                ),
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                mlflow_enabled=mlflow_enabled,
            )
            threshold_payload = threshold_model.model_dump(mode="json", exclude_none=True)
            for indicator_id in requested:
                field = threshold_key_map.get(indicator_id)
                if not field:
                    continue
                rule = threshold_payload.get(field) if isinstance(threshold_payload, dict) else None
                if not isinstance(rule, dict):
                    continue
                candidate_value = rule.get("value")
                note, refs = _refs_from_rule(rule)
                handled_indicators.add(indicator_id)
                candidate_values[indicator_id] = self._handle_generated_indicator_value(
                    source_id=source_id,
                    jurisdiction=jurisdiction,
                    obligation_type=obligation_type,
                    key=indicator_id,
                    candidate_value=candidate_value,
                    notes=note,
                    references=refs,
                    output_values=output_values,
                    value_row_index=value_row_index,
                    record_audit=record_audit,
                )
        except Exception as exc:
            if mlflow_enabled:
                mlflow.log_metric("threshold_extracted", 0)
                mlflow.set_tag("threshold_error", str(exc)[:1000])
            log.warning("Threshold extraction failed for %s/%s: %s", jurisdiction, obligation_type, exc)
            for indicator_id in requested:
                record_audit(
                    jurisdiction=jurisdiction,
                    obligation_type=obligation_type,
                    key=indicator_id,
                    status=STATUS_GENERATION_FAILED,
                    error_message=str(exc),
                    error_details=[str(exc)],
                )
                candidate_values[indicator_id] = None
        else:
            self._record_missing_requested_audits(
                requested=requested,
                handled=handled_indicators,
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                record_audit=record_audit,
            )

        for indicator_id in requested:
            run_simplified_eval(
                group="threshold",
                jurisdiction=jurisdiction,
                obligation_type_id=obligation_type,
                key=indicator_id,
                candidate_value=candidate_values.get(indicator_id),
                active_text=active_text,
                task_prompt=self.threshold_task_spec,
                obligation_addendum=obligation_addendum,
                mlflow_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="evaluation",
                    indicator=indicator_id,
                ),
            )

    def _extract_penalty_group(
        self,
        *,
        source_id: Any,
        jurisdiction: str,
        obligation_type: str,
        requested: List[str],
        active_text: Optional[str],
        document_packet: str,
        obligation_addendum: str,
        output_values: List[Dict[str, Any]],
        value_row_index: Dict[Tuple[str, str, str], Dict[str, Any]],
        ml_ctx: Optional[dict],
        mlflow_enabled: bool,
        run_simplified_eval,
        record_audit,
    ) -> None:
        candidate_value = None
        try:
            penalty_model = extract_penalty(
                client=self.client,
                sys_prompt=self.unified_extraction_sys,
                schema_cls=self.PenaltyCls,
                text=active_text,
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                requested=requested,
                retries=self.retries,
                document_packet=document_packet,
                task_spec_prompt=self.penalty_task_spec,
                obligation_addendum=obligation_addendum,
                mlflow_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="extraction",
                    indicator="Penalty",
                    requested=requested,
                ),
            )
            penalty_model = self._maybe_retry_schema_output(
                task_type="penalty",
                schema_cls=self.PenaltyCls,
                extracted_model=penalty_model,
                task_prompt=self.penalty_task_spec,
                active_text=active_text,
                ml_ctx=self._with_llm_trace_ctx(
                    ml_ctx,
                    phase="schema_retry",
                    indicator="Penalty",
                ),
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                mlflow_enabled=mlflow_enabled,
            )
            penalty_payload = penalty_model.model_dump(mode="json", exclude_none=True)
            if penalty_payload is not None:
                candidate_value = penalty_payload.get("value")
            if candidate_value is not None:
                note, refs = _refs_from_rule(penalty_payload)
                candidate_value = self._handle_generated_indicator_value(
                    source_id=source_id,
                    jurisdiction=jurisdiction,
                    obligation_type=obligation_type,
                    key="Penalty",
                    candidate_value=candidate_value,
                    notes=note,
                    references=refs,
                    output_values=output_values,
                    value_row_index=value_row_index,
                    record_audit=record_audit,
                )
            else:
                record_audit(
                    jurisdiction=jurisdiction,
                    obligation_type=obligation_type,
                    key="Penalty",
                    status=STATUS_EMPTY,
                )
        except Exception as exc:
            if mlflow_enabled:
                mlflow.log_metric("penalty_extracted", 0)
                mlflow.set_tag("penalty_error", str(exc)[:1000])
            message = str(exc)
            if "Failed to parse/validate structured output" in message:
                log.warning(
                    "Penalty extraction produced no structured data for %s/%s (likely no penalty information in text)",
                    jurisdiction,
                    obligation_type,
                )
            else:
                log.warning("Penalty extraction failed for %s/%s: %s", jurisdiction, obligation_type, exc)
            record_audit(
                jurisdiction=jurisdiction,
                obligation_type=obligation_type,
                key="Penalty",
                status=STATUS_GENERATION_FAILED,
                error_message=message,
                error_details=[message],
            )

        run_simplified_eval(
            group="penalty",
            jurisdiction=jurisdiction,
            obligation_type_id=obligation_type,
            key="Penalty",
            candidate_value=candidate_value,
            active_text=active_text,
            task_prompt=self.penalty_task_spec,
            obligation_addendum=obligation_addendum,
            mlflow_ctx=self._with_llm_trace_ctx(
                ml_ctx,
                phase="evaluation",
                indicator="Penalty",
            ),
        )

    def process_request(
        self,
        req: Dict[str, Any],
        *,
        request_name: Optional[str] = None,
        persist: bool = True,
        mlflow_enabled: bool = False,
        input_artifact_path: Optional[Path] = None,
        epoch: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Process a single request payload.

        Parameters
        ----------
        req: incoming request dictionary matching the on-disk schema.
        request_name: optional stem used for persisted artefacts.
        persist: when True, writes JSON/JSONL files under processed_dir.
        mlflow_enabled: toggles MLflow logging/wrapping.
        input_artifact_path: optional path to the original request for MLflow logging.
        epoch: optional epoch used for run naming/logging.
        """
        request = self._normalize_request(
            req,
            request_name=request_name,
            epoch=epoch,
        )

        eval_rows: List[Dict[str, Any]] = []
        audit_rows: List[Dict[str, Any]] = []
        eval_json_path: Optional[Path] = None
        audit_json_path: Optional[Path] = None
        if self.eval_enabled and persist:
            eval_json_path = Path(self.processed) / f"{request.request_name}.eval.json"
        if persist:
            audit_json_path = Path(self.processed) / f"{request.request_name}.audit.json"

        mlflow_ctx = mlflow.start_run(run_name=request.request_name) if mlflow_enabled else nullcontext()

        with mlflow_ctx:
            if mlflow_enabled:
                mlflow.set_tags(
                    {
                        "level": "source",
                        "source_id": request.source_id,
                        "epoch_group": request.epoch,
                        "pipeline": self.pipe["name"],
                        "model": self.model_cfg.model,
                        "provider": "openai_compat",
                        "schema_overview_hash": self.schema_hash_overview,
                        "schema_deadline_hash": self.schema_hash_deadline,
                        "schema_threshold_hash": self.schema_hash_threshold,
                        "schema_penalty_hash": self.schema_hash_penalty,
                    }
                )
                mlflow.log_params(
                    {
                        "temperature": self.model_cfg.temperature,
                        "max_output_tokens": self.model_cfg.max_output_tokens,
                        "retries": self.retries,
                    }
                )
                if input_artifact_path:
                    mlflow.log_artifact(str(input_artifact_path), artifact_path="inputs")
                mlflow.log_text(request.text[:2000], artifact_file="inputs/extracted_text_head.txt")

            def record_eval(row: Dict[str, Any]) -> None:
                eval_rows.append(row)

            def attach_eval(row: Dict[str, Any]) -> None:
                if not self.eval_attach_to_values:
                    return
                key = (
                    row.get("jurisdiction"),
                    row.get("obligation_type_id"),
                    row.get("key"),
                )
                target = value_row_index.get(key)
                if target is not None:
                    target["llm_judge"] = row

            def record_audit(
                *,
                jurisdiction: str,
                obligation_type: str,
                key: str,
                status: str,
                error_message: str = "",
                error_details: Optional[List[str]] = None,
                raw_generated_value: Any = None,
                raw_generated_notes: str = "",
                raw_generated_references: str = "",
                returned_value: Any = None,
                returned_to_downstream: bool = False,
            ) -> None:
                row = {
                    "source_id": request.source_id,
                    "jurisdiction": jurisdiction,
                    "obligation_type_id": obligation_type,
                    "key": key,
                    "status": status,
                    "error": error_message,
                    "error_details": list(error_details or []),
                    "raw_generated_value": raw_generated_value,
                    "raw_generated_notes": raw_generated_notes,
                    "raw_generated_references": raw_generated_references,
                    "returned_value": returned_value,
                    "returned_to_downstream": returned_to_downstream,
                }
                audit_rows.append(row)

            def resolve_eval_source_text(active_text: Optional[str]) -> str:
                mode = self.eval_source_text_mode or "active"
                if mode == "full":
                    return request.text or active_text or ""
                return active_text or request.text or ""

            def run_simplified_eval(
                *,
                group: str,
                jurisdiction: str,
                obligation_type_id: str,
                key: str,
                candidate_value: Any,
                active_text: Optional[str],
                task_prompt: str,
                obligation_addendum: str,
                mlflow_ctx: Optional[dict],
            ) -> None:
                if not self.simplified_eval_judge:
                    return

                eval_text = resolve_eval_source_text(active_text)
                if not eval_text:
                    eval_row = {
                        "source_id": request.source_id,
                        "jurisdiction": jurisdiction,
                        "obligation_type_id": obligation_type_id,
                        "key": key,
                        "evaluation_type": "simplified",
                        "evaluation_group": group,
                        "candidate_value": candidate_value,
                        "llm_evaluation_score": None,
                        "llm_evaluation_reasoning": "",
                        "error": "Missing source_text for simplified evaluation",
                    }
                    record_eval(eval_row)
                    attach_eval(eval_row)
                    return

                extraction_context = self._build_extraction_context(
                    task_prompt=task_prompt,
                    obligation_addendum=obligation_addendum,
                )

                try:
                    judged = self.simplified_eval_judge.evaluate(
                        group=group,
                        jurisdiction=jurisdiction,
                        obligation_type_id=obligation_type_id,
                        indicator_key=key,
                        indicator_value=candidate_value,
                        source_text=eval_text,
                        extraction_prompt_context=extraction_context,
                        obligation_addendum=obligation_addendum,
                        mlflow_ctx=mlflow_ctx,
                    )
                    payload = judged.model_dump(mode="json")
                    score = payload.get("score")
                    comment = payload.get("comment") or ""
                    eval_row = {
                        "source_id": request.source_id,
                        "jurisdiction": jurisdiction,
                        "obligation_type_id": obligation_type_id,
                        "key": key,
                        "evaluation_type": "simplified",
                        "evaluation_group": group,
                        "candidate_value": candidate_value,
                        "llm_evaluation_score": score,
                        "llm_evaluation_reasoning": comment,
                        "score_0_100": score,
                        "error": "",
                    }
                    record_eval(eval_row)
                    attach_eval(eval_row)
                except Exception as exc:
                    err_msg = f"{type(exc).__name__}: {exc}"
                    log.warning(
                        "Simplified evaluation failed for %s/%s/%s: %s",
                        jurisdiction,
                        obligation_type_id,
                        key,
                        err_msg,
                    )
                    eval_row = {
                        "source_id": request.source_id,
                        "jurisdiction": jurisdiction,
                        "obligation_type_id": obligation_type_id,
                        "key": key,
                        "evaluation_type": "simplified",
                        "evaluation_group": group,
                        "candidate_value": candidate_value,
                        "llm_evaluation_score": None,
                        "llm_evaluation_reasoning": "",
                        "error": err_msg,
                    }
                    record_eval(eval_row)
                    attach_eval(eval_row)

            pair_context_cache: Dict[Tuple[str, str], Optional[str]] = {}
            document_packet_cache: Dict[Tuple[str, str], str] = {}
            obligation_addendum_cache: Dict[str, str] = {}
            chunk_manager, chunk_context_active = self._prepare_chunk_manager(
                request,
                mlflow_enabled=mlflow_enabled,
            )

            grouped_indicators = _split_indicator_groups(request.indicators, self.app.indicator_groups)
            output = {"source_metadata": [{"source_id": request.source_id}], "values": []}
            value_row_index: Dict[Tuple[str, str, str], Dict[str, Any]] = {}

            for jurisdiction in request.jurisdictions:
                jur_ctx = (
                    mlflow.start_run(run_name=f"{request.request_name}-{jurisdiction}", nested=True)
                    if mlflow_enabled
                    else nullcontext()
                )
                with jur_ctx:
                    if mlflow_enabled:
                        mlflow.set_tags(
                            {
                                "level": "jurisdiction",
                                "jurisdiction": jurisdiction,
                                "source_id": request.source_id,
                                "epoch_group": request.epoch,
                            }
                        )
                    if chunk_context_active and chunk_manager and not chunk_manager.has_jurisdiction(jurisdiction):
                        log.info("Skipping jurisdiction %s: not present in any labeled chunk", jurisdiction)
                        continue
                    for obligation_type in request.obligations:
                        obl_ctx = (
                            mlflow.start_run(
                                run_name=f"{request.request_name}-{jurisdiction}-{obligation_type}",
                                nested=True,
                            )
                            if mlflow_enabled
                            else nullcontext()
                        )
                        with obl_ctx:
                            if mlflow_enabled:
                                mlflow.set_tags(
                                    {
                                        "level": "obligation",
                                        "jurisdiction": jurisdiction,
                                        "obligation_type": obligation_type,
                                        "source_id": request.source_id,
                                        "epoch_group": request.epoch,
                                    }
                                )
                            ml_ctx = {
                                "source_id": request.source_id,
                                "epoch": request.epoch,
                                "jurisdiction": jurisdiction,
                                "obligation_type": obligation_type,
                                "chunked": chunk_context_active,
                            }
                            cache_key = (jurisdiction, obligation_type)
                            active_text = pair_context_cache.get(cache_key)
                            if cache_key not in pair_context_cache:
                                if chunk_context_active and chunk_manager:
                                    active_text = chunk_manager.context_for(
                                        jurisdiction=jurisdiction,
                                        obligation_type=obligation_type,
                                        top_n=self.chunk_retrieval_top_n,
                                    )
                                else:
                                    active_text = request.text
                                pair_context_cache[cache_key] = active_text

                            if chunk_context_active and active_text is None:
                                log.info("Skipping %s/%s: no relevant chunks retrieved", jurisdiction, obligation_type)
                                continue

                            document_packet = document_packet_cache.get(cache_key)
                            if document_packet is None:
                                document_packet = build_document_packet(
                                    source_id=request.source_id,
                                    source_name=request.source_name,
                                    organization=request.organization,
                                    organization_type_id=request.organization_type_id,
                                    jurisdiction_iso2=jurisdiction,
                                    jurisdiction=self._resolve_jurisdiction_name(
                                        request.jurisdiction_names,
                                        jurisdiction,
                                    ),
                                    source_text=active_text or "",
                                )
                                document_packet_cache[cache_key] = document_packet

                            obligation_addendum = obligation_addendum_cache.get(obligation_type)
                            if obligation_addendum is None:
                                obligation_addendum = load_obligation_addendum(
                                    self.obligation_addendum_dir,
                                    obligation_type,
                                )
                                obligation_addendum_cache[obligation_type] = obligation_addendum

                            requested_overview = grouped_indicators.get("overview") or []
                            requested_deadline = grouped_indicators.get("deadline") or []
                            requested_threshold = grouped_indicators.get("threshold") or []
                            requested_penalty = grouped_indicators.get("penalty") or []

                            if requested_overview:
                                skip_obligation = self._extract_overview_group(
                                    source_id=request.source_id,
                                    jurisdiction=jurisdiction,
                                    obligation_type=obligation_type,
                                    requested=requested_overview,
                                    active_text=active_text,
                                    document_packet=document_packet,
                                    obligation_addendum=obligation_addendum,
                                    output_values=output["values"],
                                    value_row_index=value_row_index,
                                    ml_ctx=ml_ctx,
                                    mlflow_enabled=mlflow_enabled,
                                    run_simplified_eval=run_simplified_eval,
                                    record_audit=record_audit,
                                )
                                if skip_obligation:
                                    for indicator_id in requested_deadline + requested_threshold + requested_penalty:
                                        record_audit(
                                            jurisdiction=jurisdiction,
                                            obligation_type=obligation_type,
                                            key=indicator_id,
                                            status=STATUS_EMPTY,
                                        )
                                    continue

                            if requested_deadline:
                                self._extract_deadline_group(
                                    source_id=request.source_id,
                                    jurisdiction=jurisdiction,
                                    obligation_type=obligation_type,
                                    requested=requested_deadline,
                                    active_text=active_text,
                                    document_packet=document_packet,
                                    obligation_addendum=obligation_addendum,
                                    output_values=output["values"],
                                    value_row_index=value_row_index,
                                    ml_ctx=ml_ctx,
                                    mlflow_enabled=mlflow_enabled,
                                    run_simplified_eval=run_simplified_eval,
                                    record_audit=record_audit,
                                )

                            if requested_threshold:
                                self._extract_threshold_group(
                                    source_id=request.source_id,
                                    jurisdiction=jurisdiction,
                                    obligation_type=obligation_type,
                                    requested=requested_threshold,
                                    active_text=active_text,
                                    document_packet=document_packet,
                                    obligation_addendum=obligation_addendum,
                                    output_values=output["values"],
                                    value_row_index=value_row_index,
                                    ml_ctx=ml_ctx,
                                    mlflow_enabled=mlflow_enabled,
                                    run_simplified_eval=run_simplified_eval,
                                    record_audit=record_audit,
                                )

                            if requested_penalty:
                                self._extract_penalty_group(
                                    source_id=request.source_id,
                                    jurisdiction=jurisdiction,
                                    obligation_type=obligation_type,
                                    requested=requested_penalty,
                                    active_text=active_text,
                                    document_packet=document_packet,
                                    obligation_addendum=obligation_addendum,
                                    output_values=output["values"],
                                    value_row_index=value_row_index,
                                    ml_ctx=ml_ctx,
                                    mlflow_enabled=mlflow_enabled,
                                    run_simplified_eval=run_simplified_eval,
                                    record_audit=record_audit,
                                )

        if self.eval_enabled:
            output["evaluations"] = eval_rows

        status_summary: Dict[str, int] = {}
        for row in audit_rows:
            status = str(row.get("status") or "")
            status_summary[status] = status_summary.get(status, 0) + 1

        output["generation_audit"] = audit_rows
        output["generation_status_summary"] = status_summary
        self._enrich_value_rows(output["values"], eval_rows)

        if persist:
            json_path = Path(self.processed) / f"{request.request_name}.json"
            json_path.parent.mkdir(parents=True, exist_ok=True)
            write_json(json_path, output)
            if mlflow_enabled:
                mlflow.log_artifact(str(json_path), artifact_path="outputs")
            log.info(f"✓ Wrote {json_path}")
            if self.eval_enabled and eval_json_path:
                write_json(eval_json_path, {"evaluations": eval_rows})
                if mlflow_enabled:
                    mlflow.log_artifact(str(eval_json_path), artifact_path="outputs")
            if audit_json_path:
                write_json(
                    audit_json_path,
                    {
                        "generation_audit": audit_rows,
                        "generation_status_summary": status_summary,
                    },
                )
                if mlflow_enabled:
                    mlflow.log_artifact(str(audit_json_path), artifact_path="outputs")

        return {"values": output.get("values", [])}

    def run(self) -> None:
        mlflow_enabled = self.mlflow_enabled_default
        if mlflow_enabled:
            mlflow.set_tracking_uri(self.app.mlflow_uri)
            mlflow.set_experiment(self.app.mlflow_experiment)

            try:
                scheme = (mlflow.get_tracking_uri() or "").split(":", 1)[0]
            except Exception:
                scheme = ""
            if scheme in {"http", "https"}:
                mlflow.autolog()
            else:
                log.info("MLflow autolog disabled for non-HTTP tracking URI: %s", mlflow.get_tracking_uri())
        else:
            log.info(
                "MLflow tracking disabled by configuration. "
                "Set pipeline.mlflow.enabled=true or OTC_ENABLE_MLFLOW=true to enable."
            )

        for req_path in iter_requests(self.incoming):
            req = load_request(req_path)
            self.process_request(
                req,
                request_name=req_path.stem,
                persist=True,
                mlflow_enabled=mlflow_enabled,
                input_artifact_path=req_path,
            )
