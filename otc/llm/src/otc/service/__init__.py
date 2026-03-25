"""Service layer utilities and API application."""

from .api import app  # re-export FastAPI app

__all__ = ["app"]
