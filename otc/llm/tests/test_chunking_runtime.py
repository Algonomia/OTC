import tempfile
import unittest
from types import SimpleNamespace

from otc.chunking.runtime import build_chunk_runtime, build_chunk_settings


def _model_config() -> SimpleNamespace:
    return SimpleNamespace(
        provider="openai_compat",
        model="demo-model",
        tokenizer_name=None,
        base_url_env_name="LLM_BASE_URL",
        api_key_env_name="LLM_API_KEY",
        temperature=0.0,
        max_output_tokens=512,
        json_mode=False,
        use_instructor=True,
        instructor_max_retries=3,
        instructor_mode="JSON",
    )


class ChunkingRuntimeTests(unittest.TestCase):
    def test_build_chunk_settings_uses_pipeline_defaults(self) -> None:
        settings = build_chunk_settings({}, _model_config())

        self.assertEqual(settings.context_window, 0)
        self.assertEqual(settings.chunk_size_ratio, 0.08)
        self.assertEqual(settings.overlap_tokens, 250)
        self.assertEqual(settings.retrieval_top_n, 8)
        self.assertEqual(settings.tokenizer_name, "demo-model")

    def test_build_chunk_runtime_works_without_enabled_chunking(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            runtime = build_chunk_runtime(
                chunk_cfg={},
                model_cfg=_model_config(),
                processed_dir=tmpdir,
                chunk_prompt_path=None,
                default_model_key="demo",
            )

        self.assertFalse(runtime.enabled)
        self.assertEqual(runtime.retrieval_top_n, 8)
        self.assertIn("labels", runtime.labeling_prompt)
        self.assertEqual(runtime.store.path_for(7).name, "7.json")


if __name__ == "__main__":
    unittest.main()
