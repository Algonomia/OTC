"""
post_generation_checks.py

Deterministic post-generation validation for ComplexValue expression trees.

Goal
----
This checker is intentionally *stricter than Pydantic* and is designed to catch
LLM-generation mistakes that often pass structural validation but fail downstream
execution or business semantics.

Key features
------------
- Clear, prompt-ready ERROR/WARNING messages that explain:
    (a) where the issue is (path),
    (b) what is wrong,
    (c) what to do to fix it (hint).
- Separates errors vs warnings for easier pipeline integration.
- Keeps a backward-compatible helper that returns only errors as {key: [reasons]}.

Input
-----
extraction: dict[str, Any]
    Mapping from ComplexValue_key -> ComplexValue_value.
    Each value may be:
      - dict (ComplexValue node),
      - JSON string containing that dict,
      - None / "" (treated as missing and not validated).

Output (recommended)
--------------------
extra_schema_check_report(...) -> dict[str, {"errors":[...], "warnings":[...]}]
    Returns only keys with ERRORS by default (warnings included alongside errors).

Backward-compatible output
--------------------------
extra_schema_check(...) -> dict[str, list[str]]
    Returns only ERROR messages as a flat list of strings per key.

Assumptions about node shapes (flat schema)
-------------------------------------------
- operation: {"type":"operation","operator_id":str,"args":[...]}
- tag: {"type":"tag","expected_type":str,"value":str,"is_custom":bool,"years_ago":int,...}
- constant: {"type":"constant","expected_type":str,"value":...}
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple
import json


# -------------------------
# Operator group definitions
# -------------------------

CONDITIONAL_OPS: Set[str] = {"if", "sum_when_true", "concat_when_true"}

TEST_OPS: Set[str] = {"!", "!!", "==", "<=", "<", ">", ">=", "&&", "||"}

# Pragmatic set; extend as your operator list evolves.
MATH_OPS: Set[str] = {
    "+", "-", "*", "/", "%", "max", "min", "avg", "g_avg", "abs", "inv", "opp",
    "to_range",
}

DATE_OPS: Set[str] = {
    "date_add", "date_sub", "date_diff",
    "date_min", "date_max",
    "next_md_after",
    "bom", "eom",
    "extract_day_month",
}

ALLOWED_BASE_TYPES: Set[str] = {"string", "date", "numeric", "boolean", "period", "day_month"}
DEADLINE_DATE_LIKE_TYPES: Set[str] = {"date", "day_month"}


# -------------------------
# Arity rules (nuanced)
# -------------------------
# Refinements:
# - "!" and "!!" are unary.
# - Some math ops are unary (abs/inv/opp).
# - Comparators allow chained comparisons (>=2 args).

Arity = Tuple[int, Optional[int]]  # (min_args, max_args or None)

TEST_ARITY: Dict[str, Arity] = {
    "!": (1, 1),
    "!!": (1, 1),
    "&&": (2, None),
    "||": (2, None),
    "==": (2, None),
    "<": (2, None),
    "<=": (2, None),
    ">": (2, None),
    ">=": (2, None),
}

CONDITIONAL_ARITY: Dict[str, Arity] = {
    "if": (2, None),
    "sum_when_true": (2, None),     # even-args enforced separately
    "concat_when_true": (2, None),  # even-args enforced separately
}

MATH_ARITY: Dict[str, Arity] = {
    "+": (2, None),
    "-": (2, None),
    "*": (2, None),
    "/": (2, None),
    "%": (2, 2),
    "max": (2, None),
    "min": (2, None),
    "avg": (1, None),
    "g_avg": (1, None),
    "abs": (1, 1),
    "inv": (1, 1),
    "opp": (1, 1),
    "to_range": (1, None),
}

DATE_ARITY: Dict[str, Arity] = {
    "date_add": (2, 2),
    "date_sub": (2, 2),
    "date_diff": (2, 2),
    "date_min": (2, None),
    "date_max": (2, None),
    "next_md_after": (2, 2),
    "bom": (1, 2),   # allow bom(date) or bom(date, dayCountType)
    "eom": (1, 2),   # allow eom(date) or eom(date, dayCountType)
    "extract_day_month": (1, 1),
}


# -------------------------
# Message helpers
# -------------------------
@dataclass(frozen=True)
class Msg:
    severity: str  # "ERROR" | "WARNING"
    path: str
    message: str
    hint: Optional[str] = None

    def render(self) -> str:
        if self.hint:
            return f"{self.severity}: {self.path} — {self.message} Hint: {self.hint}"
        return f"{self.severity}: {self.path} — {self.message}"


def _dedup_msgs(msgs: List[Msg]) -> List[Msg]:
    seen: Set[str] = set()
    out: List[Msg] = []
    for m in msgs:
        key = m.render()
        if key not in seen:
            out.append(m)
            seen.add(key)
    return out


def _err(errors: List[Msg], path: str, message: str, hint: Optional[str] = None) -> None:
    errors.append(Msg("ERROR", path, message, hint))


def _warn(warnings: List[Msg], path: str, message: str, hint: Optional[str] = None) -> None:
    warnings.append(Msg("WARNING", path, message, hint))


# -------------------------
# Type inference (best-effort)
# -------------------------
@dataclass(frozen=True)
class TypeInfo:
    base: Optional[str]           # one of ALLOWED_BASE_TYPES, or None if unknown
    is_range: bool = False        # produced by to_range or propagated
    is_list: bool = False         # produced by concat_when_true (list-like)


def _unify_base(types: Iterable[Optional[str]]) -> Optional[str]:
    bases = [t for t in types if t is not None]
    if not bases:
        return None
    first = bases[0]
    if all(b == first for b in bases):
        return first
    return None


def infer_type(node: Any) -> TypeInfo:
    """Infer the output type of an expression node (best-effort)."""
    if not isinstance(node, dict):
        return TypeInfo(None)

    t = node.get("type")
    if t in ("tag", "constant"):
        base = node.get("expected_type")
        return TypeInfo(base if base in ALLOWED_BASE_TYPES else None)

    if t != "operation":
        return TypeInfo(None)

    op = node.get("operator_id")
    args = node.get("args", [])

    if op in TEST_OPS:
        return TypeInfo("boolean")

    if op in DATE_OPS:
        if op == "extract_day_month":
            return TypeInfo("day_month")
        if op == "date_diff":
            return TypeInfo("numeric")
        return TypeInfo("date")

    if op in MATH_OPS:
        if op == "to_range":
            arg_types = [infer_type(a) for a in args] if isinstance(args, list) else []
            base = _unify_base([ti.base for ti in arg_types])
            return TypeInfo(base, is_range=True)
        return TypeInfo("numeric")

    if op in CONDITIONAL_OPS and isinstance(args, list):
        # sum_when_true / concat_when_true
        if op in ("sum_when_true", "concat_when_true"):
            value_nodes = list(args[1::2])
            value_types = [infer_type(v) for v in value_nodes]
            base = _unify_base([ti.base for ti in value_types])
            is_range = any(ti.is_range for ti in value_types)
            is_list = (op == "concat_when_true")
            return TypeInfo(base, is_range=is_range, is_list=is_list)

        # if
        has_else = (len(args) % 2 == 1)
        value_nodes = list(args[1::2]) + ([args[-1]] if has_else else [])
        value_types = [infer_type(v) for v in value_nodes]
        base = _unify_base([ti.base for ti in value_types])
        is_range = any(ti.is_range for ti in value_types)
        is_list = any(ti.is_list for ti in value_types)
        return TypeInfo(base, is_range=is_range, is_list=is_list)

    return TypeInfo(None)


# -------------------------
# Tree traversal helpers
# -------------------------
def iter_nodes(root: Any) -> Iterable[Tuple[str, Any]]:
    """Yield (path, node) for every dict node in the tree."""
    stack: List[Tuple[str, Any]] = [("root", root)]
    while stack:
        path, node = stack.pop()
        if isinstance(node, dict):
            yield path, node
            if node.get("type") == "operation":
                args = node.get("args", [])
                if isinstance(args, list):
                    for i in range(len(args) - 1, -1, -1):
                        stack.append((f"{path}.args[{i}]", args[i]))


def collect_leaves(root: Any) -> List[Dict[str, Any]]:
    leaves: List[Dict[str, Any]] = []
    for _, node in iter_nodes(root):
        if node.get("type") in ("tag", "constant"):
            leaves.append(node)
    return leaves


def contains_date_signal(root: Any) -> bool:
    """True if subtree contains a deadline date-like tag/constant OR any date operator."""
    for _, node in iter_nodes(root):
        if node.get("type") in ("tag", "constant") and node.get("expected_type") in DEADLINE_DATE_LIKE_TYPES:
            return True
        if node.get("type") == "operation" and node.get("operator_id") in DATE_OPS:
            return True
    return False


# -------------------------
# Small predicate helpers
# -------------------------
def _arity_ok(op: str, args: Any, table: Dict[str, Arity]) -> Optional[str]:
    if not isinstance(args, list):
        return "operation.args must be a list"
    if op not in table:
        return None
    mn, mx = table[op]
    if len(args) < mn:
        return f"operator '{op}' has {len(args)} args but requires at least {mn}"
    if mx is not None and len(args) > mx:
        return f"operator '{op}' has {len(args)} args but allows at most {mx}"
    return None


def _is_bool_condition_head(node: Any) -> bool:
    """Condition arg must be directly a conditional op, test op, or boolean tag."""
    if not isinstance(node, dict):
        return False
    t = node.get("type")
    if t == "tag" and node.get("expected_type") == "boolean":
        return True
    if t == "operation":
        op = node.get("operator_id")
        return (op in CONDITIONAL_OPS) or (op in TEST_OPS)
    return False


def _leaf_summary(node: Any) -> str:
    """Short description used in messages."""
    if not isinstance(node, dict):
        return f"{type(node).__name__}"
    t = node.get("type")
    if t == "tag":
        return f"tag(expected_type={node.get('expected_type')}, value={node.get('value')})"
    if t == "constant":
        return f"constant(expected_type={node.get('expected_type')}, value={node.get('value')})"
    if t == "operation":
        return f"operation({node.get('operator_id')})"
    return f"node(type={t})"


def _all_leaves_are_tags_or_constants(node: Any) -> bool:
    leaves = collect_leaves(node)
    return bool(leaves)  # require at least one leaf


def _all_leaves_are_constant_strings(node: Any) -> bool:
    leaves = collect_leaves(node)
    if not leaves:
        return False
    for l in leaves:
        if l.get("type") != "constant":
            return False
        if l.get("expected_type") != "string":
            return False
        if not isinstance(l.get("value"), str):
            return False
    return True


def _all_leaves_are_numeric_tags_or_constants(node: Any) -> bool:
    leaves = collect_leaves(node)
    if not leaves:
        return False
    for l in leaves:
        if l.get("type") == "tag":
            if l.get("expected_type") != "numeric":
                return False
        elif l.get("type") == "constant":
            if l.get("expected_type") != "numeric":
                return False
            if not isinstance(l.get("value"), (int, float)):
                return False
        else:
            return False
    return True


def _has_numeric_leaf(node: Any) -> bool:
    """True if subtree contains at least one numeric tag or numeric constant leaf."""
    for _, n in iter_nodes(node):
        if n.get("type") == "tag" and n.get("expected_type") == "numeric":
            return True
        if n.get("type") == "constant" and n.get("expected_type") == "numeric":
            v = n.get("value")
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                return True
    return False


def _collect_constant_strings(root: Any) -> List[str]:
    out: List[str] = []
    for _, node in iter_nodes(root):
        if node.get("type") == "constant" and node.get("expected_type") == "string":
            v = node.get("value")
            if isinstance(v, str):
                out.append(v)
    return out


# -------------------------
# Core validations (operator-group rules)
# -------------------------
def validate_tree(root: Any, *, context: Optional[str] = None, key: Optional[str] = None) -> Tuple[List[Msg], List[Msg]]:
    """Validate global operator-group constraints across the full tree."""
    errors: List[Msg] = []
    warnings: List[Msg] = []

    for path, node in iter_nodes(root):
        if not isinstance(node, dict):
            _err(errors, path, "Node must be an object/dict.", "Return a JSON object with fields type/operator_id/args etc.")
            continue

        ntype = node.get("type")
        if ntype not in ("operation", "tag", "constant"):
            _err(errors, path, f"Invalid node.type '{ntype}'.", "Use one of: operation | tag | constant.")
            continue

        # Tag checks
        if ntype == "tag":
            et = node.get("expected_type")
            if et not in ALLOWED_BASE_TYPES:
                _err(errors, path, f"tag.expected_type '{et}' is not allowed.", f"Use one of {sorted(ALLOWED_BASE_TYPES)}.")
            if not isinstance(node.get("value"), str) or not node.get("value"):
                _err(errors, path, "tag.value must be a non-empty string.", "Set tag.value to the namespace.tag_name string.")
            ya = node.get("years_ago", 0)
            if not isinstance(ya, int) or ya < 0:
                _err(errors, path, "tag.years_ago must be an integer >= 0.", "Use 0 for current year, 1 for previous year, etc.")
            continue

        # Constant checks
        if ntype == "constant":
            et = node.get("expected_type")
            if et not in ALLOWED_BASE_TYPES:
                _err(errors, path, f"constant.expected_type '{et}' is not allowed.", f"Use one of {sorted(ALLOWED_BASE_TYPES)}.")
                continue

            v = node.get("value")

            if et == "string":
                if not isinstance(v, str):
                    _err(errors, path, "string constant value must be a string.", "Set constant.value to a string.")
            elif et == "numeric":
                if not isinstance(v, (int, float)):
                    _err(errors, path, "numeric constant value must be a number (int/float).", "Set constant.value to a number.")
            elif et == "boolean":
                if not isinstance(v, bool):
                    _err(errors, path, "boolean constant value must be true/false.", "Set constant.value to a boolean.")
            elif et == "date":
                # Accept int unix timestamp; allow string as warning (some pipelines parse YYYY-MM-DD downstream)
                if not isinstance(v, int):
                    if isinstance(v, str):
                        _warn(warnings, path, "date constant is a string; ensure downstream can parse it.", "Prefer unix timestamp int if required by your runtime.")
                    else:
                        _err(errors, path, "date constant value must be an integer unix timestamp (or a supported date string).", "Set constant.value to a unix timestamp int.")
            elif et == "day_month":
                if not (isinstance(v, dict) and isinstance(v.get("day"), int) and isinstance(v.get("month"), int)):
                    _err(errors, path, "day_month constant must be {day:int, month:int}.", "Set value to e.g. {day: 31, month: 12}.")
                else:
                    if not (1 <= v["month"] <= 12):
                        _err(errors, path, "day_month.month must be between 1 and 12.", "Fix the month number.")
                    if not (1 <= v["day"] <= 31):
                        _err(errors, path, "day_month.day must be between 1 and 31.", "Fix the day number.")
            elif et == "period":
                # Period constants are used in multiple contexts.
                # For DEADLINES we accept any JSON number (int or float) for value, because some
                # generators emit integers as 30.0, etc.
                # For other contexts we keep the older (stricter) requirement: int.
                if not (isinstance(v, dict) and isinstance(v.get("unit"), str)):
                    _err(
                        errors,
                        path,
                        "period constant must be an object with fields {value, unit, dayCountType}.",
                        "Set value to e.g. {value: 3, unit: 'Months', dayCountType:'Default'}.",
                    )
                else:
                    pv = v.get("value")
                    # Period constants use a numeric value. Accept any JSON number (int or float),
                    # and do NOT warn on non-integer values (e.g., 6.5 Months) per updated policy.
                    ok_val = isinstance(pv, (int, float)) and not isinstance(pv, bool)

                    if not ok_val:
                        _err(
                            errors,
                            path,
                            "period constant must be {value:number, unit:str, dayCountType:str}.",
                            "Use a numeric value (int or float), e.g. {value: 3, unit: 'Months', dayCountType:'Default'}.",
                        )
                    else:
                        if "dayCountType" in v and not isinstance(v["dayCountType"], str):
                            _err(errors, path, "period.dayCountType must be a string.", "Use 'Default' or 'BusinessDays'.")
            continue

        # Operation checks
        op = node.get("operator_id")
        args = node.get("args")

        if not isinstance(op, str) or not op:
            _err(errors, path, "operation.operator_id must be a non-empty string.", "Set operator_id to a valid operator name.")
            continue
        if not isinstance(args, list):
            _err(errors, path, "operation.args must be a list.", "Set args to a JSON array.")
            continue

        # Unknown operator warning
        if op not in CONDITIONAL_OPS | TEST_OPS | MATH_OPS | DATE_OPS:
            _warn(
                warnings,
                path,
                f"operator_id '{op}' is not in known operator sets; arity/type checks may be incomplete.",
                "If this operator is valid, add it to the operator sets/arity tables in this checker.",
            )

        # Arity checks
        if op in CONDITIONAL_OPS:
            msg = _arity_ok(op, args, CONDITIONAL_ARITY)
            if msg:
                _err(errors, path, msg, "Fix the number of arguments for this operator.")
        if op in TEST_OPS:
            msg = _arity_ok(op, args, TEST_ARITY)
            if msg:
                _err(errors, path, msg, "Fix the number of arguments for this operator.")
        if op in MATH_OPS:
            msg = _arity_ok(op, args, MATH_ARITY)
            if msg:
                _err(errors, path, msg, "Fix the number of arguments for this operator.")
        if op in DATE_OPS:
            msg = _arity_ok(op, args, DATE_ARITY)
            if msg:
                _err(errors, path, msg, "Fix the number of arguments for this operator.")

        # A) Conditional operators: alternating condition/value semantics
        if op in ("sum_when_true", "concat_when_true", "if"):
            if op in ("sum_when_true", "concat_when_true") and len(args) % 2 != 0:
                _err(
                    errors,
                    path,
                    f"'{op}' must have an EVEN number of args: (cond1, val1, cond2, val2, ...).",
                    "Add/remove the final argument so args are paired as condition/value.",
                )

            has_else = (op == "if" and len(args) % 2 == 1)

            # condition indices
            cond_stop = len(args) - (1 if has_else else 0)
            for i in range(0, cond_stop, 2):
                if not _is_bool_condition_head(args[i]):
                    cond_node = args[i]
                    # Threshold-specific: if(true, "required") is almost always a placeholder meaning
                    # "we don't have the threshold rule". Treat it as missing logic with a clearer message.
                    if (
                        context == "threshold"
                        and op == "if"
                        and isinstance(cond_node, dict)
                        and cond_node.get("type") == "constant"
                        and cond_node.get("expected_type") == "boolean"
                        and isinstance(cond_node.get("value"), bool)
                    ):
                        bv = cond_node.get("value")
                        _err(
                            errors,
                            f"{path}.args[{i}]",
                            f"Missing threshold logic: threshold condition is a boolean constant ({str(bv).lower()}). This makes the threshold unconditional (e.g., if(true, 'required')).",
                            "Replace the boolean constant with an actual threshold condition (e.g., revenue >= X). If the source text does not specify any threshold rule, keep the threshold value as null.",
                        )
                    else:
                        _err(
                            errors,
                            f"{path}.args[{i}]",
                            "This position must be a CONDITION (boolean expression).",
                            "Use a test operator (<=,==,&&,||,!) or a boolean tag here; move non-boolean values to the next value slot.",
                        )

            # value indices
            val_indices = list(range(1, cond_stop, 2))
            if has_else:
                val_indices.append(len(args) - 1)

            for i in val_indices:
                if not _all_leaves_are_tags_or_constants(args[i]):
                    _err(
                        errors,
                        f"{path}.args[{i}]",
                        "This position must be a VALUE expression but it contains no tag/constant leaves.",
                        "Ensure the value branch ultimately contains tag(s) and/or constant(s) (e.g., constant string/numeric/date).",
                    )

            # Branch type consistency (useful)
            if op in ("if", "sum_when_true", "concat_when_true"):
                if op == "if":
                    value_nodes = list(args[1::2]) + ([args[-1]] if has_else else [])
                else:
                    value_nodes = list(args[1::2])
                bases = [infer_type(v).base for v in value_nodes]
                base = _unify_base(bases)
                if base is None and any(b is not None for b in bases):
                    _err(
                        errors,
                        path,
                        f"Conditional '{op}' value branches have mixed types: {bases}.",
                        "Make all value branches return the SAME base type (all string OR all numeric OR all date OR all day_month).",
                    )

        # B) Test operators: leaves must exist; boolean expectations for logical ops
        if op in TEST_OPS:
            for i, a in enumerate(args):
                if not _all_leaves_are_tags_or_constants(a):
                    _err(
                        errors,
                        f"{path}.args[{i}]",
                        f"Test-operator '{op}' arg must ultimately reference tag/constant leaves.",
                        "Use tags/constants (possibly inside nested operations) to build the comparison/test.",
                    )

            if op in ("&&", "||", "!", "!!"):
                for i, a in enumerate(args):
                    ti = infer_type(a)
                    if ti.base is not None and ti.base != "boolean":
                        _err(
                            errors,
                            f"{path}.args[{i}]",
                            f"Logical operator '{op}' expects boolean but got {ti.base}.",
                            "Ensure this argument is a boolean expression (test op / boolean tag / nested conditional producing boolean).",
                        )

            if op in ("<", "<=", ">", ">="):
                # comparisons should not be boolean/string
                bases = [infer_type(a).base for a in args]
                b = _unify_base(bases)
                if b in ("boolean", "string"):
                    _err(
                        errors,
                        path,
                        f"Comparator '{op}' should compare numeric/date/day_month, not {b}.",
                        "Use comparator on numeric/date/day_month values; use '==' for booleans/strings.",
                    )

            if op in ("==", "<", "<=", ">", ">="):
                bases = [infer_type(a).base for a in args]
                if _unify_base(bases) is None and any(b is not None for b in bases):
                    _err(
                        errors,
                        path,
                        f"Operator '{op}' compares mismatched types: {bases}.",
                        "Make all compared arguments the same type (all numeric OR all date OR all day_month OR all string).",
                    )

        # C) Math operators: numeric expectations; to_range type consistency
        if op in MATH_OPS:
            for i, a in enumerate(args):
                if not _all_leaves_are_tags_or_constants(a):
                    _err(
                        errors,
                        f"{path}.args[{i}]",
                        f"Math-operator '{op}' arg must ultimately reference tag/constant leaves.",
                        "Use numeric tags/constants in math expressions.",
                    )

            if op != "to_range":
                for i, a in enumerate(args):
                    ti = infer_type(a)
                    if ti.base is not None and ti.base != "numeric":
                        _err(
                            errors,
                            f"{path}.args[{i}]",
                            f"Math operator '{op}' expects numeric but got {ti.base}.",
                            "Ensure all math operands are numeric tags/constants or numeric-producing operations.",
                        )

            if op == "to_range":
                arg_infos = [infer_type(a) for a in args]
                base = _unify_base([ti.base for ti in arg_infos])
                if base is None:
                    _err(
                        errors,
                        path,
                        f"'to_range' args must have the same base type; got {[ti.base for ti in arg_infos]}.",
                        "Make all to_range arguments the same type (all numeric OR all date OR all period OR all day_month).",
                    )
                if base in ("boolean", "string"):
                    _err(
                        errors,
                        path,
                        f"'to_range' must represent a numeric/date/period/day_month range, not {base}.",
                        "Use to_range only for numeric or date-like ranges.",
                    )

        # D) Date operators: must include date/period/day_month leaves and correct input types
        if op in DATE_OPS:
            leaves = collect_leaves(node)
            has_dateish = any(l.get("expected_type") in ("date", "period", "day_month") for l in leaves)
            if not has_dateish:
                _err(
                    errors,
                    path,
                    f"Date operator '{op}' subtree contains no date/period/day_month leaves.",
                    "Include a date tag/constant (or period/day_month when applicable) in this date expression.",
                )

            if op in ("date_add", "date_sub") and len(args) == 2:
                t0 = infer_type(args[0]).base
                t1 = infer_type(args[1]).base
                if t0 is not None and t0 != "date":
                    _err(errors, f"{path}.args[0]", f"'{op}' first arg must be date, got {t0}.", "Use a date expression (e.g., deadline.fiscal_year_end).")
                if t1 is not None and t1 != "period":
                    _err(errors, f"{path}.args[1]", f"'{op}' second arg must be period, got {t1}.", "Use a period constant/tag (e.g., {value:3, unit:'Months'}).")

            if op == "next_md_after" and len(args) == 2:
                t0 = infer_type(args[0]).base
                t1 = infer_type(args[1]).base
                if t0 is not None and t0 != "date":
                    _err(errors, f"{path}.args[0]", f"'next_md_after' first arg must be date, got {t0}.", "Use a date expression as anchor.")
                if t1 is not None and t1 != "day_month":
                    _err(errors, f"{path}.args[1]", f"'next_md_after' second arg must be day_month, got {t1}.", "Use a day_month constant like {day:30, month:9}.")

            if op == "extract_day_month" and len(args) == 1:
                t0 = infer_type(args[0]).base
                if t0 is not None and t0 != "date":
                    _err(errors, f"{path}.args[0]", f"'extract_day_month' arg must be date, got {t0}.", "Pass a date expression into extract_day_month(...).")

    return _dedup_msgs(errors), _dedup_msgs(warnings)


# -------------------------
# Context-specific checks
# -------------------------
def validate_deadline(cv: Any, key: str) -> Tuple[List[Msg], List[Msg]]:
    errors: List[Msg] = []
    warnings: List[Msg] = []

    if cv in (None, "", {}):
        return errors, warnings

    if not contains_date_signal(cv):
        _err(
            errors,
            "root",
            "Deadline expression must include a date/day_month tag or constant, or a date operator somewhere.",
            "Use deadline.fiscal_year_end, a day_month constant, or date operators like date_add/next_md_after/bom/eom.",
        )

    ti = infer_type(cv)
    if ti.base is not None and ti.base not in DEADLINE_DATE_LIKE_TYPES:
        _warn(
            warnings,
            "root",
            f"Deadline expression inferred type is {ti.base} (expected date/day_month).",
            "If this is intended (rare), ignore; otherwise make the expression return a date or day_month.",
        )
    return _dedup_msgs(errors), _dedup_msgs(warnings)


def validate_threshold(cv: Any) -> Tuple[List[Msg], List[Msg]]:
    errors: List[Msg] = []
    warnings: List[Msg] = []

    if cv in (None, "", {}):
        return errors, warnings

    if not isinstance(cv, dict) or cv.get("type") != "operation":
        _err(errors, "root", "Threshold root must be an operation node.", "Use root operator 'if' or 'concat_when_true'.")
        return _dedup_msgs(errors), _dedup_msgs(warnings)

    op = cv.get("operator_id")
    args = cv.get("args", [])

    if op not in ("if", "concat_when_true"):
        _err(errors, "root", f"Threshold root operator must be 'if' or 'concat_when_true' (got '{op}').", "Wrap the threshold in if(...) or concat_when_true(...).")
        return _dedup_msgs(errors), _dedup_msgs(warnings)

    if not isinstance(args, list) or len(args) < 2:
        _err(errors, "root", "Threshold root must have at least 2 args.", "Provide at least one (condition,value) pair.")
        return _dedup_msgs(errors), _dedup_msgs(warnings)

    has_else = (op == "if" and len(args) % 2 == 1)
    value_nodes = list(args[1::2]) + ([args[-1]] if has_else else [])

    for i, v in enumerate(value_nodes):
        if not _all_leaves_are_constant_strings(v):
            _err(
                errors,
                f"root.value_branch[{i+1}]",
                "Threshold value branches must ultimately be constant string(s) ONLY (no tags, no numeric, no date).",
                "Use string constants like 'local_file_required', 'form_A_required', etc. Conditions should carry the logic; values should be strings.",
            )

    for s in _collect_constant_strings(cv):
        if s.strip().lower() == "not_required":
            _warn(
                warnings,
                "root",
                "Threshold contains constant string 'not_required'. By default 'not_required' is implied and should not be returned unless explicitly stated.",
                "If the source explicitly requires 'not_required', keep it; otherwise remove it and rely on implied default.",
            )

    return _dedup_msgs(errors), _dedup_msgs(warnings)



def validate_penalty(cv: Any) -> Tuple[List[Msg], List[Msg]]:
    errors: List[Msg] = []
    warnings: List[Msg] = []

    if cv in (None, "", {}):
        return errors, warnings

    if not isinstance(cv, dict) or cv.get("type") != "operation":
        _err(errors, "root", "Penalty root must be an operation node.", "Use root operator 'sum_when_true'.")
        return _dedup_msgs(errors), _dedup_msgs(warnings)

    op = cv.get("operator_id")
    args = cv.get("args", [])

    if op != "sum_when_true":
        _err(
            errors,
            "root",
            f"Penalty root operator must be 'sum_when_true' (got '{op}').",
            "Wrap the penalty in sum_when_true(cond1,val1,cond2,val2,...).",
        )
        return _dedup_msgs(errors), _dedup_msgs(warnings)

    if not isinstance(args, list) or len(args) < 2 or len(args) % 2 != 0:
        _err(
            errors,
            "root",
            "sum_when_true must have an EVEN number of args (cond1,val1,cond2,val2,...).",
            "Fix args so they alternate condition/value.",
        )
        return _dedup_msgs(errors), _dedup_msgs(warnings)

    value_nodes = list(args[1::2])
    for i, v in enumerate(value_nodes):
        # Preferred: a single top-level to_range(...) that evaluates to a numeric range.
        if isinstance(v, dict) and v.get("type") == "operation" and v.get("operator_id") == "to_range":
            v_args = v.get("args", [])
            if not isinstance(v_args, list) or len(v_args) < 1:
                _err(
                    errors,
                    f"root.value_branch[{i+1}]",
                    "Penalty range value to_range(...) must have >=1 arg.",
                    "Use to_range(x) for [x,x], or to_range(min,max) for [min,max].",
                )
                continue

            # Penalty ranges should be numeric.
            ti_v = infer_type(v)
            if ti_v.base is not None and ti_v.base != "numeric":
                _err(
                    errors,
                    f"root.value_branch[{i+1}]",
                    f"Penalty range must be numeric, got {ti_v.base}.",
                    "Use numeric constants/tags/expressions inside to_range(...) for penalty amounts.",
                )

            # Relaxed rule:
            # - We DO allow boolean tags/ops inside these expressions (typically inside if(...) conditions).
            # - We require that each to_range argument ultimately contains numeric leaves and evaluates to numeric.
            for j, a in enumerate(v_args):
                if not _has_numeric_leaf(a):
                    _err(
                        errors,
                        f"root.value_branch[{i+1}].to_range.args[{j}]",
                        "Penalty range argument must ultimately contain numeric tag(s)/constant(s).",
                        "Ensure each to_range argument includes numeric constants/tags for the amount (conditions may be boolean).",
                    )

                ti_a = infer_type(a)
                if ti_a.base is not None and ti_a.base != "numeric":
                    _err(
                        errors,
                        f"root.value_branch[{i+1}].to_range.args[{j}]",
                        f"Penalty range argument must evaluate to numeric, got {ti_a.base}.",
                        "Boolean tags are allowed inside conditions (e.g., if(...)), but the result of each argument must be a numeric amount.",
                    )
                elif ti_a.base is None and _has_numeric_leaf(a):
                    _warn(
                        warnings,
                        f"root.value_branch[{i+1}].to_range.args[{j}]",
                        "Could not infer the type of this range argument; assuming numeric because numeric leaves exist.",
                        "If this argument is not numeric, rewrite it so it clearly returns a numeric amount (e.g., constant/tag, math op, or if(...) with numeric branches).",
                    )

        else:
            # Backward-compatible: allow scalar numeric expressions (some generators omit to_range),
            # but they must still be numeric expressions.
            ti = infer_type(v)
            if ti.base is not None and ti.base != "numeric":
                _err(
                    errors,
                    f"root.value_branch[{i+1}]",
                    f"Penalty amount must be numeric (or wrapped in to_range), but inferred type is {ti.base}.",
                    "Use numeric constants/tags, numeric math ops, or to_range(numeric,...).",
                )
            elif ti.base is None:
                # If we can't infer, fall back to a leaf-based heuristic.
                if not _has_numeric_leaf(v):
                    _err(
                        errors,
                        f"root.value_branch[{i+1}]",
                        "Penalty amount must ultimately contain numeric tag(s)/constant(s).",
                        "Use numeric constants/tags in the amount computation (and prefer wrapping with to_range(...)).",
                    )
                else:
                    _warn(
                        warnings,
                        f"root.value_branch[{i+1}]",
                        "Could not infer the type of this penalty amount; assuming numeric because numeric leaves exist.",
                        "If this value is not numeric, rewrite it as a numeric expression or wrap it in to_range(...).",
                    )

            # discourage nested to_range in scalar branches
            for p, node in iter_nodes(v):
                if node.get("type") == "operation" and node.get("operator_id") == "to_range":
                    _warn(
                        warnings,
                        f"root.value_branch[{i+1}]",
                        "Found nested to_range inside a penalty value branch.",
                        "Prefer a single top-level to_range(...) only when representing a range; avoid nesting to_range inside other ops.",
                    )
                    break

    return _dedup_msgs(errors), _dedup_msgs(warnings)


# -------------------------
# Public API
# -------------------------
def _parse_cv(value: Any) -> Any:
    """Accept dict, JSON string, or None/empty."""
    if value is None:
        return None
    if isinstance(value, str):
        s = value.strip()
        if not s:
            return None
        try:
            return json.loads(s)
        except Exception:
            return value  # kept as-is; caller will flag type error
    return value


def infer_context_from_key(key: str) -> Optional[str]:
    """Infer the semantic context from a column/key name.

    This checker is used across multiple extraction tables where keys may be:
    - snake_case (deadline_filing), or
    - CamelCase (DeadlineFiling), or
    - mixed.

    We normalize by lowercasing and removing underscores.
    """
    kl_raw = (key or "").lower()
    kl = kl_raw.replace("_", "")

    # Explicitly *exclude* extensions from context inference.
    # (We skip checking them entirely upstream in extra_schema_check_report.)
    if "deadlineextension" in kl or "deadline_extension" in kl_raw:
        return None

    if "penalty" in kl:
        return "penalty"
    if "threshold" in kl:
        return "threshold"

    # Deadlines: accept both DeadlineFiling and deadline_filing forms (and similar).
    if "deadlinepreparation" in kl or ("deadline" in kl and "preparation" in kl):
        return "deadline"
    if "deadlinefiling" in kl or ("deadline" in kl and "filing" in kl):
        return "deadline"

    return None

def extra_schema_check_report(
    extraction: Dict[str, Any],
    *,
    key_context_override: Optional[Dict[str, str]] = None,
    include_warning_only_keys: bool = False,
) -> Dict[str, Dict[str, List[str]]]:
    """
    Recommended API.

    Returns a per-key report:
        { key: { "errors": [...], "warnings": [...] } }

    By default, only keys with ERRORS are returned.
    Set include_warning_only_keys=True to also include keys that have only warnings.
    """
    report: Dict[str, Dict[str, List[str]]] = {}
    key_context_override = key_context_override or {}

    for key, raw in extraction.items():
        # Extensions: per current pipeline policy, we do NOT run extra semantic checks on deadline extensions.
        # (They are often period/period_range-only and tend to create noisy false positives.)
        kl_raw = (key or "").lower()
        kl = kl_raw.replace("_", "")
        if "deadlineextension" in kl or "deadline_extension" in kl_raw:
            continue

        errors: List[Msg] = []
        warnings: List[Msg] = []

        cv = _parse_cv(raw)

        if cv in (None, "", {}):
            # missing values are not validated; decide upstream whether missing is allowed
            continue

        if not isinstance(cv, dict):
            _err(
                errors,
                "root",
                f"ComplexValue must be a JSON object/dict, but got {type(cv).__name__}.",
                "Return a valid ComplexValue JSON object (dict).",
            )
        else:
            context = key_context_override.get(key) or infer_context_from_key(key)

            e, w = validate_tree(cv, context=context, key=key)
            errors.extend(e)
            warnings.extend(w)

            if context == "deadline":
                e2, w2 = validate_deadline(cv, key)
                errors.extend(e2)
                warnings.extend(w2)
            elif context == "threshold":
                e2, w2 = validate_threshold(cv)
                errors.extend(e2)
                warnings.extend(w2)
            elif context == "penalty":
                e2, w2 = validate_penalty(cv)
                errors.extend(e2)
                warnings.extend(w2)

        errors = _dedup_msgs(errors)
        warnings = _dedup_msgs(warnings)

        if errors or (include_warning_only_keys and warnings):
            report[key] = {
                "errors": [m.render() for m in errors],
                "warnings": [m.render() for m in warnings],
            }

    return report


def extra_schema_check(
    extraction: Dict[str, Any],
    *,
    key_context_override: Optional[Dict[str, str]] = None,
) -> Dict[str, List[str]]:
    """
    Backward-compatible API: returns only ERROR messages per key.

    Output:
        { key: [ "ERROR: ...", ... ] }
    """
    rep = extra_schema_check_report(extraction, key_context_override=key_context_override, include_warning_only_keys=False)
    return {k: v["errors"] for k, v in rep.items() if v.get("errors")}


def format_report_for_llm(report: Dict[str, Dict[str, List[str]]]) -> str:
    """
    Convenience helper: turns the report into a prompt-ready text block.
    """
    lines: List[str] = []
    for key, payload in report.items():
        lines.append(f"- ComplexValue key '{key}':")
        for e in payload.get("errors", []):
            lines.append(f"  * {e}")
        for w in payload.get("warnings", []):
            lines.append(f"  * {w}")
    return "\n".join(lines)


STATUS_SUCCESS = "success"
STATUS_EMPTY = "empty"
STATUS_GENERATION_FAILED = "generation_failed"
STATUS_POST_GENERATION_SCHEMA_CHECK_FAILED = "post_generation_schema_check_failed"


@dataclass(frozen=True)
class PostGenerationCheckResult:
    is_valid: bool
    errors: tuple[str, ...]
    normalized_value: Any


def _dedupe_strings(values: Iterable[str]) -> tuple[str, ...]:
    seen: Set[str] = set()
    ordered: List[str] = []
    for value in values:
        if not value or value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return tuple(ordered)


def _is_boolean_constant(node: Any) -> bool:
    return (
        isinstance(node, dict)
        and node.get("type") == "constant"
        and node.get("expected_type") == "boolean"
        and isinstance(node.get("value"), bool)
    )


def _condition_uses_only_constants(node: Any) -> bool:
    leaves = collect_leaves(node)
    if not leaves:
        return False
    return not any(leaf.get("type") == "tag" for leaf in leaves)


def _is_threshold_required_special_case(indicator_key: str, value: Any) -> bool:
    normalized_key = (indicator_key or "").strip().lower().replace("_", "")
    if normalized_key not in {"thresholdpreparation", "thresholdfiling"}:
        return False
    if not isinstance(value, dict):
        return False
    if value.get("type") != "operation" or value.get("operator_id") != "if":
        return False

    args = value.get("args")
    if not isinstance(args, list) or len(args) not in {2, 3}:
        return False
    return _is_boolean_constant(args[0]) and args[0].get("value") is True


def _normalize_value_for_post_generation(indicator_key: str, value: Any) -> Any:
    if _is_threshold_required_special_case(indicator_key, value):
        return {
            "type": "constant",
            "expected_type": "string",
            "value": "required",
        }
    return value


def _constant_condition_errors(value: Any) -> tuple[str, ...]:
    parsed = _parse_cv(value)
    if not isinstance(parsed, dict):
        return ()

    errors: List[str] = []
    for path, node in iter_nodes(parsed):
        if node.get("type") != "operation":
            continue
        operator_id = node.get("operator_id")
        if operator_id not in CONDITIONAL_OPS:
            continue
        args = node.get("args")
        if not isinstance(args, list):
            continue

        has_else = operator_id == "if" and len(args) % 2 == 1
        cond_stop = len(args) - (1 if has_else else 0)
        for index in range(0, cond_stop, 2):
            condition = args[index]
            condition_path = f"{path}.args[{index}]"
            if _is_boolean_constant(condition):
                errors.append(
                    f"ERROR: {condition_path} — conditional expression uses a boolean constant and has no actual test."
                )
                continue
            if _condition_uses_only_constants(condition):
                errors.append(
                    f"ERROR: {condition_path} — conditional expression is built only from constants and has no tag-based test."
                )

    return _dedupe_strings(errors)


def check_indicator_value(
    *,
    indicator_key: str,
    value: Any,
) -> PostGenerationCheckResult:
    parsed_value = _parse_cv(value)
    normalized_value = _normalize_value_for_post_generation(indicator_key, parsed_value)
    if normalized_value is not parsed_value:
        return PostGenerationCheckResult(
            is_valid=True,
            errors=(),
            normalized_value=normalized_value,
        )
    if parsed_value in (None, "", {}):
        return PostGenerationCheckResult(is_valid=True, errors=(), normalized_value=parsed_value)

    context = infer_context_from_key(indicator_key)
    errors: List[str] = []
    if context:
        report = extra_schema_check_report(
            {indicator_key: parsed_value},
            key_context_override={indicator_key: context},
            include_warning_only_keys=False,
        )
        errors.extend(report.get(indicator_key, {}).get("errors", []))

    errors.extend(_constant_condition_errors(parsed_value))
    deduped_errors = _dedupe_strings(errors)
    return PostGenerationCheckResult(
        is_valid=not deduped_errors,
        errors=deduped_errors,
        normalized_value=parsed_value,
    )


__all__ = [
    "STATUS_SUCCESS",
    "STATUS_EMPTY",
    "STATUS_GENERATION_FAILED",
    "STATUS_POST_GENERATION_SCHEMA_CHECK_FAILED",
    "PostGenerationCheckResult",
    "check_indicator_value",
    "collect_leaves",
    "extra_schema_check",
    "extra_schema_check_report",
    "format_report_for_llm",
    "infer_context_from_key",
    "iter_nodes",
]


if __name__ == "__main__":
    # Tiny demo
    example = {
        "threshold_example": {
            "type": "operation",
            "operator_id": "if",
            "args": [
                {"type": "tag", "expected_type": "boolean", "value": "threshold.some_trigger", "is_custom": True, "years_ago": 0},
                {"type": "constant", "expected_type": "string", "value": "required"},
            ],
        }
    }
    rep = extra_schema_check_report(example, include_warning_only_keys=True)
    print(json.dumps(rep, indent=2))
    print("\n---\nPrompt-ready:\n")
    print(format_report_for_llm(rep))
