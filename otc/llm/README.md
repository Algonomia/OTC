# OTC LLM Microservice

OTC LLM extracts transfer-pricing obligation data from regulatory text/PDFs and returns structured indicator rows.

Current `/pipeline/run` is asynchronous and returns a job identifier, for example:

```json
{
  "job_id": "7e3bf86e-aea8-4024-af67-2f33fd564dcb"
}
```

Use `GET /pipeline/job/{job_id}` to fetch status and completed values. The service still persists full run artifacts under `data/processed/` as `.json` files.

---

## What The Pipeline Does

For each request (source x jurisdiction x obligation), `PocPipeline` runs these stages:

1. Load source text from:
- inline `text`, or
- `file_paths` / `file_urls` (HTTP JSON endpoint with `text`, or local PDF/TXT).

2. Optional chunking + retrieval context (`pipeline.chunking`):
- triggered by chunking parameters set in pipeline.yaml, 
- tokenizes and chunks long documents,
- labels chunks by jurisdiction/obligation,
- retrieves top-N relevant chunks per pair.

3. Extraction by indicator group:
- `overview`
- `deadline`
- `threshold`
- `penalty`

4. Optional schema verification + retry (`pipeline.schema_verification`):
- runs extra ComplexValue schema checks,
- retries with task-specific retry prompts if configured.

5. Optional simplified LLM evaluation (`pipeline.evaluation.simplified`):
- scores each extracted indicator row,
- attaches score/reasoning to each output row.

6. Output normalization:
- enriches each row with:
  - `additional_value`
  - `tag_notes`
  - `llm_evaluation_score`
  - `llm_evaluation_reasoning`

7. Persistence:
- writes run JSON to `data/processed/`.

---

## Repository Structure

- `src/otc/service/api.py`
  - FastAPI endpoints (`/pipeline/run`, `/chunk/label`).
- `src/otc/pipelines/poc_pipeline.py`
  - End-to-end orchestration.
- `src/otc/extractors/`
  - Group-specific extractors (`overview`, `deadline`, `threshold`, `penalty`).
- `src/otc/validation/schema_retry.py`
  - Extra schema checks and retry flow.
- `src/otc/evaluation/simplified_judge.py`
  - Simplified per-indicator judge (more complicated multiple-judge evaluation in progress).
- `src/otc/chunking/`
  - Chunking, labeling, retrieval, telemetry.
- `src/otc/io/text_sources.py`
  - Source loading (URL/PDF/TXT).
- `configs/app.yaml`
  - Paths, prompt bindings, schema bindings, indicator maps.
- `configs/pipeline.yaml`
  - Pipeline behavior toggles (chunking/schema verification/evaluation/mlflow).
- `configs/models.yaml`
  - Model endpoints and inference settings.
- `prompts/`
  - Extraction, addendum, retry, and evaluation prompts.

---

## Quick Start (Docker)

Docker is the recommended way to run this microservice in normal usage.

```bash
cd otc/llm
docker compose up --build -d app
```

Notes:
- By default, only `app` runs.
- `mlflow` service is optional and profile-gated.
- Data/logs/mlruns are mounted from host directories.

To enable MLflow container + tracking:

```bash
cd otc/llm
OTC_ENABLE_MLFLOW=true MLFLOW_TRACKING_URI=http://mlflow:5000 docker compose --profile mlflow up --build -d
```

---

## Quick Start (Local Python, Source Checkout Only)

This path is mainly for local development or debugging from a source checkout. It is currently not intended to be used as a standalone installed Python package.

```bash
cd otc/llm
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install .
export PYTHONPATH=src
uvicorn otc.service.api:app --host 0.0.0.0 --port 8090
```

---

## Serve A Local Model With vLLM (Example: Qwen3-14B)

* For single-GPU local serving, quantized LLMs are recommended because they reduce model memory usage and leave more VRAM for KV cache. A larger KV cache improves long-context capacity and, on backends that support prefix/prompt caching (e.g., vLLM), improves reuse of shared prompt prefixes; this project’s prompts are intentionally structured to maximize that reuse. For the examples in this README, the served model is Qwen3-14B in FP16 (non-quantized) mode.

Start vLLM in OpenAI-compatible mode:

```bash
vllm serve qwen/qwen3-14b --host 0.0.0.0 --port 8181 --max-model-len 30000
```

Or with a local model path:

```bash
vllm serve /path/to/Qwen3-14B --host 0.0.0.0 --port 8181 --max-model-len 30000
```

Set OTC LLM environment variables to point to that endpoint:

- If OTC LLM runs locally (uvicorn on host):
  - `LLM_BASE_URL=http://127.0.0.1:8181/v1`
- If OTC LLM runs in Docker:
  - `LLM_BASE_URL=http://host.docker.internal:8181/v1`
- For vLLM without auth:
  - `LLM_API_KEY=EMPTY`
- Model profile:
  - `OTC_MODEL_KEY=qwen3_14b`
- Served model identifier:
  - `LLM_MODEL_ID=qwen/qwen3-14b` (or any other served model/path name)

Minimal `.env` example for local vLLM:

```dotenv
LLM_BASE_URL=http://host.docker.internal:8181/v1
LLM_API_KEY=EMPTY
OTC_MODEL_KEY=qwen3_14b
OTC_LABELING_MODEL_KEY=qwen3_14b
LLM_MODEL_ID=qwen/qwen3-14b
```

After updating env vars, restart OTC LLM (`uvicorn` or `docker compose up --build -d app`).

---

## API: `/pipeline/run`

### Request

Required:
- `source_id`
- `jurisdictions`
- `obligations_type_ids`
- `indicators_ids`

