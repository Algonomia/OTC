"""Utilities for token-based chunking, labeling, and retrieval."""

from .models import ChunkLabel, ChunkRecord, DocumentChunkBundle

try:  # pragma: no cover - optional high-level import
    from .manager import DocumentChunkManager
    __all__ = [
        "ChunkLabel",
        "ChunkRecord",
        "DocumentChunkBundle",
        "DocumentChunkManager",
    ]
except Exception:  # pragma: no cover - fall back when optional deps missing
    __all__ = [
        "ChunkLabel",
        "ChunkRecord",
        "DocumentChunkBundle",
    ]
