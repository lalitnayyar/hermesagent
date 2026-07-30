FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY backend/worker.py ./worker.py

ENV PYTHONPATH=/app
ENV AGENTFLOW_DATABASE_URL=sqlite:////app/data/database/agentflow.db

RUN mkdir -p /app/data/database /app/data/uploads /app/data/reports /app/data/logs /app/data/backups

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:8080/api/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
