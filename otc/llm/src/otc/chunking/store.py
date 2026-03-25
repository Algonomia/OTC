from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from .models import DocumentChunkBundle


class ChunkMetadataStore:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path_for(self, source_id: int) -> Path:
        return self.base_dir / f"{source_id}.json"

    def path_for(self, source_id: int) -> Path:
        """Public accessor for the metadata path of a source."""
        return self._path_for(source_id)

    def load(self, source_id: int) -> Optional[DocumentChunkBundle]:
        path = self._path_for(source_id)
        if not path.exists():
            return None
        with path.open("r", encoding="utf-8") as fh:
            payload = json.load(fh)
        try:
            return DocumentChunkBundle.from_dict(payload)
        except Exception:
            return None

    def save(self, bundle: DocumentChunkBundle) -> None:
        path = self._path_for(bundle.source_id)
        with path.open("w", encoding="utf-8") as fh:
            json.dump(bundle.to_dict(), fh, ensure_ascii=False, indent=2)

    def delete(self, source_id: int) -> None:
        path = self._path_for(source_id)
        if path.exists():
            path.unlink()
