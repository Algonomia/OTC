from pathlib import Path
from typing import Any, Iterable

__all__ = [
    "load_system_prompt",
    "load_obligation_addendum",
    "build_document_packet",
    "build_task_packet",
    "OBLIGATION_TYPE_EXPLANATIONS",
    "get_obligation_explanation",
    "format_obligation_explanation_block",
    "OVERVIEW_USER_TEMPLATE",
    "DEADLINE_USER_TEMPLATE",
    "THRESHOLD_USER_TEMPLATE",
    "PENALTY_IR_USER_TEMPLATE",
    "PENALTY_COMPOSER_USER_TEMPLATE",
    "PENALTY_USER_TEMPLATE",
]


def load_system_prompt(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


OBLIGATION_TYPE_EXPLANATIONS = {
    "AnnualTPForm": (
        "A transfer-pricing-specific annual filing (return/statement/affidavit/certificate) "
        "submitted to the tax authority (often with or near the CIT return) that typically asks "
        "for transfer-pricing methods, arm's-length declarations, and/or confirmations that TP "
        "documentation exists. Do not use this for generic RPT schedules (use "
        "RelatedPartyDisclosure) and do not use this for explicit SIT regimes (use SITDisclosure)."
    ),
    "RelatedPartyDisclosure": (
        "Annual disclosure schedule(s) or informative filing reporting related parties and/or "
        "amounts/types of controlled transactions (often as part of the CIT return, sometimes as "
        "a separate notification/return). Its primary purpose is transparency of RPTs, not "
        "submission of the full Local/Master File narrative. Excludes explicit SIT regimes "
        "(use SITDisclosure)."
    ),
    "SITDisclosure": (
        "A jurisdiction-defined Summary Information Table (SIT) (or explicitly named equivalent) "
        "of intercompany/controlled transactions, typically filed electronically by (or tied to) "
        "the CIT return deadline. Although it functions like a TP return in those jurisdictions, "
        "it is treated as its own obligation because it has a distinctive format and its own "
        "penalty/threshold logic."
    ),
    "MasterFile": (
        "OECD Action 13 group-level TP documentation (or close equivalent) describing the "
        "multinational group, value chain, intangibles, financing, and global allocation. Usually "
        "prepared annually and provided upon request or via prescribed filing mechanisms where "
        "required."
    ),
    "MasterFileNotification": (
        "Procedural notice designating which entity will file a single Master File (or equivalent "
        "notification requirement) where required. Separate from actually preparing or submitting "
        "the Master File content."
    ),
    "LocalFile": (
        "OECD Action 13 entity-level TP documentation (or close equivalent) covering local "
        "controlled transactions, functional analysis, benchmarking/economic analysis, and "
        "financials. Usually prepared annually and provided upon request or via prescribed filing "
        "mechanisms where required."
    ),
    "SpecialItemFile": (
        "Additional TP documentation required for specific arrangements/transaction types beyond "
        "Local File/Master File (e.g., cost sharing arrangements, thin capitalization/financing, "
        "or other specific files required by local rules)."
    ),
    "ContemporaneousTPDocumentation": (
        "A contemporaneous TP report/study/documentation file required to be prepared and "
        "maintained (and often provided upon request) where the jurisdiction does not use OECD "
        "'Local File/Master File' labels or uses a different but comparable documentation format."
    ),
    "AnnualAPAReport": (
        "Annual report/certification demonstrating compliance with an Advance Pricing Agreement "
        "for the covered period, including any required computations, testing, and representations."
    ),
    "CbCR": (
        "Annual OECD Action 13 group report showing revenue, profit, employees, and taxes by "
        "jurisdiction for in-scope MNE groups."
    ),
    "CbCRNotification": (
        "Procedural notice identifying the CbCR reporting entity and/or where the CbCR will be "
        "filed (e.g., UPE/SPE/EU-designated entity notification). It may be filed via the CIT "
        "return, a separate form, and/or a separate portal depending on jurisdiction."
    ),
    "PublicCbCR": (
        "Public disclosure/lodgment of specified CbCR-type data where required (e.g., EU public "
        "CbCR rules as implemented locally)."
    ),
    "USSec6662Documentation": (
        "US contemporaneous documentation maintained to support penalty protection under IRC "
        "6662(e)/(h) for covered intercompany pricing."
    ),
    "PEAuxiliaryCalculation": (
        "Additional schedules, calculations, or documentation specifically required to support "
        "transfer pricing/profit attribution for Permanent Establishments under local rules."
    ),
    "GIR": (
        "Group-level information return under the OECD/G20 Pillar Two GloBE rules (minimum tax), "
        "where implemented."
    ),
    "GIRNotification": (
        "Procedural notice designating the entity responsible for filing the GIR (or equivalent "
        "Pillar Two return), where required."
    ),
    "QDMTT": (
        "Return and/or schedules for a jurisdiction's Qualified Domestic Minimum Top-up Tax "
        "(QDMTT) under Pillar Two, where implemented."
    ),
}

_OBLIGATION_TYPE_EXPLANATIONS_NORMALIZED = {
    key.lower(): value for key, value in OBLIGATION_TYPE_EXPLANATIONS.items()
}


def get_obligation_explanation(obligation_type: str) -> str:
    if not obligation_type:
        return ""
    explanation = OBLIGATION_TYPE_EXPLANATIONS.get(obligation_type)
    if explanation:
        return explanation
    return _OBLIGATION_TYPE_EXPLANATIONS_NORMALIZED.get(obligation_type.lower(), "")


def format_obligation_explanation_block(obligation_type: str) -> str:
    explanation = get_obligation_explanation(obligation_type)
    if not explanation:
        return ""
    return f"Obligation explanation: {explanation}"


def _packet_value(value: Any) -> str:
    if value is None:
        return ""
    return str(value)


def _read_first_existing(paths: Iterable[Path]) -> str:
    for path in paths:
        if path.exists() and path.is_file():
            return path.read_text(encoding="utf-8").strip()
    return ""


def load_obligation_addendum(addendum_dir: str | Path, obligation_type: str) -> str:
    """Load an obligation-specific addendum prompt, with a safe textual fallback."""
    if not obligation_type:
        return ""

    addendum_root = Path(addendum_dir)
    preferred = addendum_root / f"sys_prompt_obligation_addendum_{obligation_type}.txt"
    versioned = sorted(addendum_root.glob(f"sys_prompt_obligation_addendum_{obligation_type}_v*.txt"), reverse=True)
    wildcard = sorted(addendum_root.glob(f"sys_prompt_obligation_addendum_{obligation_type}*.txt"), reverse=True)
    found = _read_first_existing([preferred, *versioned, *wildcard])
    if found:
        return found

    fallback = get_obligation_explanation(obligation_type)
    if not fallback:
        return ""
    return (
        f"OBLIGATION CONTEXT ADDENDUM — {obligation_type}\n\n"
        "Definition\n"
        f"- {fallback}"
    )


def build_document_packet(
    *,
    source_id: Any,
    source_name: str,
    organization: str,
    organization_type_id: str,
    jurisdiction_iso2: str,
    jurisdiction: str,
    source_text: str,
) -> str:
    return (
        "DOCUMENT PACKET (DATA ONLY)\n\n"
        f"source_id: {_packet_value(source_id)}\n"
        f"source_name: {_packet_value(source_name)}\n"
        f"organization: {_packet_value(organization)}\n"
        f"organization_type_id: {_packet_value(organization_type_id)}\n"
        f"jurisdiction_iso2: {_packet_value(jurisdiction_iso2)}\n"
        f"jurisdiction: {_packet_value(jurisdiction)}\n\n"
        "BEGIN_SOURCE_TEXT\n"
        f"{_packet_value(source_text)}\n"
        "END_SOURCE_TEXT"
    )


def build_task_packet(
    *,
    task_type: str,
    jurisdiction: str,
    obligation_type_id: str,
    task_context: str,
    task_spec_instructions: str,
    obligation_addendum: str,
) -> str:
    parts = [
        "TASK PACKET (AUTHORITATIVE)",
        "",
        f"task_type: {_packet_value(task_type)}",
        f"jurisdiction: {_packet_value(jurisdiction)}",
        f"obligation_type_id: {_packet_value(obligation_type_id)}",
    ]

    context_block = (task_context or "").strip()
    if context_block:
        parts.extend(["", context_block])

    parts.extend(
        [
            "",
            "========================",
            "TASK-SPEC INSTRUCTIONS",
            "========================",
            (task_spec_instructions or "").strip(),
        ]
    )

    addendum_block = (obligation_addendum or "").strip()
    if addendum_block:
        parts.extend(
            [
                "",
                "========================",
                "OBLIGATION CONTEXT ADDENDUM",
                "========================",
                addendum_block,
            ]
        )

    return "\n".join(parts)


OVERVIEW_USER_TEMPLATE = """\
requested_overview_indicators: {requested_indicators}
obligation_type: {obligation_type}
{obligation_explanation_block}
"""

DEADLINE_USER_TEMPLATE = """\
requested_deadline_indicators: {requested_indicators}
obligation_type: {obligation_type}
{obligation_explanation_block}
"""

THRESHOLD_USER_TEMPLATE = """\
requested_threshold_indicators: {requested_indicators}
obligation_type: {obligation_type}
{obligation_explanation_block}
"""

PENALTY_IR_USER_TEMPLATE = """\
requested_penalty_indicators: {requested_indicators}
obligation_type: {obligation_type}
{obligation_explanation_block}
"""

PENALTY_COMPOSER_USER_TEMPLATE = """\
obligation_type: {obligation_type}
{obligation_explanation_block}

penalty_ir_json:
{penalty_ir_json}
"""

# Backwards-compatible alias for legacy imports
PENALTY_USER_TEMPLATE = PENALTY_IR_USER_TEMPLATE
