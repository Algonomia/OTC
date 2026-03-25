import contextlib
import json
import logging
import time
from functools import wraps
from typing import Optional, Type
from urllib.parse import urlparse

import mlflow
import orjson
from pydantic import BaseModel

from otc.logging import setup_logger
from .client import OpenAICompatClient, ChatMessage

logger = setup_logger("otc.llm.structured")

# Backward-compatible mlflow.trace decorator (no-op when unavailable)
if hasattr(mlflow, "trace") and callable(getattr(mlflow, "trace")):
    def _mlflow_trace(*args, **kwargs):  # type: ignore
        traced_decorator = mlflow.trace(*args, **kwargs)

        def _decorator(fn):
            traced_fn = traced_decorator(fn)

            @wraps(fn)
            def _wrapped(*f_args, **f_kwargs):
                # Avoid any MLflow trace backend calls unless a run is already active.
                if not _mlflow_active():
                    return fn(*f_args, **f_kwargs)
                return traced_fn(*f_args, **f_kwargs)

            return _wrapped

        return _decorator
else:
    def _mlflow_trace(*args, **kwargs):  # type: ignore
        def _decorator(fn):
            return fn
        return _decorator


def _mlflow_active() -> bool:
    try:
        return mlflow.active_run() is not None
    except Exception:
        return False


def _mlflow_http_backend() -> bool:
    try:
        uri = mlflow.get_tracking_uri()
    except Exception:
        return False
    if not uri:
        return False
    scheme = urlparse(uri).scheme or ""
    return scheme in {"http", "https"}


def _safe_log_metric(name: str, value: float) -> None:
    if not _mlflow_active():
        return
    try:
        mlflow.log_metric(name, value)
    except Exception:
        pass


def _safe_set_tags(tags: dict) -> None:
    if not _mlflow_active():
        return
    try:
        mlflow.set_tags(tags)
    except Exception:
        pass


def _log_prompt_artifacts(
    run_ctx: dict,
    attempt: int,
    system_prompt: str,
    user_prompts: list[str],
    raw_response: str,
) -> None:
    """Persist full prompts/responses as artifacts under the active MLflow run for traceability."""
    if not _mlflow_active():
        return
    try:
        run_id = mlflow.active_run().info.run_id  # type: ignore[union-attr]
    except Exception:
        return
    if not run_id:
        return
    try:
        prefix = f"traces/{run_ctx.get('jurisdiction','na')}-{run_ctx.get('obligation_type','na')}-attempt{attempt}"
        mlflow.log_text(system_prompt, artifact_file=f"{prefix}-system.txt")
        merged_user = "\n\n--- NEXT USER MESSAGE ---\n\n".join(user_prompts)
        mlflow.log_text(merged_user, artifact_file=f"{prefix}-user.txt")
        for idx, prompt in enumerate(user_prompts, start=1):
            mlflow.log_text(prompt, artifact_file=f"{prefix}-user-{idx}.txt")
        mlflow.log_text(raw_response, artifact_file=f"{prefix}-response.txt")
    except Exception:
        pass


