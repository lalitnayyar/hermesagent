FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend /app/backend

ENV PYTHONPATH=/app
ENV AGENTFLOW_DATABASE_URL=sqlite:////app/data/database/agentflow.db
ENV AGENTFLOW_BACKEND_URL=http://agentflow-backend:8080

CMD ["python", "-m", "backend.worker"]
