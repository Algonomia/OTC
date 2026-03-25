"""Pydantic schema for OTC Threshold / Penalty / Deadline extraction.

This schema implements the UPDATED (flat) ComplexValue format:

IComplexValue is exactly one of:
- OperationValue: { type: 'operation', operator_id: string, args: IComplexValue[] }
- TagValue:       { type: 'tag', scope?: 'group'|'entity'|'child_entity'|'parent_entity'|'ultimate_parent_entity'|'rpt_entity', years_ago?: int, is_custom: bool, expected_type: EBaseTypes, value: string }
- ConstantValue:  { type: 'constant', expected_type: EBaseTypes, value: T, unit?: string, dimension?: string }

Project-specific decisions (requested):
- `aggregate_by` is intentionally NOT modeled here (out of scope for LLM generation).
- `range` and `period_range` are intentionally NOT modeled as base types/constants.
  - Any range/interval (numeric/date/period) must be represented via the `to_range(...)` operator.
- Tag explanations are NOT stored inside TagValue. Instead, rule outputs include `tag_notes` at the same level as `value`.
  - tag_notes keys must correspond to tags actually used inside `value`.
- Sub-obligations: rule outputs may include `additional_values` mapping sub-obligation name -> IComplexValue.
  - This is used only when the user prompt requests sub-obligation extraction.

OperatorId list follows Update on operators_updated.txt.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List, Optional, Set, Union, Literal, Annotated

from pydantic import BaseModel, ConfigDict, Field, model_validator


# ---------------------------------------------------------------------------
# Base types
# ---------------------------------------------------------------------------
class EBaseTypes(str, Enum):
    STRING = "string"
    DATE = "date"  # unix timestamp in seconds
    NUMERIC = "numeric"
    BOOLEAN = "boolean"
    PERIOD = "period"
    DAY_MONTH = "day_month"


class DayMonth(BaseModel):
    model_config = ConfigDict(extra="forbid")

    day: int = Field(ge=1, le=31)
    month: int = Field(ge=1, le=12)


class DayCountType(str, Enum):
    DEFAULT = "Default"
    CALENDAR = "CalendarDays"
    WEEKDAYS = "WeekDays"
    BUSINESS = "BusinessDays"


class PeriodUnit(str, Enum):
    DAYS = "Days"
    WEEKS = "Weeks"
    MONTHS = "Months"
    YEARS = "Years"


class Period(BaseModel):
    model_config = ConfigDict(extra="forbid")

    value: float = Field(ge=0)
    unit: PeriodUnit
    dayCountType: DayCountType = DayCountType.DEFAULT


# ---------------------------------------------------------------------------
# Tags
# ---------------------------------------------------------------------------
class ThresholdPenaltyTagName(str, Enum):
    # Threshold quantities
    REVENUE = "revenue"
    TRANSACTION_VOLUME_AMOUNT = "transaction_volume_amount"
    BALANCE_SHEET_TOTAL_ASSETS = "balance_sheet_total_assets"
    PROFIT_MARGIN = "profit_margin"
    EMPLOYEE_COUNT = "employee_count"
    OWNERSHIP_PERCENTAGE = "ownership_percentage"
    ENTITY_TYPE = "entity_type"

    # Penalty bases / counters
    UNPAID_TAX_AMOUNT = "unpaid_tax_amount"
    TP_ADJUSTMENT_AMOUNT = "tp_adjustment_amount"
    NUMBER_OF_ERRORS = "number_of_errors"
    NUMBER_OF_DAYS = "number_of_days"
    NUMBER_OF_MONTHS = "number_of_months"

    # Penalty triggers (boolean)
    NOT_SUBMITTED_ON_TIME = "not_submitted_on_time"
    FAILURE_TO_SUBMIT = "failure_to_submit"
    INCOMPLETE_DOCUMENTATION = "incomplete_documentation"
    HAS_ERRORS_OR_OMISSIONS = "has_errors_or_omissions"
    FAILURE_TO_MAINTAIN_DOCUMENTATION = "failure_to_maintain_documentation"
    FAILURE_TO_PROVIDE_UPON_REQUEST = "failure_to_provide_upon_request"
    REPEAT_OFFENSE = "repeat_offense"
    WILLFUL_MISCONDUCT = "willful_misconduct"
    FRAUD = "fraud"

    # A commonly used boolean helper
    HAS_DOCUMENTATION = "has_documentation"


class DeadlineTagName(str, Enum):
    FISCAL_YEAR_END = "fiscal_year_end"
    FISCAL_YEAR_START = "fiscal_year_start"
    CIT_RETURN_DUE_DATE = "cit_return_due_date"
    REQUEST_DATE = "request_date"
    TAX_AUDIT_DATE = "tax_audit_date"
    PAYMENT_DUE_DATE = "payment_due_date"
    REFERENCE_YEAR = "reference_year"



# ---------------------------------------------------------------------------
# Operators
# ---------------------------------------------------------------------------
class OperatorId(str, Enum):
    IF = "if"

    AND = "&&"
    OR = "||"
    NOT = "!"
    IS_TRUE = "!!"

    GT = ">"
    GTE = ">="
    LT = "<"
    LTE = "<="
    EQ = "=="

    MUL = "*"
    ADD = "+"
    SUB = "-"
    DIV = "/"

    MIN = "min"
    MAX = "max"
    MOD = "%"

    OPPOSITE = "opp"
    INVERSE = "inv"
    ABS = "abs"
    AVG = "avg"
    GEO_AVG = "geo_avg"
    SUM_ABS = "sum_abs"
    ABS_SUM = "abs_sum"

    SUM_WHEN_TRUE = "sum_when_true"
    CONCAT = "concat"
    CONCAT_WHEN_TRUE = "concat_when_true"

    NEXT_MD_AFTER = "next_md_after"
    DATE_ADD = "date_add"
    DATE_SUB = "date_sub"
    DATE_MIN = "date_min"
    DATE_MAX = "date_max"
    BOM = "bom"
    EOM = "eom"

    TO_RANGE = "to_range"

    DATE_FROM = "date_from"
    EXTRACT_DAY = "extract_day"
    EXTRACT_MONTH = "extract_month"
    EXTRACT_YEAR = "extract_year"
    EXTRACT_DAY_MONTH = "extract_day_month"

# ---------------------------------------------------------------------------
# ComplexValue nodes (flat)
# ---------------------------------------------------------------------------
class ConstantValue(BaseModel):
    """Flat constant node.

    Numeric constants may include unit/dimension.
    Any range/interval MUST be represented via OperationValue(operator_id='to_range', args=[...]).
    """

    model_config = ConfigDict(extra="forbid")

    type: Literal["constant"] = "constant"
    expected_type: EBaseTypes
    value: Any

    # Only used when expected_type == numeric
    unit: Optional[str] = None
    dimension: Optional[str] = None

    @model_validator(mode="after")
    def _validate_constant(self):
        et = self.expected_type

        # Disallow unit/dimension unless numeric
        if et != EBaseTypes.NUMERIC and (self.unit is not None or self.dimension is not None):
            raise ValueError("unit/dimension are only allowed for numeric constants")

        if et == EBaseTypes.STRING:
            if not isinstance(self.value, str):
                raise ValueError("string constant: value must be a string")

        elif et == EBaseTypes.DATE:
            if not isinstance(self.value, int):
                raise ValueError("date constant: value must be an int UNIX timestamp (seconds)")

        elif et == EBaseTypes.NUMERIC:
            if not isinstance(self.value, (int, float)):
                raise ValueError("numeric constant: value must be a number")

        elif et == EBaseTypes.BOOLEAN:
            if not isinstance(self.value, bool):
                raise ValueError("boolean constant: value must be a boolean")

        elif et == EBaseTypes.PERIOD:
            if isinstance(self.value, dict):
                self.value = Period.model_validate(self.value)
            if not isinstance(self.value, Period):
                raise ValueError("period constant: value must be a Period object")

        elif et == EBaseTypes.DAY_MONTH:
            if isinstance(self.value, dict):
                self.value = DayMonth.model_validate(self.value)
            if not isinstance(self.value, DayMonth):
                raise ValueError("day_month constant: value must be a DayMonth object")

        else:
            raise ValueError(f"Unsupported expected_type: {et}")

        return self


class TagValue(BaseModel):
    """Flat tag node.

    - value must be namespaced: 'threshold_penalty.<name>' or 'deadline.<name>'.
    - scope is optional and captures whether the tag refers to the whole group's or a certain entity's values.
    - years_ago captures which prior fiscal year is referenced:
      - 0 = current fiscal year (default)
      - 1 = previous fiscal year, etc.
    - Tag explanations belong in OTCRuleBase.tag_notes (NOT inside the tag).
    """

    model_config = ConfigDict(extra="forbid")

    type: Literal["tag"] = "tag"
    scope: Optional[Literal["group", "entity", "child_entity", "parent_entity", "ultimate_parent_entity", "rpt_entity"]] = None
    years_ago: int = Field(default=0, ge=0)

    is_custom: bool = False
    expected_type: EBaseTypes
    value: str

    @model_validator(mode="after")
    def _validate_tag(self):
        if "." not in self.value:
            raise ValueError(
                "tag.value must include a namespace prefix, e.g. 'threshold_penalty.revenue' or 'deadline.fiscal_year_end'"
            )

        namespace, name = self.value.split(".", 1)
        if namespace not in {"threshold_penalty", "deadline"}:
            raise ValueError("tag namespace must be 'threshold_penalty' or 'deadline'")

        threshold_predefined = {t.value for t in ThresholdPenaltyTagName}
        deadline_predefined = {t.value for t in DeadlineTagName}

        is_predefined = (
            (namespace == "threshold_penalty" and name in threshold_predefined)
            or (namespace == "deadline" and name in deadline_predefined)
        )

        if is_predefined and self.is_custom:
            raise ValueError("predefined tags must set is_custom=false")

        if (not is_predefined) and (not self.is_custom):
            raise ValueError("custom tags (not in the predefined list) must set is_custom=true")

        return self


class OperationValue(BaseModel):
    """Flat operation node."""

    model_config = ConfigDict(extra="forbid")

    type: Literal["operation"] = "operation"
    operator_id: OperatorId
    args: List["IComplexValue"] = Field(default_factory=list)

    @model_validator(mode="after")
    def _validate_operation(self):
        n = len(self.args)
        op = self.operator_id

        if op == OperatorId.IF:
            if n < 2:
                raise ValueError("if requires at least 2 arguments")

        if op == OperatorId.SUM_WHEN_TRUE:
            if n < 2 or (n % 2) != 0:
                raise ValueError("sum_when_true requires an even number of arguments (>=2): cond1,val1,cond2,val2,...")

        if op == OperatorId.CONCAT_WHEN_TRUE:
            if n < 2 or (n % 2) != 0:
                raise ValueError("concat_when_true requires an even number of arguments (>=2): cond1,val1,cond2,val2,...")

        if op == OperatorId.TO_RANGE:
            if n < 2:
                raise ValueError("to_range requires at least 2 arguments")

        if op in {OperatorId.NOT, OperatorId.IS_TRUE, OperatorId.OPPOSITE, OperatorId.INVERSE, OperatorId.ABS}:
            if n != 1:
                raise ValueError(f"{op.value} requires exactly 1 argument")

        if op in {
            OperatorId.SUB,
            OperatorId.DIV,
            OperatorId.MOD,
            OperatorId.NEXT_MD_AFTER,
            OperatorId.DATE_ADD,
            OperatorId.DATE_SUB,
        }:
            if n != 2:
                raise ValueError(f"{op.value} requires exactly 2 arguments")

        return self


# Discriminated union by 'type'
IComplexValue = Annotated[Union[OperationValue, TagValue, ConstantValue], Field(discriminator="type")]


# ---------------------------------------------------------------------------
# Penalty IR (intermediate representation used by the 2-step penalty prompts)
# ---------------------------------------------------------------------------
class PenaltyIRTrigger(str, Enum):
    NOT_SUBMITTED_ON_TIME = "not_submitted_on_time"
    FAILURE_TO_SUBMIT = "failure_to_submit"
    INCOMPLETE_DOCUMENTATION = "incomplete_documentation"
    HAS_ERRORS_OR_OMISSIONS = "has_errors_or_omissions"
    FAILURE_TO_MAINTAIN_DOCUMENTATION = "failure_to_maintain_documentation"
    FAILURE_TO_PROVIDE_UPON_REQUEST = "failure_to_provide_upon_request"
    REPEAT_OFFENSE = "repeat_offense"
    WILLFUL_MISCONDUCT = "willful_misconduct"
    FRAUD = "fraud"
    HAS_SHORTFALLS = "has_shortfalls"
    OTHER = "other"


class PenaltyIRMode(str, Enum):
    FLAT = "flat"
    PERCENT = "percent"
    MIXED = "mixed"
    TIERED = "tiered"


class PenaltyIRUnit(str, Enum):
    ONE_OFF = "one_off"
    PER_DAY = "per_day"
    PER_RETURN = "per_return"
    PER_ERROR = "per_error"


class PenaltyIRTierCondition(BaseModel):
    model_config = ConfigDict(extra="allow")

    days_late_gte: Optional[int] = None
    days_late_lte: Optional[int] = None


class PenaltyIRTier(BaseModel):
    model_config = ConfigDict(extra="forbid")

    when: Optional[PenaltyIRTierCondition] = None
    per_day: Optional[float] = None
    currency: Optional[str] = None
    cap: Optional[float] = None
    flat_amount: Optional[float] = None


class PenaltyIRQualifiers(BaseModel):
    model_config = ConfigDict(extra="allow")

    with_documentation_percent: Optional[float] = None
    without_documentation_percent: Optional[float] = None
    repeat_multiplier: Optional[float] = None


class PenaltyIRPenaltySpec(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mode: PenaltyIRMode
    unit: Optional[PenaltyIRUnit] = None
    currency: Optional[str] = None
    flat_amount: Optional[float] = None
    percent: Optional[float] = None
    percent_base_tag: Optional[str] = None

    tiers: List[PenaltyIRTier] = Field(default_factory=list)

    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    cap_amount: Optional[float] = None

    qualifiers: Optional[PenaltyIRQualifiers] = None
    notes: Optional[str] = None


class PenaltyIREvidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    pages: List[int] = Field(default_factory=list)
    quote: Optional[str] = None


class PenaltyIRCase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Optional: when sub-obligations are requested, indicate which obligation the case applies to.
    # - None (or missing) = main obligation (obligation_enum)
    # - Otherwise: one of the requested sub-obligation names, e.g. "SITDisclosure".
    applies_to: Optional[str] = None

    trigger_id: PenaltyIRTrigger
    trigger_label: str
    evidence: PenaltyIREvidence
    penalty: PenaltyIRPenaltySpec
    required_tags: List[str] = Field(default_factory=list)


class PenaltyIRComposeHint(str, Enum):
    EXCLUSIVE = "exclusive"
    ACCUMULATE = "accumulate"


class OTCPenaltyIR(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_id: str
    jurisdiction_iso2: str
    obligation_enum: str

    page_reference: List[int] = Field(default_factory=list)
    legal_reference: List[str] = Field(default_factory=list)
    note: Optional[str] = None

    cases: List[PenaltyIRCase] = Field(default_factory=list)
    compose_hint: PenaltyIRComposeHint = PenaltyIRComposeHint.EXCLUSIVE
    uncertainties: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Rule outputs
# ---------------------------------------------------------------------------
def _tag_key(value: str, scope: Optional[str], years_ago: int) -> str:
    """Canonical key for tag_notes.

    Format: '<tag_value>@<scope|none>@<years_ago>'
    Examples:
      - 'threshold_penalty.revenue@group@0'
      - 'threshold_penalty.net_income@entity@2'
      - 'deadline.fiscal_year_end@none@0'
    """
    s = scope if scope else "none"
    return f"{value}@{s}@{years_ago}"


def _collect_tag_keys(node: IComplexValue, out: Set[str]) -> None:
    if isinstance(node, TagValue):
        out.add(_tag_key(node.value, node.scope, node.years_ago))
    elif isinstance(node, OperationValue):
        for a in node.args:
            _collect_tag_keys(a, out)
    # constants have no tags


class OTCRuleBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Merged references (pages + legal) as a SINGLE string.
    references: str = ""

    # Human summary (renamed from `note`).
    notes: Optional[str] = None

    # Plain-English tag explanations outside the ComplexValue.
    # Keys must be built using _tag_key(tag.value, tag.scope, tag.years_ago).
    tag_notes: Dict[str, str] = Field(default_factory=dict)

    # Optional sub-obligation values (same IComplexValue type as `value`).
    # When sub-obligations are requested in the user prompt, populate:
    #   additional_values = { "<SubObligationName>": IComplexValue | null, ... }
    # If none are requested, this should be {}.
    additional_values: Dict[str, Optional[IComplexValue]] = Field(default_factory=dict)

    @model_validator(mode="after")
    def _validate_tag_notes_keys_exist_in_value(self):
        value = getattr(self, "value", None)

        keys_in_value: Set[str] = set()
        if value is not None:
            _collect_tag_keys(value, keys_in_value)

        # Include tags used in any sub-obligation values.
        for v in (getattr(self, "additional_values", None) or {}).values():
            if v is not None:
                _collect_tag_keys(v, keys_in_value)

        # tag_notes must not contain tags that don't appear in `value` or `additional_values`
        extra = set(self.tag_notes.keys()) - keys_in_value
        if extra:
            raise ValueError(
                "tag_notes contains keys not present as tags in value: " + ", ".join(sorted(extra))
            )

        return self


class OTCRuleThresholdPenalty(OTCRuleBase):
    value: Optional[IComplexValue] = None


class OTCRuleDeadline(OTCRuleBase):
    value: Optional[IComplexValue] = None


class OTCDeadlineResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    deadline_preparation: Optional[OTCRuleDeadline] = None
    deadline_filing: Optional[OTCRuleDeadline] = None
    deadline_extension: Optional[OTCRuleDeadline] = None

class OTCThresholdResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    threshold_preparation: Optional[OTCRuleThresholdPenalty] = None
    threshold_filing: Optional[OTCRuleThresholdPenalty] = None


# Rebuild forward refs
OperationValue.model_rebuild()
OTCPenaltyIR.model_rebuild()
OTCRuleThresholdPenalty.model_rebuild()
OTCRuleDeadline.model_rebuild()
OTCDeadlineResult.model_rebuild()
OTCThresholdResult.model_rebuild()
