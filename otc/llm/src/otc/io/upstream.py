import json
from pathlib import Path
from typing import Dict, Any, Iterable
__all__ = ["iter_requests", "load_request"]
def iter_requests(incoming_dir: Path) -> Iterable[Path]:
    yield from sorted(incoming_dir.glob("*.json"))

def load_request(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))
