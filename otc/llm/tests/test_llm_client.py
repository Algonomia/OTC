import unittest
from types import SimpleNamespace
from unittest.mock import patch
from pydantic import BaseModel
from otc.llm.client import ChatMessage, OpenAICompatClient


class _ResponseModel(BaseModel):
    value: str = "ok"


class _FakeCompletions:
    def __init__(self, content: str):
        self.content = content
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content=self.content),
                )
            ]
        )


class _FakeOpenAIClient:
    def __init__(self, content: str):
        self.chat = SimpleNamespace(completions=_FakeCompletions(content))


class OpenAICompatClientTests(unittest.TestCase):
    def test_chat_uses_raw_client_when_force_raw_is_true(self) -> None:
        raw_client = _FakeOpenAIClient("raw-response")
        wrapped_client = _FakeOpenAIClient("wrapped-response")

        with patch("otc.llm.client.OpenAI", return_value=raw_client), patch(
            "otc.llm.client.instructor.from_openai",
            return_value=wrapped_client,
        ):
            client = OpenAICompatClient(
                provider="openai_compat",
                model="demo-model",
                base_url="http://example.test",
                use_instructor=True,
            )
            content = client.chat([ChatMessage(role="user", content="hello")], force_raw=True)

        self.assertEqual(content, "raw-response")
        self.assertEqual(len(raw_client.chat.completions.calls), 1)
        self.assertEqual(len(wrapped_client.chat.completions.calls), 0)

    def test_chat_uses_raw_client_for_free_form_chat_with_instructor_enabled(self) -> None:
        raw_client = _FakeOpenAIClient("raw-response")
        wrapped_client = _FakeOpenAIClient("wrapped-response")

        with patch("otc.llm.client.OpenAI", return_value=raw_client), patch(
            "otc.llm.client.instructor.from_openai",
            return_value=wrapped_client,
        ):
            client = OpenAICompatClient(
                provider="openai_compat",
                model="demo-model",
                base_url="http://example.test",
                use_instructor=True,
            )
            content = client.chat([ChatMessage(role="user", content="hello")])

        self.assertEqual(content, "raw-response")
        self.assertEqual(len(raw_client.chat.completions.calls), 1)
        self.assertEqual(len(wrapped_client.chat.completions.calls), 0)

    def test_chat_structured_uses_wrapped_client(self) -> None:
        raw_client = _FakeOpenAIClient("raw-response")
        wrapped_client = _FakeOpenAIClient("wrapped-response")
        sentinel = _ResponseModel(value="structured")
        wrapped_client.chat.completions.create = lambda **kwargs: sentinel

        with patch("otc.llm.client.OpenAI", return_value=raw_client), patch(
            "otc.llm.client.instructor.from_openai",
            return_value=wrapped_client,
        ):
            client = OpenAICompatClient(
                provider="openai_compat",
                model="demo-model",
                base_url="http://example.test",
                use_instructor=True,
            )
            result = client.chat_structured([ChatMessage(role="user", content="hello")], _ResponseModel)

        self.assertIs(result, sentinel)


if __name__ == "__main__":
    unittest.main()
