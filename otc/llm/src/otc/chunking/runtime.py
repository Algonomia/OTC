from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

from otc.llm.client import OpenAICompatClient
from otc.registry.prompt_loader import load_system_prompt

from .candidates import render_chunk_labeler_system_prompt
from .manager import ChunkingSettings
from .store import ChunkMetadataStore

_DEFAULT_CHUNK_SIZE_RATIO = 0.08
_DEFAULT_OVERLAP_TOKENS = 250
_DEFAULT_RETRIEVAL_TOP_N = 8
_DEFAULT_RETRIEVAL_MAX_CONTEXT_RATIO = 0.5
_DEFAULT_LABEL_MAX_RETRIES = 3
_DEFAULT_LABEL_RETRY_BACKOFF_SECONDS = 0.5
_DEFAULT_RETRIEVAL_SIMILARITY_WEIGHT = 0.25
_DEFAULT_STORE_SUBDIR = "chunk_metadata"


@dataclass(frozen=True)
class ChunkingRuntime:
    settings: ChunkingSettings
    store: ChunkMetadataStore
    labeling_client: Optional[OpenAICompatClient]
    labeling_prompt: str

    @property
    def enabled(self) -> bool:
        return self.settings.context_window > 0 and self.labeling_client is not None

    @property
    def retrieval_top_n(self) -> int:
        return self.settings.retrieval_top_n


def build_chunk_settings(chunk_cfg: dict, model_cfg: Any) -> ChunkingSettings:
    chunk_cfg = chunk_cfg or {}
    tokenizer_name = (
        chunk_cfg.get("tokenizer_name")
        or getattr(model_cfg, "tokenizer_name", None)
        or model_cfg.model
    )
    raw_chunk_size = chunk_cfg.get("chunk_size_tokens")
    chunk_size_tokens = int(raw_chunk_size) if raw_chunk_size else None
    return ChunkingSettings(
        context_window=int(chunk_cfg.get("context_window", 0) or 0),
        chunk_size_tokens=chunk_size_tokens,
        chunk_size_ratio=float(chunk_cfg.get("chunk_size_ratio", _DEFAULT_CHUNK_SIZE_RATIO)),
        overlap_tokens=int(chunk_cfg.get("overlap_tokens", _DEFAULT_OVERLAP_TOKENS)),
        trigger_ratio=float(chunk_cfg.get("trigger_ratio", 0.5)),
        retrieval_top_n=int(chunk_cfg.get("retrieval_top_n", _DEFAULT_RETRIEVAL_TOP_N)),
        retrieval_max_context_ratio=float(
            chunk_cfg.get("retrieval_max_context_ratio", _DEFAULT_RETRIEVAL_MAX_CONTEXT_RATIO)
        ),
        tokenizer_name=tokenizer_name,
        token_count_model=chunk_cfg.get("token_count_model") or tokenizer_name,
        label_max_retries=int(chunk_cfg.get("label_max_retries", _DEFAULT_LABEL_MAX_RETRIES)),
        label_retry_backoff_seconds=float(
            chunk_cfg.get("label_retry_backoff_seconds", _DEFAULT_LABEL_RETRY_BACKOFF_SECONDS)
        ),
        retrieval_similarity_weight=float(
            chunk_cfg.get("retrieval_similarity_weight", _DEFAULT_RETRIEVAL_SIMILARITY_WEIGHT)
        ),
    )


def _resolve_labeling_model_config(
    chunk_cfg: dict,
    model_cfg: Any,
    *,
    default_model_key: Optional[str] = None,
) -> Any:
    labeling_model_key = str(chunk_cfg.get("labeling_model_key") or "").strip()
    labeling_cfg = model_cfg

    if not labeling_model_key:
        return labeling_cfg

    if default_model_key and labeling_model_key == str(default_model_key):
        return labeling_cfg

    from otc.config import load_model_config

    try:
        return load_model_config(labeling_model_key)
    except KeyError:
        # Backward compatibility: allow a direct model-id value.
        if labeling_model_key != str(getattr(model_cfg, "model", "")):
            raise
        return labeling_cfg


def build_label_client(
    chunk_cfg: dict,
    model_cfg: Any,
    *,
    default_model_key: Optional[str] = None,
) -> OpenAICompatClient:
    chunk_cfg = chunk_cfg or {}
    labeling_cfg = _resolve_labeling_model_config(
        chunk_cfg,
        model_cfg,
        default_model_key=default_model_key,
    )
    return OpenAICompatClient(
        provider=labeling_cfg.provider,
        model=labeling_cfg.model,
        base_url_env_name=chunk_cfg.get("labeling_base_url_env") or labeling_cfg.base_url_env_name,
        api_key_env_name=chunk_cfg.get("labeling_api_key_env") or labeling_cfg.api_key_env_name,
        temperature=labeling_cfg.temperature,
        max_output_tokens=labeling_cfg.max_output_tokens,
        json_mode=labeling_cfg.json_mode,
        use_instructor=bool(getattr(labeling_cfg, "use_instructor", False)),
        instructor_max_retries=int(getattr(labeling_cfg, "instructor_max_retries", 3)),
        instructor_mode=str(getattr(labeling_cfg, "instructor_mode", "JSON")),
    )


def resolve_chunk_prompt(chunk_prompt_path: Optional[str]) -> str:
    default_path = Path(__file__).resolve().parents[3] / "prompts" / "labeling" / "sys_prompt_chunk_labeler.txt"
    prompt_source = chunk_prompt_path or (str(default_path) if default_path.exists() else None)
    if prompt_source:
        return render_chunk_labeler_system_prompt(load_system_prompt(prompt_source))
    return render_chunk_labeler_system_prompt(
        "You label compliance text. Return JSON with a 'labels' array."
    )


def build_chunk_store(base_dir: Path, store_subdir: str) -> ChunkMetadataStore:
    return ChunkMetadataStore(base_dir / store_subdir)


def build_chunk_runtime(
    *,
    chunk_cfg: dict,
    model_cfg: Any,
    processed_dir: str | Path,
    chunk_prompt_path: Optional[str],
    default_model_key: Optional[str] = None,
) -> ChunkingRuntime:
    settings = build_chunk_settings(chunk_cfg, model_cfg)
    store_subdir = str((chunk_cfg or {}).get("store_subdir") or _DEFAULT_STORE_SUBDIR)
    store = build_chunk_store(Path(processed_dir), store_subdir)
    labeling_client = None
    if settings.context_window > 0:
        labeling_client = build_label_client(
            chunk_cfg,
            model_cfg,
            default_model_key=default_model_key,
        )
    return ChunkingRuntime(
        settings=settings,
        store=store,
        labeling_client=labeling_client,
        labeling_prompt=resolve_chunk_prompt(chunk_prompt_path),
    )


__all__ = [
    "ChunkingRuntime",
    "build_chunk_settings",
    "build_label_client",
    "resolve_chunk_prompt",
    "build_chunk_store",
    "build_chunk_runtime",
]
