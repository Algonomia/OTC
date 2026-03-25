import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import yaml
from dotenv import load_dotenv

load_dotenv()

_MODULE_PATH = Path(__file__).resolve()
_DEFAULT_PROJECT_ROOT = _MODULE_PATH.parents[2]


def _detect_project_root() -> Path:
    """Return the repository root that carries the configs/ directory."""
    candidates = [
        _DEFAULT_PROJECT_ROOT,
        Path.cwd(),
        *_MODULE_PATH.parents,
    ]

    seen: set[Path] = set()
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        if (resolved / "configs" / "app.yaml").exists():
            return resolved
    return _DEFAULT_PROJECT_ROOT


PROJECT_ROOT = _detect_project_root()
CONFIG_ROOT = PROJECT_ROOT / "configs"


def read_yaml(p: str | Path) -> dict:
    path = Path(p)
    if not path.is_absolute():
        path = (PROJECT_ROOT / path).resolve()
    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def _resolve_project_path(raw: str | Path) -> Path:
    """Resolve repository-relative paths and strip duplicate project segments."""
    path = Path(raw)
    if path.is_absolute():
        return path

    parts = tuple(part for part in path.parts if part not in (".", ""))
    prefixes = (
        (PROJECT_ROOT.name,),
        ("otc", "llm"),
    )
    for prefix in prefixes:
        if parts[: len(prefix)] == prefix:
            parts = parts[len(prefix):]
            break
    normalized = Path(*parts) if parts else Path()
    return (PROJECT_ROOT / normalized).resolve()


_BOOL_TRUE = {"1", "true", "t", "yes", "y", "on"}
_BOOL_FALSE = {"0", "false", "f", "no", "n", "off"}


def _parse_bool(value: Optional[str]) -> Optional[bool]:
    if value is None:
        return None
    normalized = value.strip().lower()
    if normalized in _BOOL_TRUE:
        return True
    if normalized in _BOOL_FALSE:
        return False
    return None

@dataclass
class AppConfig:
    incoming_dir: Path
    processed_dir: Path
    mlflow_uri: str
    mlflow_experiment: str
    prompts: dict
    schemas: dict
    indicator_groups: dict
    deadline_field_map: dict
    threshold_field_map: dict
    overview_field_map: dict

@dataclass
class ModelConfig:
    provider: str
    model: str
    model_env_name: Optional[str]
    base_url_env_name: str
    api_key_env_name: str
    temperature: Optional[float] = None
    max_output_tokens: Optional[int] = None
    json_mode: bool = False
    use_instructor: bool = True
    instructor_max_retries: int = 3
    instructor_mode: str = "JSON"
    tokenizer_name: Optional[str] = None

def load_app_config() -> AppConfig:
    app = read_yaml(CONFIG_ROOT / "app.yaml")
    data = app["data"]
    trk = app["tracking"]
    return AppConfig(
        incoming_dir=_resolve_project_path(data["incoming_dir"]),
        processed_dir=_resolve_project_path(data["processed_dir"]),
        mlflow_uri=os.getenv(trk["uri_env"], "file:./mlruns"),
        mlflow_experiment=os.getenv(trk["experiment_env"], "otc-poc"),
        prompts={k: str(_resolve_project_path(v)) for k, v in app["prompts"].items()},
        schemas=app["schemas"],
        indicator_groups=app["indicator_groups"],
        deadline_field_map=app["deadline_field_map"],
        threshold_field_map=app.get("threshold_field_map", {}),
        overview_field_map=app["overview_field_map"],
    )

def load_model_config(model_key: str) -> ModelConfig:
    m = read_yaml(CONFIG_ROOT / "models.yaml")["models"][model_key]
    model_env_name = m.get("model_env")
    env_model = os.getenv(model_env_name) if model_env_name else None
    resolved_model = env_model.strip() if env_model and env_model.strip() else m["model"]
    return ModelConfig(
        provider=m["provider"],
        model=resolved_model,
        model_env_name=model_env_name,
        base_url_env_name=m["base_url_env"],
        api_key_env_name=m["api_key_env"],
        temperature=m.get("temperature"),
        max_output_tokens=m.get("max_output_tokens"),
        json_mode=bool(m.get("json_mode", False)),
        use_instructor=bool(m.get("use_instructor", True)),
        instructor_max_retries=int(m.get("instructor_max_retries", 3)),
        instructor_mode=str(m.get("instructor_mode", "JSON")),
        tokenizer_name=m.get("tokenizer_name"),
    )

def load_pipeline_config() -> dict:
    pipeline = read_yaml(CONFIG_ROOT / "pipeline.yaml")["pipeline"]

    model_key_env = pipeline.get("model_key_env") or "OTC_MODEL_KEY"
    override_model_key = os.getenv(model_key_env)
    if override_model_key:
        pipeline["model_key"] = override_model_key

    chunk_cfg = pipeline.get("chunking") or {}
    labeling_key_env = chunk_cfg.get("labeling_model_key_env") or "OTC_LABELING_MODEL_KEY"
    override_label_key = os.getenv(labeling_key_env)
    if override_label_key:
        chunk_cfg["labeling_model_key"] = override_label_key
        pipeline["chunking"] = chunk_cfg

    mlflow_cfg = pipeline.get("mlflow") or {}
    mlflow_enabled_env = str(mlflow_cfg.get("enabled_env") or "OTC_ENABLE_MLFLOW")
    override_mlflow_enabled = _parse_bool(os.getenv(mlflow_enabled_env))
    if override_mlflow_enabled is not None:
        mlflow_cfg["enabled"] = override_mlflow_enabled
    if mlflow_cfg:
        pipeline["mlflow"] = mlflow_cfg

    return pipeline
