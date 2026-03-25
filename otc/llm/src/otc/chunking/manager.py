from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List, Optional, Sequence

from otc.llm.client import OpenAICompatClient
from otc.logging import setup_logger

from .candidates import (
    format_obligation_value,
    get_jurisdiction_candidates,
    get_obligation_candidates,
)
from .chunker import TokenizationResult, build_chunks, tokenize_text, estimate_token_count
from .labeler import ChunkLabeler, ChunkLabelingError, ChunkLabelingResult
from .models import ChunkRecord, DocumentChunkBundle, compute_text_hash
from .retrieval import SelectedChunkScore, select_relevant_chunks_with_scores
from .store import ChunkMetadataStore
from .telemetry import ChunkingTelemetry, NullChunkingTelemetry
from .similarity import ChunkTextSimilarityIndex


logger = setup_logger("otc.chunking.manager")


@dataclass
class ChunkingSettings:
    context_window: int
    chunk_size_tokens: Optional[int]
    chunk_size_ratio: float
    overlap_tokens: int
    trigger_ratio: float
    retrieval_top_n: int
    tokenizer_name: str
    retrieval_max_context_ratio: float = 0.5
    token_count_model: Optional[str] = None
    label_max_retries: int = 3
    label_retry_backoff_seconds: float = 0.5
    retrieval_similarity_weight: float = 0.25

    def effective_chunk_size(self) -> int:
        if self.chunk_size_tokens is not None and self.chunk_size_tokens > 0:
            return int(self.chunk_size_tokens)
        return max(1, int(self.context_window * self.chunk_size_ratio))


@dataclass
class LabelingStats:
    attempted: int = 0
    failures: int = 0
    empty: int = 0
    populated: int = 0

    def as_metrics(self) -> dict[str, float]:
        return {
            "chunking.label.chunks_attempted": float(self.attempted),
            "chunking.label.chunks_failed": float(self.failures),
            "chunking.label.chunks_empty": float(self.empty),
            "chunking.label.chunks_populated": float(self.populated),
        }


