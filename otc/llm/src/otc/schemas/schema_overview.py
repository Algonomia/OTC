from typing import Any, Dict, Generic, List, Optional, TypeVar
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

# -------------------------
# Shared primitives / enums
# -------------------------

class IsObligationInPlace(str, Enum):
    InPlace = "InPlace"              # regulation exists and is in effect
    NotEnforced = "NotEnforced"      # exists but explicitly not enforced / voluntary / optional
    NotExist = "NotExist"            # repealed/no longer in effect/does not exist

class ScopeOfObligation(str, Enum):
    Group = "Group"                  # consolidated obligations (e.g., CbCR global)
    TaxGroup = "TaxGroup"            # local tax grouping requirement
    Entity = "Entity"                # local entity-based obligation

class FilingResponsibility(str, Enum):
    LocalEntity = "LocalEntity"
    HeadOfTaxGroup = "HeadOfTaxGroup"
    FilingConstituentEntity = "FilingConstituentEntity"  # surrogate within group

class YesNo(str, Enum):
    Yes = "Yes"
    No = "No"

class ApplicableEntityType(str, Enum):
    Company = "Company"
    PE = "PE"                        # Permanent Establishment
    Partnership = "Partnership"
    TrustFoundation = "Trust/Foundation"
    Other = "Other"                  # requires notes to specify

class SubmissionMethod(str, Enum):
    Electronic = "Electronic"
    Paper = "Paper"
    UponRequest = "UponRequest"
    NoDirectFiling = "NoDirectFiling"
    Mixed = "Mixed"
    NotApplicable = "NotApplicable"  # explicitly stated as not applicable / no submission channel
    Other = "Other"

class EnglishAccepted(str, Enum):
    FullyAccepted = "FullyAccepted"
    PartlyAccepted = "PartlyAccepted"
    AcceptedWithTranslationRequired = "AcceptedWithTranslationRequired"
    NotAccepted = "NotAccepted"
    NotApplicable = "NotApplicable"  # explicitly stated as N/A

# ISO codes
ISO2 = str  # upstream provides the jurisdiction in ISO-2 (e.g., "FR", "CN")
# Local language codes are ISO 639-1 (lowercase 2-letter; e.g., "fr", "de", "en")
ISO639_1 = str

# -------------------------
# Indicator key enumeration
# (useful for "indicators_requested" metadata)
# -------------------------
class OverviewIndicatorKey(str, Enum):
    IsObligationInPlace = "IsObligationInPlace"
    ScopeOfObligation = "ScopeOfObligation"
    FilingResponsibility = "FilingResponsibility"
    ParentFilingExemption = "ParentFilingExemption"
    ApplicableEntityTypes = "ApplicableEntityTypes"
    SubmissionMethod = "SubmissionMethod"
    LocalLanguage = "LocalLanguage"
    EnglishAccepted = "EnglishAccepted"

# -------------------------
# Generic Indicator container
# -------------------------
T = TypeVar("T")

class Indicator(BaseModel, Generic[T]):
    """
    Standard wrapper for every indicator:

      - value: the extracted value (typed), or None when not found
      - notes: brief rationale / summary of relevant source passage(s)
      - references: merged page + legal references as ONE string:
          "referred pages in the source text: 1,2,3; legal references mentioned in the source text: Art. 5, Decree X"
        If only one exists, include only that part. If neither exists, use empty string "".
      - additional_values: values for related sub-filings (sub-obligations) under the same main obligation.
        Format: { "<SubObligationName>": <same-typed value or null>, ... }
        Note: these are used only for certain main obligations (AnnualTPForm/MasterFile/LocalFile/ContemporaneousTPDocumentation),
        but the schema keeps this generic.
    """
    value: Optional[T] = Field(default=None)
    notes: Optional[str] = Field(default=None)
    references: str = Field(default="", description="Merged references: pages + legal refs (single string).")
    additional_values: Dict[str, Optional[T]] = Field(default_factory=dict)

    model_config = ConfigDict(extra="forbid")

