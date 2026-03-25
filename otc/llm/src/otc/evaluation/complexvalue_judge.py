from __future__ import annotations

import hashlib
import json
import math
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from otc.llm.client import OpenAICompatClient
from otc.llm.structured import ask_for_model

from .utils import load_module_from_path


@dataclass
class ComplexValueJudgeConfig:
    judge_models_path: str
    judge_prompts_path: str
    converter_path: str
    case_mode: str = "default"
    max_attempts: int = 3
    fix_redundant_negations: bool = True
    max_source_chars: Optional[int] = None
    max_branches_json_chars: Optional[int] = None
    max_report_chars: Optional[int] = None


@dataclass
class AtomicRule:
    branch_id: str
    condition_nodes: List[Any]
    value_node: Any
    condition_components: List[str]
    value_components: List[str]
    canonical_condition: Optional[str]
    canonical_value: Optional[str]


def load_jsonish(x: Any) -> Any:
    if x is None:
        return None
    if isinstance(x, float) and math.isnan(x):
        return None
    if isinstance(x, (dict, list, int, float, bool)):
        return x
    if not isinstance(x, str):
        return x

    s = x.strip()
    if not s:
        return None
    if '""' in s and s.count('"') > 2:
        s = s.replace('""', '"')
    try:
        return json.loads(s)
    except Exception:
        m = re.search(r"\{.*\}", s, flags=re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                return None
        return None


def _sha1_obj(obj: Any) -> str:
    s = json.dumps(obj, sort_keys=True, ensure_ascii=False)
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]


def is_cv_node_v2(node: Any) -> bool:
    return isinstance(node, dict) and node.get("type") in {"operation", "tag", "constant"}


def get_operator_id_v2(node: Dict[str, Any]) -> Optional[str]:
    if not is_cv_node_v2(node) or node.get("type") != "operation":
        return None
    if "operator_id" in node:
        return node.get("operator_id")
    op = node.get("operator")
    if isinstance(op, dict):
        return op.get("operator_id")
    return None


def get_op_args_v2(node: Dict[str, Any]) -> List[Any]:
    if not is_cv_node_v2(node) or node.get("type") != "operation":
        return []
    if "args" in node:
        args = node.get("args")
        return args if isinstance(args, list) else []
    op = node.get("operator")
    if isinstance(op, dict):
        args = op.get("args")
        return args if isinstance(args, list) else []
    return []


def make_op_v2(operator_id: str, args: List[Any]) -> Dict[str, Any]:
    return {"type": "operation", "operator_id": operator_id, "args": args}


def make_not_v2(expr: Any) -> Dict[str, Any]:
    if is_cv_node_v2(expr) and expr.get("type") == "operation":
        oid = get_operator_id_v2(expr)
        if oid in {"!", "not"}:
            args = get_op_args_v2(expr)
            if len(args) == 1:
                return args[0]
    return make_op_v2("!", [expr])


def make_and_v2(exprs: List[Any]) -> Any:
    if not exprs:
        return None
    if len(exprs) == 1:
        return exprs[0]
    return make_op_v2("&&", exprs)


def make_or_v2(exprs: List[Any]) -> Any:
    if not exprs:
        return None
    if len(exprs) == 1:
        return exprs[0]
    return make_op_v2("||", exprs)


