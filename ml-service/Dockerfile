FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY ml-service/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source, models, and analytical scripts
COPY ml-service/ ml-service/
COPY models/ models/
COPY src/ src/
COPY run_pipeline.py run_pipeline.py
COPY paimana_canonical.db paimana_canonical.db

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--app-dir", "ml-service", "--host", "0.0.0.0", "--port", "8000"]
