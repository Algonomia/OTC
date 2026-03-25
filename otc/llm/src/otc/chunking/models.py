from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from typing import List, Sequence, Tuple, Dict, Any


def compute_text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


@dataclass
class ChunkLabel:
    jurisdiction: str
    obligation_type: str
    relevance_score: float

    def to_dict(self) -> Dict[str, Any]:
        return {
            "jurisdiction": self.jurisdiction,
            "obligation_type": self.obligation_type,
            "relevance_score": self.relevance_score,
        }

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "ChunkLabel":
        return cls(
            jurisdiction=payload.get("jurisdiction", ""),
            obligation_type=payload.get("obligation_type", ""),
            relevance_score=float(payload.get("relevance_score", 0.0)),
        )


@dataclass
class ChunkRecord:
    source_id: int
    chunk_id: str
    index: int
    char_start: int
    char_end: int
    token_count: int
    text_hash: str
    llm_labels: List[ChunkLabel] = field(default_factory=list)

    @property
    def char_span(self) -> Tuple[int, int]:
        return self.char_start, self.char_end

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "chunk_id": self.chunk_id,
            "index": self.index,
            "char_start": self.char_start,
            "char_end": self.char_end,
            "token_count": self.token_count,
            "text_hash": self.text_hash,
            "llm_labels": [label.to_dict() for label in self.llm_labels],
        }

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "ChunkRecord":
        labels = [ChunkLabel.from_dict(item) for item in payload.get("llm_labels", [])]
        return cls(
            source_id=int(payload["source_id"]),
            chunk_id=str(payload["chunk_id"]),
            index=int(payload["index"]),
            char_start=int(payload["char_start"]),
            char_end=int(payload["char_end"]),
            token_count=int(payload["token_count"]),
            text_hash=str(payload["text_hash"]),
            llm_labels=labels,
        )

    def has_label_for(self, jurisdiction: str, obligation_type: str) -> bool:
        target_j = jurisdiction.lower().strip()
        target_o = obligation_type.lower().strip()
        for label in self.llm_labels:
            if label.jurisdiction.lower().strip() == target_j and label.obligation_type.lower().strip() == target_o:
                return True
        return False

    def has_jurisdiction(self, jurisdiction: str) -> bool:
        target = jurisdiction.lower().strip()
        for label in self.llm_labels:
            if label.jurisdiction.lower().strip() == target:
                return True
        return False

    def best_score_for(self, jurisdiction: str, obligation_type: str | None = None) -> float:
        target_j = jurisdiction.lower().strip()
        target_o = obligation_type.lower().strip() if obligation_type else None
        scores: List[float] = []
        for label in self.llm_labels:
            if label.jurisdiction.lower().strip() != target_j:
                continue
            if target_o is not None and label.obligation_type.lower().strip() != target_o:
                continue
            scores.append(label.relevance_score)
        return max(scores) if scores else 0.0


@dataclass
class DocumentChunkBundle:
    source_id: int
    document_hash: str
    tokenizer_name: str
    context_window: int
    chunk_size_tokens: int
    overlap_tokens: int
    total_tokens: int
    chunks: List[ChunkRecord] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "document_hash": self.document_hash,
            "tokenizer_name": self.tokenizer_name,
            "context_window": self.context_window,
            "chunk_size_tokens": self.chunk_size_tokens,
            "overlap_tokens": self.overlap_tokens,
            "total_tokens": self.total_tokens,
            "chunks": [chunk.to_dict() for chunk in self.chunks],
        }

    @classmethod
    def from_dict(cls, payload: Dict[str, Any]) -> "DocumentChunkBundle":
        chunks = [ChunkRecord.from_dict(item) for item in payload.get("chunks", [])]
        return cls(
            source_id=int(payload["source_id"]),
            document_hash=str(payload["document_hash"]),
            tokenizer_name=str(payload["tokenizer_name"]),
            context_window=int(payload["context_window"]),
            chunk_size_tokens=int(payload["chunk_size_tokens"]),
            overlap_tokens=int(payload["overlap_tokens"]),
            total_tokens=int(payload.get("total_tokens", 0)),
            chunks=chunks,
        )

    def make_chunk_lookup(self) -> Dict[str, ChunkRecord]:
        return {chunk.chunk_id: chunk for chunk in self.chunks}

    def replace_chunks(self, updated: Sequence[ChunkRecord]) -> None:
        by_id = {chunk.chunk_id: chunk for chunk in updated}
        for idx, chunk in enumerate(self.chunks):
            if chunk.chunk_id in by_id:
                self.chunks[idx] = by_id[chunk.chunk_id]

    def unlabeled_chunks(self) -> List[ChunkRecord]:
        return [chunk for chunk in self.chunks if not chunk.llm_labels]
