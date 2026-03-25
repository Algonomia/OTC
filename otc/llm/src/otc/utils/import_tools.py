from importlib import import_module
from typing import Type, Any
__all__ = ["import_by_path"]
def import_by_path(spec: str) -> Any:
    """'package.module:Name' -> object"""
    mod_name, attr = spec.split(":")
    mod = import_module(mod_name)
    return getattr(mod, attr)
