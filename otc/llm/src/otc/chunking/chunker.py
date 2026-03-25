from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import List, Optional, Tuple

from .models import ChunkRecord, compute_text_hash

import tiktoken

from transformers import AutoTokenizer


@dataclass
class TokenizationResult:
    tokens: List[int]
    offsets: List[Tuple[int, int]]

    @property
    def token_count(self) -> int:
        return len(self.tokens)


@lru_cache(maxsize=8)
def _load_tiktoken_encoder(name: str):
    if tiktoken is None:
        return None
    try:
        return tiktoken.encoding_for_model(name)
    except KeyError:
        try:
            return tiktoken.get_encoding(name)
        except Exception:
            return tiktoken.get_encoding("o200k_base")


@lru_cache(maxsize=4)
def _load_transformer_tokenizer(name: str):
    if AutoTokenizer is None:
        return None
    tokenizer = AutoTokenizer.from_pretrained(name)
    tokenizer.model_max_length = int(getattr(tokenizer, "model_max_length", 1000000) or 1000000)
    return tokenizer


def estimate_token_count(text: str, model: Optional[str] = None) -> int:
    """Estimate token count using tiktoken when available, fallback to a naive heuristic."""
    if tiktoken is not None:
        target_model = model or "o200k_base"
        encoder = _load_tiktoken_encoder(target_model)
        if encoder is not None:
            return len(encoder.encode(text, disallowed_special=()))
    # fallback heuristic: assume ~4 characters per token
    return max(1, len(text) // 4)


def _tokenize_with_tiktoken(text: str, model_name: str) -> Optional[TokenizationResult]:
    encoder = _load_tiktoken_encoder(model_name)
    if encoder is None:
        return None
    tokens = encoder.encode(text, disallowed_special=())
    if not tokens:
        return TokenizationResult(tokens=[], offsets=[])
    pieces = [encoder.decode([tok]) for tok in tokens]
    offsets: List[Tuple[int, int]] = []
    cursor = 0
    for piece in pieces:
        start = cursor
        cursor += len(piece)
        offsets.append((start, cursor))
    return TokenizationResult(tokens=tokens, offsets=offsets)


def tokenize_text(
    text: str,
    tokenizer_name: str,
    preferred_model: Optional[str] = None,
) -> TokenizationResult:
    tokenized = None
    if preferred_model:
        tokenized = _tokenize_with_tiktoken(text, preferred_model)
    if tokenized is None and tokenizer_name:
        tokenized = _tokenize_with_tiktoken(text, tokenizer_name)
    if tokenized is not None:
        return tokenized

    if not tokenizer_name:
        raise RuntimeError("Tokenizer name required when tiktoken is unavailable")

    tokenizer = _load_transformer_tokenizer(tokenizer_name)
    if tokenizer is None:
        raise RuntimeError(
            "Unable to create tokenizer: neither tiktoken nor transformers backend is available"
        )

    encoded = tokenizer(
        text,
        add_special_tokens=False,
        return_offsets_mapping=True,
        return_attention_mask=False,
    )
    tokens: List[int] = encoded["input_ids"]
    offsets: List[Tuple[int, int]] = encoded["offset_mapping"]
    return TokenizationResult(tokens=tokens, offsets=offsets)


def _ensure_positive(value: int, minimum: int) -> int:
    return value if value >= minimum else minimum


def build_chunks(
    text: str,
    source_id: int,
    tokenizer_name: str,
    chunk_size_tokens: int,
    overlap_tokens: int,
    tokenized: TokenizationResult | None = None,
    preferred_model: Optional[str] = None,
) -> List[ChunkRecord]:
    tokenized = tokenized or tokenize_text(
        text,
        tokenizer_name=tokenizer_name,
        preferred_model=preferred_model,
    )
    tokens_total = tokenized.token_count
    if tokens_total == 0:
        chunk = ChunkRecord(
            source_id=source_id,
            chunk_id=f"{source_id}-0000",
            index=0,
            char_start=0,
            char_end=len(text),
            token_count=0,
            text_hash=compute_text_hash(text),
            llm_labels=[],
        )
        return [chunk]

    chunk_size_tokens = _ensure_positive(chunk_size_tokens, overlap_tokens + 1)

    chunks: List[ChunkRecord] = []
    start = 0
    chunk_index = 0
    while start < tokens_total:
        end = min(start + chunk_size_tokens, tokens_total)
        char_start = tokenized.offsets[start][0] if tokenized.offsets else 0
        end_offset = tokenized.offsets[end - 1] if tokenized.offsets else (len(text), len(text))
        char_end = end_offset[1] or end_offset[0]
        if char_end <= char_start:
            char_end = len(text)
        chunk_text = text[char_start:char_end]
        chunk = ChunkRecord(
            source_id=source_id,
            chunk_id=f"{source_id}-{chunk_index:04d}",
            index=chunk_index,
            char_start=char_start,
            char_end=char_end,
            token_count=end - start,
            text_hash=compute_text_hash(chunk_text),
            llm_labels=[],
        )
        chunks.append(chunk)
        if end == tokens_total:
            break
        start = max(end - overlap_tokens, start + 1)
        chunk_index += 1

    return chunks
