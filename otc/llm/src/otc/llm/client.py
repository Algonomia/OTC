import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Type
from http import HTTPStatus

import instructor
import openai
from openai import OpenAI
from pydantic import BaseModel

_THINK_RE = re.compile(r"<think>.*?</think>", flags=re.DOTALL | re.IGNORECASE)


def _drop_none(d: dict) -> dict:
    return {k: v for k, v in d.items() if v is not None}


@dataclass
class ChatMessage:
    role: str
    content: str


@dataclass
class OpenAICompatClient:
    provider: str
    model: str
    base_url: Optional[str] = None
    base_url_env_name: str = "LLM_BASE_URL"
    api_key_env_name: str = "LLM_API_KEY"
    temperature: Optional[float] = None
    max_output_tokens: Optional[int] = None
    json_mode: bool = False
    use_instructor: bool = True            
    instructor_max_retries: int = 3          
    instructor_mode: str = "JSON"            

    def __post_init__(self):
        api_key = os.getenv(self.api_key_env_name)
        base_url = self.base_url or os.getenv(self.base_url_env_name)
        if not base_url:
            raise RuntimeError("OpenAICompatClient requires a base URL via base_url or base_url_env_name")
        self._raw = OpenAI(base_url=base_url, api_key=api_key)
        if self.use_instructor:
            mode = getattr(instructor.Mode, self.instructor_mode.upper(), instructor.Mode.JSON)
            self.client = instructor.from_openai(self._raw, mode=mode)
        else:
            self.client = self._raw

    def chat(self, messages: List[ChatMessage], force_raw: bool = False) -> str:
        base_kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": self.temperature,
            "max_tokens": self.max_output_tokens,
        }
        kwargs = _drop_none(base_kwargs)

        if self.json_mode and not self.use_instructor:
            kwargs["response_format"] = {"type": "json_object"}

        # Free-form chat should use the raw OpenAI-compatible client.
        primary_client = self._raw if (force_raw or self.use_instructor) else self.client

        try:
            resp = primary_client.chat.completions.create(**kwargs)
        except (openai.AuthenticationError, openai.RateLimitError, openai.APIConnectionError) as exc:
            raise
        except openai.APIStatusError as exc:
            if exc.status_code in (HTTPStatus.BAD_GATEWAY, HTTPStatus.SERVICE_UNAVAILABLE):
                raise
            stripped = {"model": kwargs["model"], "messages": kwargs["messages"]}
            resp = primary_client.chat.completions.create(**stripped)
        except TypeError:
            resp = self._raw.chat.completions.create(**kwargs)
        except Exception:
            stripped = {"model": kwargs["model"], "messages": kwargs["messages"]}
            resp = primary_client.chat.completions.create(**stripped)

        content = resp.choices[0].message.content if resp.choices else None
        if not content:
            raise RuntimeError("Empty completion")
        content = _THINK_RE.sub("", content).strip()

        # strip accidental code fences
        if content.startswith("```"):
            content = content.strip("` \n")
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()
        return content

    def chat_structured(self, messages: List[ChatMessage], response_model: Type[BaseModel]):
        """
        Returns a *validated* Pydantic model instance.
        If use_instructor=False, raises NotImplementedError (caller can fall back).
        """
        if not self.use_instructor:
            raise NotImplementedError("Instructor disabled on this client")

        base_kwargs: Dict[str, Any] = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": self.temperature,
            "max_tokens": self.max_output_tokens,
            "response_model": response_model,
            "max_retries": self.instructor_max_retries,
        }
        kwargs = _drop_none(base_kwargs)

        result = self.client.chat.completions.create(**kwargs)
        return result
