from __future__ import annotations

from pathlib import Path
from typing import Sequence

import requests
import pymupdf4llm

__all__ = ["load_text_from_sources"]


def _is_url(source: str) -> bool:
    return source.startswith(("http://", "https://"))


def _load_text_from_url(url: str, timeout: float) -> str:
    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise ValueError(f"Failed to fetch source text from '{url}': {exc}") from exc

    try:
        payload = response.json()
    except ValueError as exc:  # pragma: no cover - defensive
        raise ValueError(f"Expected JSON payload from '{url}', but parsing failed.") from exc

    text = payload.get("text")
    if not isinstance(text, str):
        raise ValueError(f"Response from '{url}' does not contain a 'text' field.")
    return text


def _load_text_from_path(path_str: str) -> str:
    path = Path(path_str).expanduser()
    if not path.exists():
        raise ValueError(f"File path '{path}' does not exist.")

    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return pymupdf4llm.to_markdown(str(path))
    if suffix == ".txt":
        return path.read_text(encoding="utf-8")

    raise ValueError(f"Unsupported file type for '{path}'. Expected .pdf or .txt.")


def load_text_from_sources(sources: Sequence[str], *, timeout: float = 30.0) -> str:
    """Load textual content from HTTP endpoints or local files."""
    texts: list[str] = []
    for raw in sources:
        source = (raw or "").strip()
        if not source:
            continue
        if _is_url(source):
            texts.append(_load_text_from_url(source, timeout))
        else:
            texts.append(_load_text_from_path(source))
    if not texts:
        raise ValueError("No valid sources provided for text extraction.")
    combined = "\n\n".join(texts)
    if not combined.strip():
        raise ValueError("Fetched sources contained no text content.")
    return combined