def _flatten_recursive_v2(
    node: Any,
    accumulated_guards: List[Dict[str, Any]],
    case_mode: str = "default",
) -> List[Tuple[List[Dict[str, Any]], Any]]:
    if not is_cv_node_v2(node):
        return [(accumulated_guards.copy(), node)]

    op_id = get_operator_id_v2(node)

    if op_id == "if":
        args = get_op_args_v2(node)
        n = len(args)
        if n < 2:
            return [(accumulated_guards.copy(), node)]
        if n == 2:
            cond = args[0]
            then_val = args[1]
            then_guards = accumulated_guards + [cond]
            return _flatten_recursive_v2(then_val, then_guards, case_mode)
        if n == 3:
            cond = args[0]
            then_val = args[1]
            else_val = args[2]
            results: List[Tuple[List[Dict[str, Any]], Any]] = []
            then_guards = accumulated_guards + [cond]
            results.extend(_flatten_recursive_v2(then_val, then_guards, case_mode))
            else_guards = accumulated_guards + [make_not_v2(cond)]
            results.extend(_flatten_recursive_v2(else_val, else_guards, case_mode))
            return results

        if n % 2 == 1:
            pairs = [(args[i], args[i + 1]) for i in range(0, n - 1, 2)]
            default_val = args[-1]
        else:
            pairs = [(args[i], args[i + 1]) for i in range(0, n, 2)]
            default_val = None

        results = []
        prev_conds: List[Any] = []
        for cond, val in pairs:
            branch_guards = accumulated_guards.copy()
            if prev_conds:
                branch_guards.append(make_not_v2(make_or_v2(prev_conds.copy())))
            branch_guards.append(cond)
            results.extend(_flatten_recursive_v2(val, branch_guards, case_mode))
            prev_conds.append(cond)
        if default_val is not None:
            default_guards = accumulated_guards.copy()
            if prev_conds:
                default_guards.append(make_not_v2(make_or_v2(prev_conds)))
            results.extend(_flatten_recursive_v2(default_val, default_guards, case_mode))
        return results

    if op_id in {"case", "sum_when_true", "concat_when_true"}:
        args = get_op_args_v2(node)
        n = len(args)
        if n == 0:
            return [(accumulated_guards.copy(), node)]

        if n % 2 == 1:
            pairs = [(args[i], args[i + 1]) for i in range(0, n - 1, 2)]
            default_val = args[-1]
        else:
            pairs = [(args[i], args[i + 1]) for i in range(0, n, 2)]
            default_val = None

        if case_mode == "default":
            effective_mode = "priority" if op_id == "case" else "independent"
        else:
            effective_mode = case_mode

        results: List[Tuple[List[Dict[str, Any]], Any]] = []
        if effective_mode == "priority":
            prev_conds: List[Any] = []
            for cond, val in pairs:
                branch_guards = accumulated_guards.copy()
                if prev_conds:
                    branch_guards.append(make_not_v2(make_or_v2(prev_conds.copy())))
                if cond is not None:
                    branch_guards.append(cond)
                results.extend(_flatten_recursive_v2(val, branch_guards, case_mode))
                if cond is not None:
                    prev_conds.append(cond)
            if default_val is not None:
                default_guards = accumulated_guards.copy()
                if prev_conds:
                    default_guards.append(make_not_v2(make_or_v2(prev_conds)))
                results.extend(_flatten_recursive_v2(default_val, default_guards, case_mode))
        else:
            all_conds: List[Any] = []
            for cond, val in pairs:
                if cond is not None:
                    branch_guards = accumulated_guards + [cond]
                    results.extend(_flatten_recursive_v2(val, branch_guards, case_mode))
                    all_conds.append(cond)
                else:
                    results.extend(_flatten_recursive_v2(val, accumulated_guards.copy(), case_mode))
            if default_val is not None:
                default_guards = accumulated_guards.copy()
                if all_conds:
                    default_guards.append(make_not_v2(make_or_v2(all_conds)))
                results.extend(_flatten_recursive_v2(default_val, default_guards, case_mode))
        return results

    return [(accumulated_guards.copy(), node)]


def flatten_complexvalue_to_atomic_rules(
    complex_value: Any,
    *,
    key: str,
    obligation_type_id: Optional[str],
    case_mode: str,
    expr_to_text,
    value_to_text,
) -> List[AtomicRule]:
    root = load_jsonish(complex_value)
    if isinstance(root, dict) and "value" in root and not is_cv_node_v2(root):
        root = root.get("value")
    if root is None:
        return []

    flattened = _flatten_recursive_v2(root, [], case_mode)
    rules: List[AtomicRule] = []
    for guards, val in flattened:
        branch_payload = {"guards": guards, "value": val}
        branch_id = _sha1_obj(branch_payload)

        cond_components: List[str] = []
        for g in guards:
            cond_components.append(expr_to_text(g, mode="condition", obligation_type_id=obligation_type_id))

        canonical_cond = None
        if guards:
            and_expr = make_and_v2(guards)
            if and_expr is not None:
                canonical_cond = expr_to_text(and_expr, mode="condition", obligation_type_id=obligation_type_id)

        value_text = value_to_text(val, key=key, obligation_type_id=obligation_type_id)
        canonical_val = value_text

        rules.append(
            AtomicRule(
                branch_id=branch_id,
                condition_nodes=guards,
                value_node=val,
                condition_components=cond_components,
                value_components=[value_text],
                canonical_condition=canonical_cond,
                canonical_value=canonical_val,
            )
        )
    return rules