class DocumentChunkManager:
    def __init__(
        self,
        settings: ChunkingSettings,
        store: ChunkMetadataStore,
        labeling_client: Optional[OpenAICompatClient] = None,
        labeling_prompt: str = "",
        telemetry: Optional[ChunkingTelemetry] = None,
        candidate_jurisdictions: Optional[Sequence[str]] = None,
        candidate_obligations: Optional[Sequence[str]] = None,
    ) -> None:
        self.settings = settings
        self.store = store
        self.labeling_client = labeling_client
        self.labeling_prompt = labeling_prompt or "You label compliance chunks. Return JSON with field 'labels'."
        self.telemetry = telemetry or NullChunkingTelemetry()

        self.tokenized: Optional[TokenizationResult] = None
        self.total_tokens: int = 0
        self.bundle: Optional[DocumentChunkBundle] = None
        self.text_cache: List[str] = []
        self.document_hash: Optional[str] = None
        self.source_id: Optional[int] = None
        self.document_text: Optional[str] = None
        self.label_stats: LabelingStats = LabelingStats()
        self._jurisdictions_present: set[str] = set()
        self._pairs_present: set[tuple[str, str]] = set()
        self._params_logged: bool = False
        self._jurisdiction_candidates_default = list(
            candidate_jurisdictions if candidate_jurisdictions is not None else get_jurisdiction_candidates()
        )
        self._obligation_candidates_default = list(
            candidate_obligations if candidate_obligations is not None else get_obligation_candidates()
        )
        self._similarity_index: Optional[ChunkTextSimilarityIndex] = None

    def _should_chunk(self) -> bool:
        if self.settings.context_window <= 0:
            return False
        return self.total_tokens > int(self.settings.context_window * self.settings.trigger_ratio)

    def _log_settings_once(self) -> None:
        if self._params_logged:
            return
        params = {
            "chunking.context_window": int(self.settings.context_window),
            "chunking.chunk_size_tokens_config": int(self.settings.chunk_size_tokens or 0),
            "chunking.chunk_size_ratio": float(self.settings.chunk_size_ratio),
            "chunking.overlap_tokens": int(self.settings.overlap_tokens),
            "chunking.trigger_ratio": float(self.settings.trigger_ratio),
            "chunking.retrieval_top_n": int(self.settings.retrieval_top_n),
            "chunking.retrieval_max_context_ratio": float(self.settings.retrieval_max_context_ratio),
            "chunking.label_max_retries": int(self.settings.label_max_retries),
            "chunking.label_retry_backoff_seconds": float(self.settings.label_retry_backoff_seconds),
            "chunking.retrieval_similarity_weight": float(self.settings.retrieval_similarity_weight),
        }
        self.telemetry.log_params(params)
        self._params_logged = True

    @staticmethod
    def _merge_candidates(provided: Iterable[str], defaults: Sequence[str]) -> List[str]:
        seen = set()
        merged: List[str] = []
        for item in provided:
            clean = str(item).strip()
            if not clean:
                continue
            key = clean.lower()
            if key in seen:
                continue
            merged.append(clean)
            seen.add(key)
        for item in defaults:
            clean = str(item).strip()
            if not clean:
                continue
            key = clean.lower()
            if key in seen:
                continue
            merged.append(clean)
            seen.add(key)
        return merged

    def _log_labeling_stats(self) -> None:
        metrics = self.label_stats.as_metrics()
        for name, value in metrics.items():
            self.telemetry.log_metric(name, value)
        logger.info(
            "Chunk labeling stats for source %s: attempted=%s populated=%s empty=%s failures=%s",
            self.source_id,
            self.label_stats.attempted,
            self.label_stats.populated,
            self.label_stats.empty,
            self.label_stats.failures,
        )

    def _log_chunk_bundle_details(self) -> None:
        if not self.bundle:
            return
        logger.info(
            "Chunking active for source %s: chunk_count=%s chunk_size_tokens=%s overlap_tokens=%s total_tokens=%s",
            self.source_id,
            len(self.bundle.chunks),
            self.bundle.chunk_size_tokens,
            self.bundle.overlap_tokens,
            self.total_tokens,
        )
        for chunk in self.bundle.chunks:
            logger.info(
                "Chunk prepared: source=%s chunk_id=%s index=%s token_count=%s char_range=%s-%s",
                self.source_id,
                chunk.chunk_id,
                chunk.index,
                chunk.token_count,
                chunk.char_start,
                chunk.char_end,
            )

    def prepare(
        self,
        source_id: int,
        text: str,
        jurisdictions: Iterable[str],
        obligations: Iterable[str],
    ) -> None:
        tokenizer_name = self.settings.tokenizer_name
        self.source_id = source_id
        self.document_text = text
        self.label_stats = LabelingStats()

        count_model = self.settings.token_count_model or tokenizer_name or "o200k_base"
        self.total_tokens = estimate_token_count(text, count_model)
        self.document_hash = compute_text_hash(text)
        self._log_settings_once()
        self.telemetry.set_tags(
            {
                "chunking.tokenizer_name": tokenizer_name,
                "chunking.token_count_model": count_model,
            }
        )
        self.telemetry.log_metric("chunking.total_tokens", float(self.total_tokens))

        should_chunk = self._should_chunk()
        self.telemetry.log_metric("chunking.should_chunk", 1.0 if should_chunk else 0.0)
        if not should_chunk:
            logger.info(
                "Skipping chunking for source %s: total_tokens=%s below threshold (ratio %.2f of context window)",
                source_id,
                self.total_tokens,
                self.total_tokens / self.settings.context_window if self.settings.context_window else 0.0,
            )
            self.bundle = None
            self.text_cache = []
            self._refresh_label_cache()
            return

        desired_chunk_size = max(self.settings.overlap_tokens + 1, self.settings.effective_chunk_size())
        activation_threshold = int(self.settings.context_window * self.settings.trigger_ratio)
        logger.info(
            "Chunking activated for source %s: total_tokens=%s threshold=%s desired_chunk_size=%s overlap_tokens=%s",
            source_id,
            self.total_tokens,
            activation_threshold,
            desired_chunk_size,
            self.settings.overlap_tokens,
        )
        stored_bundle = self.store.load(source_id)

        recreate_chunks = True
        if stored_bundle:
            same_hash = stored_bundle.document_hash == self.document_hash
            same_tokenizer = stored_bundle.tokenizer_name == tokenizer_name
            same_params = (
                stored_bundle.context_window == self.settings.context_window
                and stored_bundle.chunk_size_tokens == desired_chunk_size
                and stored_bundle.overlap_tokens == self.settings.overlap_tokens
            )
            if same_hash and same_tokenizer and same_params:
                self.bundle = stored_bundle
                recreate_chunks = False
                if stored_bundle.total_tokens:
                    self.total_tokens = stored_bundle.total_tokens
                logger.info(
                    "Reusing %s stored chunks for source %s (document hash and chunk params matched)",
                    len(stored_bundle.chunks),
                    source_id,
                )
            else:
                logger.info(
                    "Stored chunk bundle mismatch for source %s; rebuilding "
                    "(hash_match=%s tokenizer_match=%s params_match=%s)",
                    source_id,
                    same_hash,
                    same_tokenizer,
                    same_params,
                )
                recreate_chunks = True
        else:
            logger.info("No stored chunk bundle found for source %s; building chunks from scratch", source_id)

        if recreate_chunks:
            self.tokenized = tokenize_text(
                text,
                tokenizer_name,
                preferred_model=self.settings.token_count_model,
            )
            self.total_tokens = self.tokenized.token_count
            chunks = build_chunks(
                text=text,
                source_id=source_id,
                tokenizer_name=tokenizer_name,
                chunk_size_tokens=desired_chunk_size,
                overlap_tokens=self.settings.overlap_tokens,
                tokenized=self.tokenized,
                preferred_model=self.settings.token_count_model,
            )
            bundle = DocumentChunkBundle(
                source_id=source_id,
                document_hash=self.document_hash,
                tokenizer_name=tokenizer_name,
                context_window=self.settings.context_window,
                chunk_size_tokens=desired_chunk_size,
                overlap_tokens=self.settings.overlap_tokens,
                total_tokens=self.total_tokens,
                chunks=chunks,
            )
            self.bundle = bundle
            logger.info("Built %s new chunks for source %s", len(chunks), source_id)
        else:
            # ensure bundle total tokens updated
            assert self.bundle is not None
            self.bundle.total_tokens = self.total_tokens

        assert self.bundle is not None
        self.text_cache = [text[chunk.char_start:chunk.char_end] for chunk in self.bundle.chunks]
        if self.text_cache:
            try:
                self._similarity_index = ChunkTextSimilarityIndex(self.text_cache)
            except Exception as exc:
                logger.warning("Failed to build chunk similarity index: %s", exc)
                self._similarity_index = None
        else:
            self._similarity_index = None
        self.telemetry.log_metric("chunking.chunk_count", float(len(self.bundle.chunks)))
        self.telemetry.log_metric("chunking.chunk_size_tokens", float(self.bundle.chunk_size_tokens))
        self.telemetry.log_metric("chunking.chunk_overlap_tokens", float(self.bundle.overlap_tokens))
        self.telemetry.set_tags({"chunking.bundle_reused": str(not recreate_chunks).lower()})
        self._log_chunk_bundle_details()

        unlabeled = self.bundle.unlabeled_chunks()
        if unlabeled and self.labeling_client:
            logger.info("Labeling %s unlabeled chunks for source %s", len(unlabeled), source_id)
            obligation_candidates_input = [
                format_obligation_value(str(obligation)) for obligation in obligations
            ]
            labeler = ChunkLabeler(
                client=self.labeling_client,
                system_prompt=self.labeling_prompt,
                candidate_jurisdictions=self._merge_candidates(jurisdictions, self._jurisdiction_candidates_default),
                candidate_obligations=self._merge_candidates(
                    obligation_candidates_input, self._obligation_candidates_default
                ),
                telemetry=self.telemetry,
                max_retries=self.settings.label_max_retries,
                retry_backoff_seconds=self.settings.label_retry_backoff_seconds,
            )
            updated: List[ChunkRecord] = []
            for chunk in unlabeled:
                self.label_stats.attempted += 1
                chunk_text = text[chunk.char_start:chunk.char_end]
                try:
                    result: ChunkLabelingResult = labeler.label_chunk(
                        chunk_text=chunk_text,
                        chunk_id=chunk.chunk_id,
                        index=chunk.index,
                        token_count=chunk.token_count,
                    )
                except ChunkLabelingError as exc:
                    self.label_stats.failures += 1
                    logger.error(
                        "Failed to label chunk %s (source %s) after retries: %s",
                        chunk.chunk_id,
                        source_id,
                        exc,
                    )
                    continue

                labels = result.labels
                if labels:
                    self.label_stats.populated += 1
                else:
                    self.label_stats.empty += 1

                chunk.llm_labels = labels
                updated.append(chunk)

            self._log_labeling_stats()
            if updated:
                self.bundle.replace_chunks(updated)
                self.store.save(self.bundle)
            elif self.label_stats.failures:
                logger.warning(
                    "Chunk labeling completed without updates; failures recorded for source %s", source_id
                )
        elif recreate_chunks:
            self.store.save(self.bundle)
        self._refresh_label_cache()

    def is_active(self) -> bool:
        return self.bundle is not None

    def jurisdictions_present(self) -> set[str]:
        return set(self._jurisdictions_present)

    def has_jurisdiction(self, jurisdiction: str) -> bool:
        return jurisdiction.lower().strip() in self._jurisdictions_present

    def has_pair(self, jurisdiction: str, obligation_type: str) -> bool:
        return (
            jurisdiction.lower().strip(),
            obligation_type.lower().strip(),
        ) in self._pairs_present

    def context_for(self, jurisdiction: str, obligation_type: str, top_n: Optional[int] = None) -> Optional[str]:
        if not self.bundle:
            return None
        if not self.has_jurisdiction(jurisdiction):
            return None
        top_n = top_n or self.settings.retrieval_top_n
        context_ratio = max(0.0, float(getattr(self.settings, "retrieval_max_context_ratio", 0.5)))
        max_tokens = None
        if self.settings.context_window > 0 and context_ratio > 0:
            max_tokens = int(self.settings.context_window * context_ratio)
        similarity_scores = None
        if self._similarity_index and self._similarity_index.is_ready():
            query_text = self._build_query_text(jurisdiction, obligation_type)
            sims = self._similarity_index.scores(query_text)
            similarity_scores = {idx: float(score) for idx, score in enumerate(sims)}
        selected_scored_chunks = select_relevant_chunks_with_scores(
            self.bundle.chunks,
            jurisdiction=jurisdiction,
            obligation_type=obligation_type,
            top_n=top_n,
            similarity_scores=similarity_scores,
            similarity_weight=self.settings.retrieval_similarity_weight,
            max_total_tokens=max_tokens,
        )
        if not selected_scored_chunks:
            logger.info(
                "Chunk retrieval for source %s %s/%s selected no chunks (top_n=%s max_total_tokens=%s)",
                self.source_id,
                jurisdiction,
                obligation_type,
                top_n,
                max_tokens,
            )
            return None
        pieces: List[str] = []
        chunk_texts: List[str] = []
        for scored in selected_scored_chunks:
            chunk = scored.chunk
            chunk_text = self._resolve_chunk_text(chunk)
            pieces.append(chunk_text)
            chunk_texts.append(chunk_text)
        self._log_retrieved_chunks(
            jurisdiction=jurisdiction,
            obligation_type=obligation_type,
            selected_chunks=selected_scored_chunks,
            chunk_texts=chunk_texts,
            top_n=top_n,
            max_tokens=max_tokens,
        )
        return "\n\n".join(piece for piece in pieces if piece)

    def _build_query_text(self, jurisdiction: str, obligation_type: str) -> str:
        candidate = format_obligation_value(obligation_type)
        return f"{jurisdiction} {obligation_type} {candidate}"

    def _resolve_chunk_text(self, chunk: ChunkRecord) -> str:
        try:
            return self.text_cache[chunk.index]
        except IndexError:
            if self.document_text:
                return self.document_text[chunk.char_start:chunk.char_end]
            return ""

    @staticmethod
    def _edge_token_preview(text: str, count: int = 10) -> tuple[str, str, int]:
        tokens = text.split()
        if not tokens:
            return "", "", 0
        first = " ".join(tokens[:count])
        last = " ".join(tokens[-count:])
        return first, last, len(tokens)

    def _log_retrieved_chunks(
        self,
        jurisdiction: str,
        obligation_type: str,
        selected_chunks: Sequence[SelectedChunkScore],
        chunk_texts: Sequence[str],
        top_n: int,
        max_tokens: Optional[int],
    ) -> None:
        stages = ",".join(sorted({item.selection_stage for item in selected_chunks}))
        logger.info(
            "Chunk retrieval for source %s %s/%s selected %s chunks (stages=%s top_n=%s max_total_tokens=%s)",
            self.source_id,
            jurisdiction,
            obligation_type,
            len(selected_chunks),
            stages,
            top_n,
            max_tokens,
        )
        for rank, (scored, text) in enumerate(zip(selected_chunks, chunk_texts), start=1):
            chunk = scored.chunk
            first_tokens, last_tokens, word_count = self._edge_token_preview(text, count=10)
            logger.info(
                "Chunk used: source=%s pair=%s/%s rank=%s chunk_id=%s index=%s token_count=%s "
                "char_range=%s-%s stage=%s score_rank=%s combined_score=%.4f label_score_used=%.4f "
                "similarity_score=%.4f words=%s first_10_tokens=%s last_10_tokens=%s",
                self.source_id,
                jurisdiction,
                obligation_type,
                rank,
                chunk.chunk_id,
                chunk.index,
                chunk.token_count,
                chunk.char_start,
                chunk.char_end,
                scored.selection_stage,
                scored.score_rank,
                scored.combined_score,
                scored.label_score_used,
                scored.similarity_score,
                word_count,
                first_tokens,
                last_tokens,
            )

    def _refresh_label_cache(self) -> None:
        self._jurisdictions_present = set()
        self._pairs_present = set()
        if not self.bundle:
            return
        for chunk in self.bundle.chunks:
            for label in chunk.llm_labels:
                j = label.jurisdiction.lower().strip()
                o = label.obligation_type.lower().strip()
                if j:
                    self._jurisdictions_present.add(j)
                if j and o:
                    self._pairs_present.add((j, o))
