import json
import unittest

from otc.validation.post_generation_checks import check_indicator_value, extra_schema_check_report


class PostGenerationChecksTests(unittest.TestCase):
    def test_normalizes_threshold_preparation_if_true_to_required_constant(self) -> None:
        value = {
            "type": "operation",
            "operator_id": "if",
            "args": [
                {"type": "constant", "expected_type": "boolean", "value": True},
                {"type": "constant", "expected_type": "string", "value": "required"},
            ],
        }

        result = check_indicator_value(
            indicator_key="ThresholdPreparation",
            value=value,
        )

        self.assertTrue(result.is_valid)
        self.assertEqual(result.errors, ())
        self.assertEqual(
            result.normalized_value,
            {
                "type": "constant",
                "expected_type": "string",
                "value": "required",
            },
        )

    def test_rejects_threshold_with_boolean_constant_condition(self) -> None:
        value = {
            "type": "operation",
            "operator_id": "if",
            "args": [
                {"type": "constant", "expected_type": "boolean", "value": True},
                {"type": "constant", "expected_type": "string", "value": "required"},
            ],
        }

        result = check_indicator_value(
            indicator_key="Threshold",
            value=value,
        )

        self.assertFalse(result.is_valid)
        self.assertTrue(any("boolean constant" in error for error in result.errors))
        self.assertEqual(result.normalized_value, value)

    def test_rejects_constant_only_condition_expression(self) -> None:
        value = json.dumps(
            {
                "type": "operation",
                "operator_id": "if",
                "args": [
                    {
                        "type": "operation",
                        "operator_id": "==",
                        "args": [
                            {"type": "constant", "expected_type": "numeric", "value": 1},
                            {"type": "constant", "expected_type": "numeric", "value": 1},
                        ],
                    },
                    {"type": "constant", "expected_type": "string", "value": "required"},
                ],
            }
        )

        result = check_indicator_value(
            indicator_key="ThresholdPreparation",
            value=value,
        )

        self.assertFalse(result.is_valid)
        self.assertTrue(any("no tag-based test" in error for error in result.errors))
        self.assertEqual(result.normalized_value, json.loads(value))

    def test_accepts_penalty_with_real_condition(self) -> None:
        value = {
            "type": "operation",
            "operator_id": "sum_when_true",
            "args": [
                {
                    "type": "tag",
                    "expected_type": "boolean",
                    "value": "penalty.applies",
                    "is_custom": False,
                    "years_ago": 0,
                },
                {
                    "type": "operation",
                    "operator_id": "to_range",
                    "args": [
                        {"type": "constant", "expected_type": "numeric", "value": 100},
                    ],
                },
            ],
        }

        result = check_indicator_value(
            indicator_key="Penalty",
            value=value,
        )

        self.assertTrue(result.is_valid)
        self.assertEqual(result.errors, ())
        self.assertEqual(result.normalized_value, value)

    def test_accepts_deadline_day_month_constant(self) -> None:
        value = {
            "type": "constant",
            "expected_type": "day_month",
            "value": {"day": 30, "month": 4},
            "unit": None,
            "dimension": None,
        }

        result = check_indicator_value(
            indicator_key="DeadlineFiling",
            value=value,
        )

        self.assertTrue(result.is_valid)
        self.assertEqual(result.errors, ())
        self.assertEqual(result.normalized_value, value)

    def test_day_month_deadline_does_not_emit_warning_only_report(self) -> None:
        value = {
            "type": "constant",
            "expected_type": "day_month",
            "value": {"day": 30, "month": 4},
            "unit": None,
            "dimension": None,
        }

        report = extra_schema_check_report(
            {"DeadlinePreparation": value},
            include_warning_only_keys=True,
        )

        self.assertNotIn("DeadlinePreparation", report)


if __name__ == "__main__":
    unittest.main()
