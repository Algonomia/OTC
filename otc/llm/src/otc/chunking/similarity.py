from __future__ import annotations

from typing import Iterable, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ChunkTextSimilarityIndex:
    """Lightweight TF-IDF based similarity index for chunk texts."""

    def __init__(
        self,
        texts: Iterable[str],
        *,
        ngram_range: tuple[int, int] | None = None,
        max_features: Optional[int] = 8000,
    ) -> None:
        texts_list = [text or "" for text in texts]
        self._vectorizer = TfidfVectorizer(
            ngram_range=ngram_range or (1, 2),
            lowercase=True,
            stop_words="english",
            max_features=max_features,
        )
        if not texts_list:
            self._matrix = None
        else:
            self._matrix = self._vectorizer.fit_transform(texts_list)

    def is_ready(self) -> bool:
        return self._matrix is not None and self._matrix.shape[0] > 0

    def scores(self, query: str) -> np.ndarray:
        if not self.is_ready():
            return np.zeros(0)
        query_vec = self._vectorizer.transform([query or ""])
        sims = cosine_similarity(self._matrix, query_vec)
        return sims.ravel()


__all__ = ["ChunkTextSimilarityIndex"]
