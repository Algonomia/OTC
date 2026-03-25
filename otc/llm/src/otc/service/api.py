from __future__ import annotations

import asyncio
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

import openai
from fastapi import BackgroundTasks, FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from otc.config import load_app_config, load_model_config, load_pipeline_config
from otc.chunking.runtime import build_chunk_runtime
from otc.chunking.manager import DocumentChunkManager
from otc.chunking.telemetry import LoggingChunkingTelemetry
from otc.io.text_sources import load_text_from_sources
from otc.logging import setup_logger
from otc.pipelines.poc_pipeline import PocPipeline

log = setup_logger("otc.service.api")


class PipelineRequest(BaseModel):
    source_id: int = Field(..., description="Unique identifier for the source document")
    jurisdictions: List[str]
    obligations_type_ids: List[str]
    indicators_ids: List[str]
    file_paths: Optional[List[str]] = None
    file_urls: Optional[List[str]] = None
    text: Optional[str] = None
    request_name: Optional[str] = Field(None, description="Optional name for persisted outputs")

    model_config = ConfigDict(extra="allow")


class ChunkLabelRequest(BaseModel):
    source_id: int
    file_paths: Optional[List[str]] = None
    file_urls: Optional[List[str]] = None
    text: Optional[str] = None
    jurisdictions: Optional[List[str]] = None
    obligations: Optional[List[str]] = None
    request_name: Optional[str] = None

    model_config = ConfigDict(extra="allow")


class JobStatus(BaseModel):
    job_id: str
    status: Literal["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"]
    values: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None
    retry_after: Optional[str] = None  # ISO datetime string, set when rate limited


_jobs: Dict[str, JobStatus] = {}
def _vacuum_jobs() -> None:
    terminal = {"COMPLETED", "FAILED"}
    to_delete = [job_id for job_id, job in _jobs.items() if job.status in terminal]
    for job_id in to_delete:
        del _jobs[job_id]

async def _vacuum_jobs_loop() -> None:
    """Run _vacuum_jobs at midnight Tue–Sat (cron: 0 0 * * 2-6)."""
    while True:
        now = datetime.now(timezone.utc)
        next_midnight = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        await asyncio.sleep((next_midnight - now).total_seconds())
        if next_midnight.weekday() not in {0, 6}:
            _vacuum_jobs()

@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(_vacuum_jobs_loop())
    yield
    task.cancel()


app = FastAPI(title="OTC LLM Microservice", version="1.0.0", lifespan=lifespan)

APP_CONFIG = load_app_config()
PIPELINE_CFG = load_pipeline_config()
MODEL_CFG = load_model_config(PIPELINE_CFG["model_key"])
CHUNK_CFG = PIPELINE_CFG.get("chunking", {}) or {}
MLFLOW_CFG = PIPELINE_CFG.get("mlflow", {}) or {}
MLFLOW_ENABLED = bool(MLFLOW_CFG.get("enabled", False))

PIPELINE = PocPipeline()
CHUNK_RUNTIME = build_chunk_runtime(
    chunk_cfg=CHUNK_CFG,
    model_cfg=MODEL_CFG,
    processed_dir=Path(APP_CONFIG.processed_dir),
    chunk_prompt_path=APP_CONFIG.prompts.get("chunk_labeler_sys"),
    default_model_key=PIPELINE_CFG["model_key"],
)
CHUNK_SETTINGS = CHUNK_RUNTIME.settings
CHUNK_STORE = CHUNK_RUNTIME.store
CHUNK_LABEL_CLIENT = CHUNK_RUNTIME.labeling_client
CHUNK_PROMPT = CHUNK_RUNTIME.labeling_prompt


def _is_http_source(value: str) -> bool:
    return value.startswith(("http://", "https://"))


def _validate_sources(paths: Optional[List[str]]) -> None:
    if not paths:
        return
    missing = [path for path in paths if not _is_http_source(path) and not Path(path).exists()]
    if missing:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail={"error": "Missing files", "paths": missing})


