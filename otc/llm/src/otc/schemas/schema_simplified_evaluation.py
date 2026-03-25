from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class OTCSimplifiedEvaluationResult(BaseModel):
    score: int = Field(ge=0, le=100)
    comment: str = Field(min_length=1)

    model_config = ConfigDict(extra="forbid")
