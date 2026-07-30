import time
import httpx
import os
from backend.app.config import settings
from backend.app.database import SessionLocal
from backend.app import models

BACKEND_URL = os.environ.get("AGENTFLOW_BACKEND_URL", "http://agentflow-backend:8080")
API_KEY = settings.agentflow_secret_key


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def poll_queued_tasks():
    db = SessionLocal()
    try:
        tasks = (
            db.query(models.Task)
            .filter(models.Task.status == "queued")
            .filter((models.Task.run_id == None) | (models.Task.run_id == ""))
            .all()
        )
        for task in tasks:
            try:
                resp = httpx.post(f"{BACKEND_URL}/api/tasks/{task.id}/run", timeout=30)
                print(f"Started task {task.id}: {resp.status_code}")
            except Exception as e:
                print(f"Failed to start task {task.id}: {e}")
    finally:
        db.close()


def poll_schedules():
    # Placeholder: in production, evaluate cron expressions and trigger workflows.
    pass


def main():
    print("AgentFlow worker started")
    while True:
        try:
            poll_queued_tasks()
            poll_schedules()
        except Exception as e:
            print(f"Worker error: {e}")
        time.sleep(5)


if __name__ == "__main__":
    main()
