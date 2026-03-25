from __future__ import annotations

import json
from functools import lru_cache
from typing import Any, Dict, List

import pycountry

OBLIGATION_CATALOG_PLACEHOLDER = "{{OBLIGATION_CATALOG_JSON}}"

OBLIGATION_DICTIONARY_RAW = [
    {
        "value": "AnnualTPForm",
        "user_label": "Annual TP form / TP return",
        "explanation": """- AnnualTPForm = a transfer-pricing-specific ANNUAL filing / return / statement / information form submitted to the tax authority (often with or near the corporate income tax return).
        - In some jurisdictions, this AnnualTPForm is explicitly named a “Summary Information Table” (SIT) or “SIT disclosure/filing” (or a clearly equivalent “summary information table” regime). Those SIT-style filings ARE INCLUDED in AnnualTPForm.
        - Related Party Disclosures are NOT considered as AnnualTPForm."""
    },
    {
        "value": "MasterFile",
        "user_label": "Master File",
        "explanation": "Group-level TP documentation describing the multinational group, value chain, intangibles, financing, and global allocation."
    },
    {
        "old_raw_item": "LocalFile",
        "value": "LocalFile",
        "user_label": "Local File",
        "explanation": """- LocalFile is now an umbrella obligation for substantive transfer pricing (TP) documentation requirements, including BOTH:
        A) OECD/BEPS Action 13 “Local File” regimes (explicit “Local File” framing), AND
        B) Non‑Action‑13 “contemporaneous TP documentation” regimes (TP study/report/file) where the jurisdiction does not use Action 13 labels.
        - IMPORTANT: This obligation EXCLUDES clearly “simplified / short‑form / light / abbreviated” TP documentation regimes that are described as a distinct alternative. Those belong to the separate obligation SimplifiedTPDocumentation."""
    },
    {
        "old_raw_item": "CbCR",
        "value": "CbCR",
        "user_label": "CbCR (Country-by-Country Report)",
        "explanation": "Annual group report showing revenues, profits, employees, and taxes by jurisdiction for large MNEs."
    },
    {
        "old_raw_item": "CbCRNotification",
        "value": "CbCRNotification",
        "user_label": "CbCR notification",
        "explanation": "Procedural notice identifying the reporting entity (and, where relevant, filing location) for the CbCR."
    },
    {
        "value": "PublicCbCR",
        "user_label": "Public CbCR (EU)",
        "explanation": "Public disclosure of specified CbCR data where required (e.g., EU public CbCR rules)."
    },
    {
        "value": "RelatedPartyDisclosure",
        "user_label": "Related‑party disclosure",
        "explanation": """- RelatedPartyDisclosure = an annual related-party transaction (RPT) disclosure / controlled transaction notification / schedule.
        - Its primary purpose is transparency of related parties and/or controlled transaction amounts/types.
        - It is DISTINCT from AnnualTPForm (a TP statement/return/form with broader TP compliance content, including Summary Information Table)."""
    },
    {
        "value": "SimplifiedTPDocumentation",
        "user_label": "Simplified TP documentation / short-form Local File",
        "explanation": """- A distinct “simplified / short‑form / light / abbreviated” version of transfer pricing documentation.
        - It is typically a reduced‑content documentation package compared to the full Local File documentation.
        - It may be:
        - an alternative allowed for smaller taxpayers / low transaction volumes / safe harbors, OR
        - a mandatory simplified format for certain categories."""
    },
    {
        "value": "CITDueDate",
        "user_label": "CIT return due date",
        "explanation": "Deadline for filing the corporate income tax (CIT) return."
    },
]


@lru_cache(maxsize=1)
def get_jurisdiction_candidates() -> List[str]:
    """Return ISO-3166 alpha-2 named candidates (<name> (<code>))."""
    if pycountry is None:
        return []
    results: List[str] = []
    for country in pycountry.countries:
        name = getattr(country, "name", None)
        alpha_2 = getattr(country, "alpha_2", None)
        if not name or not alpha_2:
            continue
        results.append(f"{name} ({alpha_2})")
    return sorted(results)


OBLIGATION_LABEL_MAP = {
    entry["value"]: entry.get("user_label") or entry["value"]
    for entry in OBLIGATION_DICTIONARY_RAW
    if entry.get("value")
}


@lru_cache(maxsize=1)
def get_obligation_catalog() -> List[Dict[str, Any]]:
    """Return a normalized obligation catalog for labeler prompt + validation."""
    catalog: List[Dict[str, Any]] = []
    seen = set()
    for entry in OBLIGATION_DICTIONARY_RAW:
        value = str(entry.get("value") or "").strip()
        if not value or value in seen:
            continue
        seen.add(value)

        item: Dict[str, Any] = {
            "value": value,
            "user_label": str(entry.get("user_label") or value),
            "explanation": str(entry.get("explanation") or ""),
        }
        old_raw_item = entry.get("old_raw_item")
        if old_raw_item:
            item["old_raw_item"] = str(old_raw_item)
        catalog.append(item)
    return catalog


@lru_cache(maxsize=1)
def get_allowed_obligation_values() -> tuple[str, ...]:
    return tuple(item["value"] for item in get_obligation_catalog())


@lru_cache(maxsize=1)
def format_obligation_catalog_json() -> str:
    return json.dumps(get_obligation_catalog(), ensure_ascii=False, indent=2)


def render_chunk_labeler_system_prompt(prompt_template: str) -> str:
    """
    Render the chunk-labeler system prompt from a template and canonical catalog.
    If a placeholder is present, replace it. Otherwise append a generated catalog block.
    """
    catalog_json = format_obligation_catalog_json()
    if OBLIGATION_CATALOG_PLACEHOLDER in prompt_template:
        return prompt_template.replace(OBLIGATION_CATALOG_PLACEHOLDER, catalog_json)

    marker = "Possible values for obligation_type and their explanation:"
    if marker in prompt_template:
        prefix = prompt_template.split(marker, 1)[0].rstrip()
        return f"{prefix}\n\n{marker}\n{catalog_json}\n"
    return f"{prompt_template.rstrip()}\n\n{marker}\n{catalog_json}\n"


@lru_cache(maxsize=1)
def get_obligation_candidates() -> List[str]:
    """Return unique obligation candidates in '<user_label> (<value>)' format."""
    results: List[str] = []
    for entry in get_obligation_catalog():
        value = entry["value"]
        label = entry["user_label"] or value
        results.append(f"{label} ({value})")
    return results


def format_obligation_value(value: str) -> str:
    clean = value.strip()
    label = OBLIGATION_LABEL_MAP.get(clean, clean)
    return f"{label} ({clean})"


__all__ = [
    "OBLIGATION_CATALOG_PLACEHOLDER",
    "get_obligation_catalog",
    "get_allowed_obligation_values",
    "format_obligation_catalog_json",
    "get_jurisdiction_candidates",
    "get_obligation_candidates",
    "format_obligation_value",
    "render_chunk_labeler_system_prompt",
]
