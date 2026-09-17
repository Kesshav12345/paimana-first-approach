FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY ml-service/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source, models, and canonical database
COPY ml-service/ ml-service/
COPY models/ models/
COPY paimana_canonical.db paimana_canonical.db

EXPOSE 8000

CMD ["sh", "-c", "python -m uvicorn main:app --app-dir ml-service --host 0.0.0.0 --port ${PORT:-8000}"]