@_mlflow_trace(name="ask_for_model")
def ask_for_model(
    client: OpenAICompatClient,
    system_prompt: str,
    user_prompt: str,
    schema_cls: Type[BaseModel],
    retries: int = 3,
    mlflow_ctx: Optional[dict] = None,          # {source_id, epoch, jurisdiction, obligation_type}
    enable_attempt_runs: bool = True,
    extra_user_prompts: Optional[list[str]] = None,
) -> BaseModel:
    user_prompts = [user_prompt]
    if extra_user_prompts:
        user_prompts.extend(p for p in extra_user_prompts if p)

    messages = [
        ChatMessage(role="system", content=system_prompt),
    ]
    messages.extend(ChatMessage(role="user", content=p) for p in user_prompts)

    ctx = mlflow_ctx or {}
    src = ctx.get("source_id", "na")
    epoch = ctx.get("epoch", "na")
    jur = ctx.get("jurisdiction", "na")
    obl = ctx.get("obligation_type", "na")
    indicator = ctx.get("indicator", "na")
    phase = ctx.get("phase", "llm")
    requested = ctx.get("requested_indicators", "")

    def _start_attempt_run(attempt_idx: int):
        if not enable_attempt_runs or not mlflow_ctx or not _mlflow_active() or not _mlflow_http_backend():
            return contextlib.nullcontext()
        run_name = f"{src}-{epoch}-{jur}-{obl}-{attempt_idx}"
        return mlflow.start_run(run_name=run_name, nested=True)
    last_err = None
    total_attempts = retries + 1

    for attempt in range(total_attempts):
        logger.info(
            "%s attempt %d/%d | jurisdiction=%s obligation=%s indicator=%s requested=%s",
            phase,
            attempt + 1,
            total_attempts,
            jur,
            obl,
            indicator,
            requested or "-",
        )
        with _start_attempt_run(attempt):
            attempt_start = time.time()
            _safe_set_tags({
                "attempt_index": attempt,
                "attempt_start_ts": attempt_start,
                "jurisdiction": jur,
                "obligation_type": obl,
                "source_id": src,
                "epoch_group": epoch,
                "schema_name": schema_cls.__name__,
            })
            success = False
            path_used = None
            try:
                if client.use_instructor:
                    path_used = "instructor"
                    model_inst = client.chat_structured(messages, response_model=schema_cls)
                    success = True
                    _safe_set_tags({"path_used": path_used})
                    _safe_log_metric("attempt_success", 1.0)
                    _log_prompt_artifacts(
                        ctx,
                        attempt,
                        system_prompt,
                        user_prompts,
                            model_inst.model_dump_json() if hasattr(model_inst, "model_dump_json") else "",
                        )
                    logger.info(
                        "%s success | jurisdiction=%s obligation=%s indicator=%s attempt=%d/%d path=%s",
                        phase,
                        jur,
                        obl,
                        indicator,
                        attempt + 1,
                        total_attempts,
                        path_used,
                    )
                    return model_inst
                path_used = "json_direct"
                raw = client.chat(messages, force_raw=True)
                data = json.loads(raw)
                if data is None:
                    data = {}
                model_inst = schema_cls.model_validate(data)
                success = True
                _safe_set_tags({"path_used": path_used})
                _safe_log_metric("attempt_success", 1.0)
                _log_prompt_artifacts(ctx, attempt, system_prompt, user_prompts, raw)
                logger.info(
                    "%s success | jurisdiction=%s obligation=%s indicator=%s attempt=%d/%d path=%s",
                    phase,
                    jur,
                    obl,
                    indicator,
                    attempt + 1,
                    total_attempts,
                    path_used,
                )
                return model_inst
            except Exception as e:
                if path_used == "instructor":
                    fb_raw: Optional[str] = None
                    try:
                        fb_raw = client.chat(messages, force_raw=True)
                        try:
                            data = json.loads(fb_raw)
                        except json.JSONDecodeError:
                            data = orjson.loads(fb_raw)
                        if data is None:
                            data = {}
                        model_inst = schema_cls.model_validate(data)
                        success = True
                        _safe_set_tags({"path_used": "fallback_json"})
                        _safe_log_metric("attempt_success", 1.0)
                        _log_prompt_artifacts(
                            ctx,
                            attempt,
                            system_prompt,
                            user_prompts,
                            fb_raw if isinstance(fb_raw, str) else "",
                        )
                        logger.info(
                            "%s success | jurisdiction=%s obligation=%s indicator=%s attempt=%d/%d path=%s",
                            phase,
                            jur,
                            obl,
                            indicator,
                            attempt + 1,
                            total_attempts,
                            "fallback_json",
                        )
                        return model_inst
                    except Exception as e2:
                        snippet = fb_raw[:500] if isinstance(fb_raw, str) else ""
                        if snippet:
                            logger.warning(
                                "Structured fallback JSON parse failed: %s | snippet=%s",
                                type(e2).__name__,
                                snippet.replace("\n", " ")[:250],
                            )
                        last_err = e2
                else:
                    last_err = e
                logger.warning(
                    "%s failed | jurisdiction=%s obligation=%s indicator=%s attempt=%d/%d error=%s",
                    phase,
                    jur,
                    obl,
                    indicator,
                    attempt + 1,
                    total_attempts,
                    type(last_err).__name__ if last_err else type(e).__name__,
                )
            finally:
                if not success:
                    _safe_log_metric("attempt_success", 0.0)
                    if last_err:
                        _safe_set_tags({
                            "attempt_error_type": type(last_err).__name__,
                            "attempt_error_msg": str(last_err)[:500],
                        })

    raise ValueError(f"Failed to parse/validate structured output after {total_attempts} attempts: {last_err}")
