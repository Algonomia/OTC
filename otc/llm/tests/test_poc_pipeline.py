import unittest
from types import SimpleNamespace
from unittest.mock import patch

from otc.pipelines.poc_pipeline import PocPipeline
from otc.validation.post_generation_checks import (
    STATUS_EMPTY,
    STATUS_SUCCESS,
    STATUS_POST_GENERATION_SCHEMA_CHECK_FAILED,
)


class _FakeModel:
    def __init__(self, payload):
        self._payload = payload

    def model_dump(self, mode="json", exclude_none=True):
        return self._payload


class PocPipelineNormalizationTests(unittest.TestCase):
    def test_normalize_request_uses_explicit_text_and_metadata(self) -> None:
        pipeline = PocPipeline.__new__(PocPipeline)

        payload = pipeline._normalize_request(
            {
                "source_id": 12,
                "source_name": "doc.pdf",
                "organization": "OECD",
                "organization_type_id": "IO",
                "jurisdictions": ["AT"],
                "jurisdiction_names": {"AT": "Austria"},
                "obligations_type_ids": ["CbCR"],
                "indicators_ids": ["Penalty"],
                "text": "source text",
            },
            request_name="demo-request",
            epoch=123,
        )

        self.assertEqual(payload.source_id, 12)
        self.assertEqual(payload.text, "source text")
        self.assertEqual(payload.request_name, "demo-request")
        self.assertEqual(payload.epoch, 123)
        self.assertEqual(payload.jurisdiction_names["AT"], "Austria")

    def test_normalize_request_loads_file_urls_when_text_missing(self) -> None:
        pipeline = PocPipeline.__new__(PocPipeline)

        with patch(
            "otc.pipelines.poc_pipeline.load_text_from_sources",
            return_value="loaded text",
        ) as load_text, patch(
            "otc.pipelines.poc_pipeline.time.time",
            return_value=1000,
        ), patch(
            "otc.pipelines.poc_pipeline.uuid4",
            return_value=SimpleNamespace(hex="abcdef123456"),
        ):
            payload = pipeline._normalize_request(
                {
                    "source_id": 99,
                    "jurisdictions": ["AT"],
                    "obligations_type_ids": ["CbCR"],
                    "indicators_ids": ["Penalty"],
                    "file_urls": ["https://example.test/source.json"],
                },
                request_name=None,
                epoch=None,
            )

        load_text.assert_called_once_with(["https://example.test/source.json"])
        self.assertEqual(payload.text, "loaded text")
        self.assertEqual(payload.request_name, "99-1000-abcdef")
        self.assertEqual(payload.epoch, 1000)


