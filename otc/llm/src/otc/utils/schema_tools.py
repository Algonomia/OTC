import json, hashlib
from typing import Type
from pydantic import BaseModel
__all__ = ["json_schema", "schema_hash"]
def json_schema(model_cls: Type[BaseModel]) -> dict:
    return model_cls.model_json_schema()

def schema_hash(model_cls: Type[BaseModel]) -> str:
    s = json.dumps(model_cls.model_json_schema(), ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(s.encode("utf-8")).hexdigest()
