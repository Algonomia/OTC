"""Pydantic schema for OTC jurisdiction-wide obligation inventory extraction.

Purpose
- One call corresponds to ONE jurisdiction (ISO-2) and the provided source text.
- The LLM returns a structured inventory of ALL relevant obligations explicitly mentioned in the source text
  (i.e., obligations that are required/in place, not enforced/suspended, explicitly not required, or explicitly repealed).

This schema is intentionally lightweight and is meant to complement (not replace) the per-obligation Overview / Deadline / Threshold / Penalty extractions.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


# -------------------------
# Obligation enums
# -------------------------

class ObligationTypeId(str, Enum):
    AnnualTPForm = "AnnualTPForm"
    RelatedPartyDisclosure = "RelatedPartyDisclosure"
    SITDisclosure = "SITDisclosure"

    MasterFile = "MasterFile"
    MasterFileNotification = "MasterFileNotification"

    LocalFile = "LocalFile"
    ContemporaneousTPDocumentation = "ContemporaneousTPDocumentation"
    SpecialItemFile = "SpecialItemFile"

    AnnualAPAReport = "AnnualAPAReport"
    CbCR = "CbCR"
    CbCRNotification = "CbCRNotification"
    PublicCbCR = "PublicCbCR"
    PEAuxiliaryCalculation = "PEAuxiliaryCalculation"


class LinkedObligation(str, Enum):
    """Allowed values for relationship/linkage lists."""
    CITReturn = "CITReturn"

    AnnualTPForm = "AnnualTPForm"
    RelatedPartyDisclosure = "RelatedPartyDisclosure"
    SITDisclosure = "SITDisclosure"

    MasterFile = "MasterFile"
    MasterFileNotification = "MasterFileNotification"

    LocalFile = "LocalFile"
    ContemporaneousTPDocumentation = "ContemporaneousTPDocumentation"
    SpecialItemFile = "SpecialItemFile"

    AnnualAPAReport = "AnnualAPAReport"
    CbCR = "CbCR"
    CbCRNotification = "CbCRNotification"
    PublicCbCR = "PublicCbCR"
    PEAuxiliaryCalculation = "PEAuxiliaryCalculation"


class ObligationMentionStatus(str, Enum):
    """How the obligation is described in the provided text."""
    InPlace = "InPlace"            # exists and applies
    NotEnforced = "NotEnforced"    # exists but explicitly suspended/waived/not enforced
    NotRequired = "NotRequired"    # explicitly stated as not required / not applicable
    NotExist = "NotExist"          # explicitly repealed/abolished/non-existent


# -------------------------
# Inventory entry
# -------------------------

class ObligationFinding(BaseModel):
    """One obligation found in the source text for the jurisdiction."""
    model_config = ConfigDict(extra="forbid")

    obligation_type_id: ObligationTypeId
    status: ObligationMentionStatus

    implementation_summary: str = Field(
        ...,
        description="1–3 concise sentences describing how the obligation is implemented/realised in this jurisdiction (include local form/schedule name if explicit).",
        min_length=1,
    )
    downstream_search_focus: str = Field(
        ...,
        description="1 concise sentence guiding downstream extraction keywords/components (deadlines/thresholds/penalties).",
        min_length=1,
    )

    aliases_in_text: List[str] = Field(
        default_factory=list,
        description="Explicit local names (form numbers, schedule names, portal names, acronyms) appearing in the text.",
    )
    distinct_components: List[str] = Field(
        default_factory=list,
        description="Distinct variants/components explicitly described that matter downstream (keep short).",
    )

    linked_obligations: List[LinkedObligation] = Field(
        default_factory=list,
        description="Other obligations explicitly described as 'filed with', 'prepared with', 'attached to', etc. Directional: list what THIS obligation is linked with.",
    )

    references: str = Field(
        default="",
        description="Merged pages + legal references as ONE string (same format as overview). Empty string if none.",
    )
    notes: Optional[str] = Field(
        default=None,
        description="Short evidence-based justification (optional).",
    )


class ObligationInventoryData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    obligations: List[ObligationFinding] = Field(default_factory=list)


class OTCObligationInventoryRow(BaseModel):
    """Output envelope for ONE jurisdiction."""
    model_config = ConfigDict(extra="forbid")

    data: Optional[ObligationInventoryData] = None

    @model_validator(mode="after")
    def _unique_obligations(self) -> "OTCObligationInventoryRow":
        if self.data and self.data.obligations:
            seen = set()
            for o in self.data.obligations:
                if o.obligation_type_id in seen:
                    raise ValueError(f"Duplicate obligation_type_id in obligations list: {o.obligation_type_id.value}")
                seen.add(o.obligation_type_id)
        return self