class PocPipelinePostGenerationTests(unittest.TestCase):
    def _build_pipeline(self) -> PocPipeline:
        pipeline = PocPipeline.__new__(PocPipeline)
        pipeline.client = object()
        pipeline.unified_extraction_sys = "unified"
        pipeline.ThresholdCls = object
        pipeline.threshold_task_spec = "threshold-task"
        pipeline.retries = 1
        pipeline.threshold_field_map = {
            "Threshold": "threshold_preparation",
            "ThresholdPreparation": "threshold_preparation",
            "ThresholdFiling": "threshold_filing",
        }
        pipeline.schema_verification_enabled = False
        return pipeline

    def test_threshold_preparation_if_true_is_normalized_to_required_constant(self) -> None:
        pipeline = self._build_pipeline()
        output_values = []
        audit_rows = []
        eval_calls = []

        threshold_payload = {
            "threshold_preparation": {
                "value": {
                    "type": "operation",
                    "operator_id": "if",
                    "args": [
                        {"type": "constant", "expected_type": "boolean", "value": True},
                        {"type": "constant", "expected_type": "string", "value": "required"},
                    ],
                },
                "notes": "generated threshold",
                "references": "OECD 1",
            }
        }

        with patch(
            "otc.pipelines.poc_pipeline.extract_threshold",
            return_value=_FakeModel(threshold_payload),
        ):
            pipeline._extract_threshold_group(
                source_id=1,
                jurisdiction="AU",
                obligation_type="CbCR",
                requested=["ThresholdPreparation"],
                active_text="text",
                document_packet="packet",
                obligation_addendum="",
                output_values=output_values,
                value_row_index={},
                ml_ctx=None,
                mlflow_enabled=False,
                run_simplified_eval=lambda **kwargs: eval_calls.append(kwargs),
                record_audit=lambda **row: audit_rows.append(row),
            )

        self.assertEqual(len(output_values), 1)
        self.assertEqual(
            output_values[0]["value"],
            {
                "type": "constant",
                "expected_type": "string",
                "value": "required",
            },
        )
        self.assertEqual(len(audit_rows), 1)
        self.assertEqual(audit_rows[0]["status"], STATUS_SUCCESS)
        self.assertEqual(audit_rows[0]["raw_generated_value"], threshold_payload["threshold_preparation"]["value"])
        self.assertEqual(audit_rows[0]["returned_value"], output_values[0]["value"])
        self.assertTrue(audit_rows[0]["returned_to_downstream"])
        self.assertEqual(len(eval_calls), 1)
        self.assertEqual(eval_calls[0]["candidate_value"], output_values[0]["value"])

    def test_threshold_group_suppresses_invalid_generated_value(self) -> None:
        pipeline = self._build_pipeline()
        output_values = []
        value_row_index = {}
        audit_rows = []
        eval_calls = []

        invalid_threshold = {
            "threshold_preparation": {
                "value": {
                    "type": "operation",
                    "operator_id": "if",
                    "args": [
                        {"type": "constant", "expected_type": "boolean", "value": True},
                        {"type": "constant", "expected_type": "string", "value": "required"},
                    ],
                },
                "notes": "generated threshold",
                "references": "OECD 1",
            }
        }

        with patch(
            "otc.pipelines.poc_pipeline.extract_threshold",
            return_value=_FakeModel(invalid_threshold),
        ):
            pipeline._extract_threshold_group(
                source_id=1,
                jurisdiction="AU",
                obligation_type="CbCR",
                requested=["Threshold"],
                active_text="text",
                document_packet="packet",
                obligation_addendum="",
                output_values=output_values,
                value_row_index=value_row_index,
                ml_ctx=None,
                mlflow_enabled=False,
                run_simplified_eval=lambda **kwargs: eval_calls.append(kwargs),
                record_audit=lambda **row: audit_rows.append(row),
            )

        self.assertEqual(output_values, [])
        self.assertEqual(len(audit_rows), 1)
        self.assertEqual(audit_rows[0]["status"], STATUS_POST_GENERATION_SCHEMA_CHECK_FAILED)
        self.assertIn("boolean constant", audit_rows[0]["error_message"])
        self.assertEqual(audit_rows[0]["raw_generated_notes"], "generated threshold")
        self.assertFalse(audit_rows[0].get("returned_to_downstream", False))
        self.assertEqual(len(eval_calls), 1)
        self.assertIsNone(eval_calls[0]["candidate_value"])

    def test_threshold_group_records_empty_when_rule_missing(self) -> None:
        pipeline = self._build_pipeline()
        audit_rows = []

        with patch(
            "otc.pipelines.poc_pipeline.extract_threshold",
            return_value=_FakeModel({}),
        ):
            pipeline._extract_threshold_group(
                source_id=1,
                jurisdiction="AU",
                obligation_type="CbCR",
                requested=["Threshold"],
                active_text="text",
                document_packet="packet",
                obligation_addendum="",
                output_values=[],
                value_row_index={},
                ml_ctx=None,
                mlflow_enabled=False,
                run_simplified_eval=lambda **kwargs: None,
                record_audit=lambda **row: audit_rows.append(row),
            )

        self.assertEqual(len(audit_rows), 1)
        self.assertEqual(audit_rows[0]["status"], STATUS_EMPTY)


if __name__ == "__main__":
    unittest.main()