def nodes_equal(a: Any, b: Any) -> bool:
    if type(a) != type(b):
        return False
    if isinstance(a, dict):
        if set(a.keys()) != set(b.keys()):
            return False
        return all(nodes_equal(a.get(k), b.get(k)) for k in a.keys())
    if isinstance(a, list):
        if len(a) != len(b):
            return False
        return all(nodes_equal(x, y) for x, y in zip(a, b))
    return a == b


def is_not_of(node: Any, target: Any) -> bool:
    if not is_cv_node_v2(node) or node.get("type") != "operation":
        return False
    op = get_operator_id_v2(node)
    if op != "!":
        return False
    args = get_op_args_v2(node)
    if len(args) != 1:
        return False
    return nodes_equal(args[0], target)


def is_not_or_of(node: Any, targets: List[Any]) -> bool:
    if not is_cv_node_v2(node) or node.get("type") != "operation":
        return False
    op = get_operator_id_v2(node)
    if op != "!":
        return False
    args = get_op_args_v2(node)
    if len(args) != 1:
        return False
    inner = args[0]
    if not is_cv_node_v2(inner) or inner.get("type") != "operation":
        return False
    inner_op = get_operator_id_v2(inner)
    if inner_op != "||":
        return False
    inner_args = get_op_args_v2(inner)
    if len(inner_args) != len(targets):
        return False
    for t in targets:
        if not any(nodes_equal(t, ia) for ia in inner_args):
            return False
    return True


def extract_and_conjuncts(node: Any) -> List[Any]:
    if not is_cv_node_v2(node) or node.get("type") != "operation":
        return [node]
    op = get_operator_id_v2(node)
    if op != "&&":
        return [node]
    args = get_op_args_v2(node)
    result: List[Any] = []
    for a in args:
        result.extend(extract_and_conjuncts(a))
    return result


def rebuild_and_without(conjuncts: List[Any], to_remove: List[Any]) -> Any:
    filtered = []
    for c in conjuncts:
        if any(nodes_equal(c, r) for r in to_remove):
            continue
        filtered.append(c)
    if not filtered:
        return None
    if len(filtered) == 1:
        return filtered[0]
    return make_op_v2("&&", filtered)


def find_redundant_negations_in_cond(cond: Any, prev_conds: List[Any]) -> List[Any]:
    if not prev_conds:
        return []
    conjuncts = extract_and_conjuncts(cond)
    to_remove: List[Any] = []
    implication_targets: List[Any] = []
    for prev in prev_conds:
        implication_targets.append(prev)
        prev_conjuncts = extract_and_conjuncts(prev)
        if len(prev_conjuncts) > 1:
            implication_targets.extend(prev_conjuncts)

    for conj in conjuncts:
        found = False
        for target in implication_targets:
            if is_not_of(conj, target):
                to_remove.append(conj)
                found = True
                break
        if not found:
            if is_not_or_of(conj, prev_conds):
                to_remove.append(conj)
            elif len(prev_conds) > 1:
                for i in range(1, len(prev_conds) + 1):
                    if is_not_or_of(conj, prev_conds[:i]):
                        to_remove.append(conj)
                        break
    return to_remove


def fix_redundant_if_conditions(node: Any) -> Tuple[Any, bool]:
    if not is_cv_node_v2(node) or node.get("type") != "operation":
        return (node, False)
    op = get_operator_id_v2(node)
    if op != "if":
        return (node, False)
    args = get_op_args_v2(node)
    n = len(args)
    if n < 4 or n > 7:
        return (node, False)

    if n % 2 == 1:
        pairs = [(args[i], args[i + 1]) for i in range(0, n - 1, 2)]
        default_val = args[-1]
    else:
        pairs = [(args[i], args[i + 1]) for i in range(0, n, 2)]
        default_val = None

    converted = False
    fixed_pairs = []
    prev_conds: List[Any] = []

    for i, (cond, val) in enumerate(pairs):
        if i == 0:
            fixed_pairs.append((cond, val))
            prev_conds.append(cond)
            continue

        redundant = find_redundant_negations_in_cond(cond, prev_conds)
        if redundant:
            converted = True
            conjuncts = extract_and_conjuncts(cond)
            fixed_cond = rebuild_and_without(conjuncts, redundant)
            if fixed_cond is None:
                fixed_cond = cond
                converted = False
            fixed_pairs.append((fixed_cond, val))
            prev_conds.append(fixed_cond)
        else:
            fixed_pairs.append((cond, val))
            prev_conds.append(cond)

    if not converted:
        return (node, False)

    new_args = []
    for cond, val in fixed_pairs:
        new_args.append(cond)
        new_args.append(val)
    if default_val is not None:
        new_args.append(default_val)
    fixed_node = make_op_v2("if", new_args)
    return (fixed_node, True)