@app.post("/pipeline/run", status_code=HTTPStatus.ACCEPTED)
async def run_pipeline(request: PipelineRequest, background_tasks: BackgroundTasks) -> Dict[str, Any]:
    payload = request.model_dump(exclude_none=True)
    request_name = payload.pop("request_name", None)
    file_paths = payload.get("file_paths") or payload.get("file_urls")
    if file_paths and "file_paths" not in payload:
        payload["file_paths"] = file_paths
    text = payload.get("text")

    if not text and not file_paths:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Either 'text' or one of ['file_paths', 'file_urls'] must be provided")

    _validate_sources(file_paths)

    job_id = str(uuid.uuid4())
    _jobs[job_id] = JobStatus(job_id=job_id, status="PENDING")
    background_tasks.add_task(_run_pipeline_job, job_id, payload, request_name)

    return {"job_id": job_id}


@app.get("/pipeline/job/{job_id}")
async def get_pipeline_job(job_id: str) -> JobStatus:
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail=f"Job {job_id} not found")
    return job


async def _run_pipeline_job(job_id: str, payload: Dict[str, Any], request_name: Optional[str]) -> None:
    _jobs[job_id].status = "IN_PROGRESS"
    try:
        result = await asyncio.to_thread(
            PIPELINE.process_request,
            payload,
            request_name=request_name,
            persist=True,
            mlflow_enabled=MLFLOW_ENABLED,
        )
        _jobs[job_id].status = "COMPLETED"
        _jobs[job_id].values = result.get("values", [])
    except openai.RateLimitError as exc:
        _jobs[job_id].status = "FAILED"
        _jobs[job_id].error = str(exc)
        retry_after_seconds = PIPELINE_CFG.get("rate_limit", {}).get("retry_after_seconds")
        if retry_after_seconds:
            _jobs[job_id].retry_after = (datetime.now(timezone.utc) + timedelta(seconds=retry_after_seconds)).isoformat()
    except Exception as exc:
        _jobs[job_id].status = "FAILED"
        _jobs[job_id].error = str(exc)


@app.post("/chunk/label")
async def label_chunks(request: ChunkLabelRequest) -> Dict[str, Any]:
    payload = request.model_dump(exclude_none=True)
    request_name = payload.get("request_name")

    file_paths = payload.get("file_paths") or payload.get("file_urls")
    text = payload.get("text")

    if not text and not file_paths:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail="Either 'text' or one of ['file_paths', 'file_urls'] must be provided")

    log.info(
        "Chunking label request received for source_id=%s request_name=%s file_paths=%s has_text=%s",
        request.source_id,
        request_name,
        file_paths,
        bool(text),
    )
    _validate_sources(file_paths)
    if not text and file_paths:
        text = load_text_from_sources(file_paths)

    jurisdictions = payload.get("jurisdictions") or []
    obligations = payload.get("obligations") or []

    chunk_manager = DocumentChunkManager(
        settings=CHUNK_SETTINGS,
        store=CHUNK_STORE,
        labeling_client=CHUNK_LABEL_CLIENT,
        labeling_prompt=CHUNK_PROMPT,
        telemetry=LoggingChunkingTelemetry(),
    )
    chunk_manager.prepare(
        source_id=request.source_id,
        text=text,
        jurisdictions=jurisdictions,
        obligations=obligations,
    )

    bundle = chunk_manager.bundle
    if not bundle:
        return {
            "message": "Chunking not triggered (document below threshold)",
            "json_path": None,
        }

    chunk_path = CHUNK_STORE.path_for(request.source_id)

    result = bundle.to_dict()
    result_metadata = {
        "json_path": str(chunk_path),
        "chunk_count": len(bundle.chunks),
        "request_name": request_name,
    }
    return {"bundle": result, "metadata": result_metadata}