Plus one of:
- `text`, or
- `file_paths`, or
- `file_urls` (alias of `file_paths`)

Additional metadata fields (like `source_name`, `organization`, `organization_type_id`, `date_of_publication`) are accepted and can be used in prompts/context.

Example:

```json
{
  "source_id": 123,
  "source_name": "OECD_Transfer_Pricing_Country_Profiles_Austria_AT.pdf",
  "organization": "OECCD",
  "organization_type_id": "InternationalOrganization",
  "date_of_publication": "01/07/2025",
  "jurisdictions": ["AT"],
  "obligations_type_ids": ["CbCR"],
  "indicators_ids": [
    "IsObligationInPlace",
    "LocalLanguage",
    "DeadlineFiling",
    "ThresholdPreparation",
    "ThresholdFiling"
  ],
  "file_paths": ["/app/data/test_inputs/OECD_Transfer_Pricing_Country_Profiles_Austria_AT.pdf"]
}
```

### Immediate Response

```json
{
  "job_id": "7e3bf86e-aea8-4024-af67-2f33fd564dcb"
}
```

The endpoint returns HTTP `202 Accepted` and continues processing in the background.

### Job Status Response

Poll `GET /pipeline/job/{job_id}` until the job reaches `COMPLETED` or `FAILED`.

```json
{
  "job_id": "7e3bf86e-aea8-4024-af67-2f33fd564dcb",
  "status": "COMPLETED",
  "values": [
    {
      "source_id": 123,
      "jurisdiction": "AT",
      "obligation_type_id": "CbCR",
      "key": "ThresholdPreparation",
      "value": {},
      "notes": "...",
      "references": "...",
      "additional_value": null,
      "tag_notes": {},
      "llm_evaluation_score": 100,
      "llm_evaluation_reasoning": "..."
    }
  ],
  "error": null,
  "retry_after": null
}
```

### Test With Curl

```bash
cat > /tmp/otc_request.json <<'JSON'
{
  "source_id": 123,
  "source_name": "OECD_Transfer_Pricing_Country_Profiles_Austria_AT.pdf",
  "organization": "OECD",
  "organization_type_id": "InternationalOrganization",
  "date_of_publication": "01/07/2026",
  "jurisdictions": ["AT"],
  "obligations_type_ids": ["CbCR"],
  "indicators_ids": ["IsObligationInPlace", "LocalLanguage", "DeadlineFiling", "ThresholdPreparation", "ThresholdFiling"],
  "file_paths": ["/app/data/test_inputs/OECD_Transfer_Pricing_Country_Profiles_Austria_AT.pdf"]
}
JSON

job_id=$(curl -sS -X POST http://localhost:8090/pipeline/run \
  -H "Content-Type: application/json" \
  -d @/tmp/otc_request.json | jq -r '.job_id')

curl -sS "http://localhost:8090/pipeline/job/${job_id}" | jq .
```

---

## API: `/chunk/label`

`/chunk/label` runs chunking/labeling only and returns chunk bundle metadata. It accepts `text` or `file_paths`/`file_urls` similarly.

---

## Configuration Guide

### `configs/app.yaml`

Controls:
- data directories (`incoming_dir`, `processed_dir`)
- prompt paths (unified/system/task prompts)
- schema bindings (`overview_class`, `deadline_class`, `threshold_class`, `penalty_class`)
- indicator groups and field maps (including overview, deadline and threshold split keys).

### `configs/pipeline.yaml`

Main runtime switches:
- `retries`: extraction parse/validation retries.
- `mlflow.enabled`: batch-mode MLflow default (overridable by env).
- `schema_verification`:
  - `enabled`
  - `max_tries`
  - `fail_on_warnings`
  - `retry_prompts_dir`
- `chunking`:
  - context window
  - chunk ratio/size/overlap
  - retrieval top-N
  - labeling model selection
- `evaluation`:
  - enable/disable evaluation
  - simplified judge config and prompts.

### `configs/models.yaml`

Defines model profiles keyed by `model_key`:
- provider
- model name (with env override)
- base URL env variable
- API key env variable
- temperature / tokens / instructor mode.

---

## Environment Variables

Use `.env_example` as template. Typical keys:
- `LLM_BASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL_ID`
- `OTC_MODEL_KEY`
- `OTC_LABELING_MODEL_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OTC_ENABLE_MLFLOW`
- `MLFLOW_TRACKING_URI`
- `MLFLOW_EXPERIMENT_NAME`

Important:
- Do not commit real credentials.
- Keep `.env` local/private.

---

## MLflow Monitoring

When MLflow is enabled:
- pipeline logs metrics/tags/artifacts,
- chunking telemetry can also emit MLflow metrics,
- tracking URI and experiment name come from env/config.

When disabled:
- pipeline runs normally,
- MLflow service/container is not required.

---

## Programmatic Use

```python
import json
from pathlib import Path
from otc.pipelines.poc_pipeline import PocPipeline

pipeline = PocPipeline()
request = json.loads(Path("examples/incoming/source_3.json").read_text())
result = pipeline.process_request(request, persist=True, mlflow_enabled=False)
print(result["values"])
```

---

## Developer Notes

- Prompt changes are under `prompts/` and take effect after service restart/rebuild.
- Output files are still written to `data/processed/`; `/pipeline/run` now returns a `job_id`, and final values are available via `/pipeline/job/{job_id}`.
- Legacy aliases are still supported for some indicator keys (for backward compatibility).
- If Docker output doesn’t reflect latest code, rebuild with `--no-cache` and force recreate.

```bash
docker compose down --remove-orphans
docker compose build --no-cache app
docker compose up -d --force-recreate app
```