# Obligation implementation details (unstructured text fields to capture nuances beyond the indicators)
class ObligationImplementation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    implementation_summary: Optional[str] = None                # optional but preferred, 1–2 sentences
    downstream_search_focus: Optional[str] = None          # optional but required, 1 sentence
    aliases_in_text: Optional[List[str]] = None
    distinct_components: Optional[List[str]] = None

# -------------------------
# Overview Indicators (typed payload)
# -------------------------
class OverviewIndicators(BaseModel):
    """
    Payload with all known Overview indicators for ONE (jurisdiction, obligation_type) pair.

    All fields are optional; populate only those requested.
    If IsObligationInPlace == NotExist, leave the rest as None (the validator will enforce clearing).
    """
    is_obligation_in_place: Optional[Indicator[IsObligationInPlace]] = None
    scope_of_obligation: Optional[Indicator[ScopeOfObligation]] = None
    filing_responsibility: Optional[Indicator[FilingResponsibility]] = None
    parent_filing_exemption: Optional[Indicator[bool]] = None
    applicable_entity_types: Optional[Indicator[List[ApplicableEntityType]]] = None
    submission_method: Optional[Indicator[List[SubmissionMethod]]] = None
    local_language: Optional[Indicator[List[ISO639_1]]] = None
    english_accepted: Optional[Indicator[EnglishAccepted]] = None
    obligation_implementation: Optional[ObligationImplementation] = None


    model_config = ConfigDict(extra="forbid")

    # ---- Validators ----

    @model_validator(mode="after")
    def _gate_when_not_exist(self) -> "OverviewIndicators":
        """
        If IsObligationInPlace == NotExist, clear all other indicators (no need to continue).
        """
        iop = self.is_obligation_in_place.value if self.is_obligation_in_place else None
        if iop == IsObligationInPlace.NotExist:
            # Keep IsObligationInPlace as provided; blank everything else.
            self.scope_of_obligation = None
            self.filing_responsibility = None
            self.parent_filing_exemption = None
            self.applicable_entity_types = None
            self.submission_method = None
            self.local_language = None
            self.english_accepted = None
        return self

    @field_validator("local_language")
    @classmethod
    def _normalize_lang_codes(cls, v: Optional[Indicator[List[ISO639_1]]]) -> Optional[Indicator[List[ISO639_1]]]:
        """
        Force ISO 639-1 codes to lowercase 2-letter. If any code is malformed, raise.
        """
        if v and v.value:
            lowered: List[str] = []
            for code in v.value:
                if not isinstance(code, str):
                    raise ValueError("LocalLanguage codes must be strings.")
                c = code.strip().lower()
                if len(c) != 2 or not c.isalpha():
                    raise ValueError(f"Invalid ISO 639-1 code: {code}")
                lowered.append(c)
            v.value = lowered
        return v

    @field_validator("applicable_entity_types")
    @classmethod
    def _require_notes_if_other_entity(cls, v: Optional[Indicator[List[ApplicableEntityType]]]) -> Optional[Indicator[List[ApplicableEntityType]]]:
        """
        If 'Other' is present, require notes describing what 'Other' means.
        """
        if v and v.value and ApplicableEntityType.Other in v.value:
            if not v.notes or not v.notes.strip():
                raise ValueError("When ApplicableEntityTypes includes 'Other', 'notes' must specify what it refers to.")
        return v

    @field_validator("submission_method")
    @classmethod
    def _require_notes_if_other_submission(cls, v: Optional[Indicator[List[SubmissionMethod]]]) -> Optional[Indicator[List[SubmissionMethod]]]:
        """
        If 'Other' is present, require notes explaining the method.
        """
        if v and v.value and SubmissionMethod.Other in v.value:
            if not v.notes or not v.notes.strip():
                raise ValueError("When SubmissionMethod includes 'Other', 'notes' must explain the method.")
        return v

# -------------------------
# Output envelope for ONE (jurisdiction, obligation) query
# -------------------------
class OTCOverviewRow(BaseModel):
    """
    Minimal payload expected from the LLM. Upstream metadata is merged separately.
    """
    # The extracted indicators (null if j/o not present in source text)
    data: Optional[OverviewIndicators] = None

    model_config = ConfigDict(extra="forbid")
