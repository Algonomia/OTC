FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN mkdir -p data/processed/chunk_metadata \
    && pip install --no-cache-dir .

EXPOSE 8090

CMD ["uvicorn", "otc.service.api:app", "--host", "0.0.0.0", "--port", "8090"]
