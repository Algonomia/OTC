from typing import Sequence

from .text_sources import load_text_from_sources


def extract_markdown_from_paths(paths: Sequence[str]) -> str:
    """Backwards-compatible wrapper; prefer load_text_from_sources."""
    return load_text_from_sources(paths)
