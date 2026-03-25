from typing import Type

from pydantic import BaseModel

from otc.registry.prompt_loader import (
    THRESHOLD_USER_TEMPLATE,
    build_task_packet,
    format_obligation_explanation_block,
)
from otc.llm.structured import ask_for_model

__all__ = ["build_threshold_user_prompt", "extract_threshold"]


def build_threshold_user_prompt(
    schema_cls: type[BaseModel],
    text: str,
    jurisdiction: str,
    obligation_type: str,
    requested: list[str],
) -> str:
    # schema_cls and text kept for backwards compatibility with older call sites.
    _ = schema_cls
    _ = text
    return THRESHOLD_USER_TEMPLATE.format(
        requested_indicators=", ".join(requested) if requested else "",
        jurisdiction=jurisdiction,
        obligation_type=obligation_type,
        obligation_explanation_block=format_obligation_explanation_block(obligation_type),
    ).strip()


def extract_threshold(
    client,
    sys_prompt: str,
    schema_cls: Type[BaseModel],
    text: str,
    jurisdiction: str,
    obligation_type: str,
    requested: list[str],
    document_packet: str | None = None,
    task_spec_prompt: str = "",
    obligation_addendum: str = "",
    mlflow_ctx: dict | None = None,
    retries: int = 3,
) -> BaseModel:
    task_context = build_threshold_user_prompt(
        schema_cls,
        text,
        jurisdiction,
        obligation_type,
        requested,
    )
    task_packet = build_task_packet(
        task_type="THRESHOLD",
        jurisdiction=jurisdiction,
        obligation_type_id=obligation_type,
        task_context=task_context,
        task_spec_instructions=task_spec_prompt,
        obligation_addendum=obligation_addendum,
    )

    user_prompt = document_packet or task_packet
    extra_user_prompts = [task_packet] if document_packet else None

    return ask_for_model(
        client,
        sys_prompt,
        user_prompt,
        schema_cls,
        retries=retries,
        mlflow_ctx=mlflow_ctx,
        extra_user_prompts=extra_user_prompts,
    )