def preprocess_complexvalue(cv: Any) -> Tuple[Any, bool]:
    if cv is None:
        return (None, False)
    if not is_cv_node_v2(cv):
        return (cv, False)

    node_type = cv.get("type")
    if node_type == "operation":
        op = get_operator_id_v2(cv)
        args = get_op_args_v2(cv)
        any_arg_converted = False
        processed_args = []
        for arg in args:
            fixed_arg, arg_converted = preprocess_complexvalue(arg)
            processed_args.append(fixed_arg)
            if arg_converted:
                any_arg_converted = True
        if any_arg_converted:
            cv = make_op_v2(op, processed_args)
        if op == "if":
            fixed_node, node_converted = fix_redundant_if_conditions(cv)
            return (fixed_node, any_arg_converted or node_converted)
        return (cv, any_arg_converted)

    return (cv, False)


def serialize_atomic_rules(rules: List[AtomicRule]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for r in rules:
        out.append(
            {
                "branch_id": r.branch_id,
                "condition_components": r.condition_components,
                "value_components": r.value_components,
                "canonical_condition": r.canonical_condition,
                "canonical_value": r.canonical_value,
            }
        )
    return out


class ComplexValueJudge:
    def __init__(self, client: OpenAICompatClient, config: ComplexValueJudgeConfig) -> None:
        self.client = client
        self.config = config
        self._load_modules()

    def _load_modules(self) -> None:
        self.converter_mod = load_module_from_path("cv_text_converter", self.config.converter_path)
        self.judge_models = load_module_from_path("judge_models", self.config.judge_models_path)
        self.judge_prompts = load_module_from_path("judge_prompts", self.config.judge_prompts_path)

        def require_attr(mod, name: str):
            if not hasattr(mod, name):
                raise AttributeError(f"Missing {name} in module {getattr(mod, '__file__', mod)}")
            return getattr(mod, name)

        self.BranchVerifierReport = require_attr(self.judge_models, "BranchVerifierReport")
        self.CoverageAuditorReport = require_attr(self.judge_models, "CoverageAuditorReport")
        self.OverallScoreReport = require_attr(self.judge_models, "OverallScoreReport")
        self.CandidateBranchModel = require_attr(self.judge_models, "CandidateBranch")

        self.SYSTEM_PROMPT_BRANCH_VERIFIER = require_attr(self.judge_prompts, "SYSTEM_PROMPT_BRANCH_VERIFIER")
        self.SYSTEM_PROMPT_COVERAGE_AUDITOR = require_attr(self.judge_prompts, "SYSTEM_PROMPT_COVERAGE_AUDITOR")
        self.SYSTEM_PROMPT_SCORING_JUDGE = require_attr(self.judge_prompts, "SYSTEM_PROMPT_SCORING_JUDGE")

        self.build_user_prompt_j1 = require_attr(self.judge_prompts, "build_user_prompt_j1")
        self.build_user_prompt_j2 = require_attr(self.judge_prompts, "build_user_prompt_j2")
        self.build_user_prompt_j3 = require_attr(self.judge_prompts, "build_user_prompt_j3")

        for cls in [
            self.BranchVerifierReport,
            self.CoverageAuditorReport,
            self.OverallScoreReport,
            self.CandidateBranchModel,
        ]:
            try:
                cls.model_rebuild(_types_namespace=vars(self.judge_models))
            except Exception:
                pass

    def _expr_to_text(self, node: Any, *, mode: str, obligation_type_id: Optional[str]) -> str:
        fn = getattr(self.converter_mod, "expr_to_text", None)
        if not callable(fn):
            raise RuntimeError("converter module must provide expr_to_text(node, mode, obligation_type_id)")
        return str(fn(node, mode=mode, obligation_type_id=obligation_type_id))

    def _value_to_text(self, value_node: Any, *, key: str, obligation_type_id: Optional[str]) -> str:
        fn = getattr(self.converter_mod, "complex_value_to_text", None)
        if not callable(fn):
            raise RuntimeError("converter module must provide complex_value_to_text(value_node, key, obligation_type_id)")
        return str(fn(value_node, key=key, obligation_type_id=obligation_type_id))

    def _atomic_rules_to_candidate_branches(self, atomic_rules: List[AtomicRule]) -> List[Any]:
        out = []
        for r in atomic_rules:
            out.append(
                self.CandidateBranchModel(
                    branch_id=r.branch_id,
                    condition_components=r.condition_components,
                    value_components=r.value_components,
                    canonical_condition=r.canonical_condition,
                    canonical_value=r.canonical_value,
                )
            )
        return out

    def _extract_cv_value(self, raw: Any) -> Any:
        cv_data = load_jsonish(raw)
        if isinstance(cv_data, dict) and "value" in cv_data and not is_cv_node_v2(cv_data):
            return cv_data.get("value")
        return cv_data

    def evaluate(
        self,
        record: Dict[str, Any],
        source_text: str,
        *,
        case_mode: Optional[str] = None,
        mlflow_ctx: Optional[dict] = None,
    ) -> Dict[str, Any]:
        jurisdiction = record.get("jurisdiction") or ""
        obligation_type_id = record.get("obligation_type_id") or ""
        key = record.get("key") or ""

        cv_value = self._extract_cv_value(record.get("value"))
        was_converted = False
        if self.config.fix_redundant_negations and cv_value is not None:
            cv_value, was_converted = preprocess_complexvalue(cv_value)

        atomic = flatten_complexvalue_to_atomic_rules(
            cv_value,
            key=key,
            obligation_type_id=obligation_type_id,
            case_mode=case_mode or self.config.case_mode,
            expr_to_text=self._expr_to_text,
            value_to_text=self._value_to_text,
        )
        candidate_branches = self._atomic_rules_to_candidate_branches(atomic)
        candidate_payload = [
            b.model_dump(mode="json") if hasattr(b, "model_dump") else b.__dict__ for b in candidate_branches
        ]

        user1 = self.build_user_prompt_j1(
            jurisdiction=jurisdiction,
            obligation_type_id=obligation_type_id,
            key=key,
            candidate_branches=candidate_payload,
            source_text=source_text,
            max_source_chars=self.config.max_source_chars,
            max_branches_json_chars=self.config.max_branches_json_chars,
        )
        j1 = ask_for_model(
            self.client,
            self.SYSTEM_PROMPT_BRANCH_VERIFIER,
            user1,
            self.BranchVerifierReport,
            retries=max(0, self.config.max_attempts - 1),
            mlflow_ctx=mlflow_ctx,
        )

        user2 = self.build_user_prompt_j2(
            jurisdiction=jurisdiction,
            obligation_type_id=obligation_type_id,
            key=key,
            candidate_branches=candidate_payload,
            source_text=source_text,
            max_source_chars=self.config.max_source_chars,
            max_branches_json_chars=self.config.max_branches_json_chars,
        )
        j2 = ask_for_model(
            self.client,
            self.SYSTEM_PROMPT_COVERAGE_AUDITOR,
            user2,
            self.CoverageAuditorReport,
            retries=max(0, self.config.max_attempts - 1),
            mlflow_ctx=mlflow_ctx,
        )

        j1_payload = j1.model_dump(mode="json") if hasattr(j1, "model_dump") else j1
        j2_payload = j2.model_dump(mode="json") if hasattr(j2, "model_dump") else j2

        user3 = self.build_user_prompt_j3(
            branch_verifier_report=j1_payload,
            coverage_auditor_report=j2_payload,
            max_report_chars=self.config.max_report_chars,
        )
        j3 = ask_for_model(
            self.client,
            self.SYSTEM_PROMPT_SCORING_JUDGE,
            user3,
            self.OverallScoreReport,
            retries=max(0, self.config.max_attempts - 1),
            mlflow_ctx=mlflow_ctx,
        )

        j3_payload = j3.model_dump(mode="json") if hasattr(j3, "model_dump") else j3

        return {
            "cond_converted": was_converted,
            "atomic_rules": serialize_atomic_rules(atomic),
            "judge1": j1_payload,
            "judge2": j2_payload,
            "judge3": j3_payload,
            "final_score": j3_payload.get("final_score") if isinstance(j3_payload, dict) else None,
            "final_score_0_100": j3_payload.get("final_score_0_100") if isinstance(j3_payload, dict) else None,
        }
