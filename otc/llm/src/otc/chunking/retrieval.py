from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from .models import ChunkRecord


_CLUSTER_MIN_ABS_GAP = 0.15
_CLUSTER_MIN_RELATIVE_GAP = 0.22
_CLUSTER_RELATIVE_FLOOR = 0.60

MatchTuple = Tuple[float, float, float, int, ChunkRecord]


@dataclass(frozen=True)
class SelectedChunkScore:
    chunk: ChunkRecord
    selection_stage: str
    score_rank: int
    combined_score: float
    label_score_used: float
    similarity_score: float


def _cluster_high_relevance(matches: Sequence[MatchTuple]) -> List[MatchTuple]:
    if not matches:
        return []
    if len(matches) == 1:
        return [matches[0]]

    scores = [item[0] for item in matches]
    top_score = scores[0]
    if top_score <= 0:
        return []

    max_gap = 0.0
    max_gap_index = -1
    for idx in range(len(scores) - 1):
        gap = scores[idx] - scores[idx + 1]
        if gap > max_gap:
            max_gap = gap
            max_gap_index = idx

    significant_gap = max_gap >= max(_CLUSTER_MIN_ABS_GAP, top_score * _CLUSTER_MIN_RELATIVE_GAP)
    if significant_gap and max_gap_index >= 0:
        return list(matches[: max_gap_index + 1])

    # No clear elbow: keep the high-score band near the peak.
    floor = top_score * _CLUSTER_RELATIVE_FLOOR
    keep = 1
    while keep < len(scores) and scores[keep] >= floor:
        keep += 1
    return list(matches[:keep])


def _select_matches_with_limits(
    ranked_matches: Sequence[MatchTuple],
    top_n: int,
    max_total_tokens: Optional[int],
) -> List[MatchTuple]:
    selected: List[MatchTuple] = []
    total_tokens = 0
    for item in ranked_matches:
        _, _, _, _, chunk = item
        if len(selected) >= top_n:
            break
        next_tokens = chunk.token_count or 0
        if max_total_tokens is not None and max_total_tokens > 0 and (total_tokens + next_tokens) > max_total_tokens:
            continue
        selected.append(item)
        total_tokens += next_tokens
    return selected


def _to_scored_selection(
    selected_matches: Sequence[MatchTuple],
    selection_stage: str,
) -> List[SelectedChunkScore]:
    scored: List[SelectedChunkScore] = []
    for rank, (combined, label_score, similarity_score, _, chunk) in enumerate(selected_matches, start=1):
        scored.append(
            SelectedChunkScore(
                chunk=chunk,
                selection_stage=selection_stage,
                score_rank=rank,
                combined_score=float(combined),
                label_score_used=float(label_score),
                similarity_score=float(similarity_score),
            )
        )
    return sorted(scored, key=lambda item: item.chunk.index)


def select_relevant_chunks_with_scores(
    chunks: Iterable[ChunkRecord],
    jurisdiction: str,
    obligation_type: str,
    top_n: int,
    similarity_scores: Optional[Dict[int, float]] = None,
    similarity_weight: float = 0.0,
    max_total_tokens: Optional[int] = None,
) -> List[SelectedChunkScore]:
    chunks = list(chunks)
    if top_n <= 0:
        return []

    similarity_scores = similarity_scores or {}
    similarity_weight = max(0.0, float(similarity_weight))

    matches: List[MatchTuple] = []
    for chunk in chunks:
        label_score = chunk.best_score_for(jurisdiction, obligation_type)
        similarity_score = similarity_scores.get(chunk.index, 0.0)
        combined = label_score + (similarity_weight * similarity_score)
        if combined > 0:
            matches.append((combined, label_score, similarity_score, chunk.index, chunk))

    matches.sort(key=lambda item: (-item[0], -item[1], -item[2], item[3]))
    clustered_pair_matches = _cluster_high_relevance(matches)
    selected_pair_matches = _select_matches_with_limits(
        clustered_pair_matches,
        top_n=top_n,
        max_total_tokens=max_total_tokens,
    )
    if selected_pair_matches:
        return _to_scored_selection(selected_pair_matches, selection_stage="pair")

    # Pair labels may be sparse. Fall back to jurisdiction-level scores, but
    # keep the same cluster filtering to avoid low-quality tail chunks.
    jurisdiction_matches: List[MatchTuple] = []
    for chunk in chunks:
        jurisdiction_score = chunk.best_score_for(jurisdiction)
        similarity_score = similarity_scores.get(chunk.index, 0.0)
        combined = jurisdiction_score + (similarity_weight * similarity_score)
        if combined > 0:
            jurisdiction_matches.append(
                (combined, jurisdiction_score, similarity_score, chunk.index, chunk)
            )

    jurisdiction_matches.sort(key=lambda item: (-item[0], -item[1], -item[2], item[3]))
    clustered_jurisdiction_matches = _cluster_high_relevance(jurisdiction_matches)
    selected_jurisdiction_matches = _select_matches_with_limits(
        clustered_jurisdiction_matches,
        top_n=top_n,
        max_total_tokens=max_total_tokens,
    )
    return _to_scored_selection(selected_jurisdiction_matches, selection_stage="jurisdiction")


def select_relevant_chunks(
    chunks: Iterable[ChunkRecord],
    jurisdiction: str,
    obligation_type: str,
    top_n: int,
    similarity_scores: Optional[Dict[int, float]] = None,
    similarity_weight: float = 0.0,
    max_total_tokens: Optional[int] = None,
) -> List[ChunkRecord]:
    scored = select_relevant_chunks_with_scores(
        chunks=chunks,
        jurisdiction=jurisdiction,
        obligation_type=obligation_type,
        top_n=top_n,
        similarity_scores=similarity_scores,
        similarity_weight=similarity_weight,
        max_total_tokens=max_total_tokens,
    )
    return [item.chunk for item in scored]
