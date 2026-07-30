import asyncio
import json
from datetime import datetime
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.app import models, schemas
from backend.app.database import get_db
from backend.app.routers._common import make_crud_router, log, AuditLogCreate
from backend.app.hermes_client import hermes_health
from backend.app.config import settings
from backend.app.runner import run_manager

router = APIRouter(prefix="/api")


# Generic CRUD routers
router.include_router(make_crud_router("/agents", models.Agent, schemas.AgentCreate, schemas.AgentCreate, schemas.Agent))
router.include_router(make_crud_router("/workflows", models.Workflow, schemas.WorkflowCreate, schemas.WorkflowCreate, schemas.Workflow))
router.include_router(make_crud_router("/approvals", models.Approval, schemas.ApprovalCreate, schemas.ApprovalCreate, schemas.Approval))
router.include_router(make_crud_router("/skills", models.Skill, schemas.SkillCreate, schemas.SkillCreate, schemas.Skill))
router.include_router(make_crud_router("/memory", models.Memory, schemas.MemoryCreate, schemas.MemoryCreate, schemas.Memory))
router.include_router(make_crud_router("/tools", models.Tool, schemas.ToolCreate, schemas.ToolCreate, schemas.Tool))
router.include_router(make_crud_router("/models", models.HermesModel, schemas.ModelCreate, schemas.ModelCreate, schemas.Model))


@router.get("/health")
def health() -> schemas.HealthResponse:
    hermes = hermes_health()
    db_status = "ok"
    try:
        from sqlalchemy import text
        from backend.app.database import engine
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {e}"
    return schemas.HealthResponse(
        status="ok" if db_status == "ok" and hermes.reachable else "degraded",
        version=settings.app_version,
        environment=settings.environment,
        database=db_status,
        hermes=hermes,
    )


@router.get("/tasks")
def list_tasks(db: Session = Depends(get_db)) -> list[schemas.Task]:
    items = db.query(models.Task).all()
    return [schemas.Task.model_validate(i) for i in items]


@router.post("/tasks")
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)) -> schemas.Task:
    data = payload.model_dump()
    data["id"] = data.get("id") or str(uuid4())[:8]
    item = models.Task(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    log(db, AuditLogCreate(action="create", entity_type="task", entity_id=item.id, message=f"Created task {item.id}"))
    return schemas.Task.model_validate(item)


@router.patch("/tasks/{task_id}")
def update_task(task_id: str, payload: dict, db: Session = Depends(get_db)) -> schemas.Task:
    item = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in payload.items():
        if value is not None and hasattr(item, key):
            setattr(item, key, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return schemas.Task.model_validate(item)


@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)) -> dict:
    item = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(item)
    db.commit()
    log(db, AuditLogCreate(action="delete", entity_type="task", entity_id=task_id, message=f"Deleted task {task_id}"))
    return {"success": True}


@router.get("/schedules")
def list_schedules(db: Session = Depends(get_db)) -> list[schemas.Schedule]:
    items = db.query(models.Schedule).all()
    return [schemas.Schedule.model_validate(i) for i in items]


@router.post("/schedules")
def create_schedule(payload: schemas.ScheduleCreate, db: Session = Depends(get_db)) -> schemas.Schedule:
    item = models.Schedule(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    log(db, AuditLogCreate(action="create", entity_type="schedule", entity_id=str(item.id), message=f"Created schedule {item.id}"))
    return schemas.Schedule.model_validate(item)


@router.patch("/schedules/{schedule_id}")
def update_schedule(schedule_id: int, payload: dict, db: Session = Depends(get_db)) -> schemas.Schedule:
    item = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Schedule not found")
    for key, value in payload.items():
        if value is not None and hasattr(item, key):
            setattr(item, key, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return schemas.Schedule.model_validate(item)


@router.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)) -> dict:
    item = db.query(models.Schedule).filter(models.Schedule.id == schedule_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(item)
    db.commit()
    log(db, AuditLogCreate(action="delete", entity_type="schedule", entity_id=str(schedule_id), message=f"Deleted schedule {schedule_id}"))
    return {"success": True}


@router.post("/tasks/{task_id}/run")
def run_task(task_id: str, db: Session = Depends(get_db)) -> schemas.RunResponse:
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = "running"
    task.progress = 0
    task.run_id = str(uuid4())[:8]
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    run_manager.start(task.run_id, "task", {"task_id": task_id, "title": task.title, "agent": task.agent, "workflow": task.workflow})
    log(db, AuditLogCreate(action="run", entity_type="task", entity_id=task_id, message=f"Started task run {task.run_id}"))
    return schemas.RunResponse(run_id=task.run_id)


@router.post("/approvals/{approval_id}/approve")
def approve(approval_id: str, db: Session = Depends(get_db)) -> dict:
    item = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Approval not found")
    item.status = "approved"
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    log(db, AuditLogCreate(action="approve", entity_type="approval", entity_id=approval_id, message=f"Approved {approval_id}"))
    run_id = None
    if item.task_id:
        task = db.query(models.Task).filter(models.Task.id == item.task_id).first()
        if task:
            task.status = "running"
            task.progress = 0
            task.run_id = str(uuid4())[:8]
            task.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(task)
            run_manager.start(task.run_id, "task", {"task_id": task.id, "title": task.title, "agent": task.agent, "workflow": task.workflow})
            run_id = task.run_id
    return {"approval": schemas.Approval.model_validate(item), "run_id": run_id}


@router.post("/approvals/{approval_id}/reject")
def reject(approval_id: str, db: Session = Depends(get_db)) -> dict:
    item = db.query(models.Approval).filter(models.Approval.id == approval_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Approval not found")
    item.status = "rejected"
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    log(db, AuditLogCreate(action="reject", entity_type="approval", entity_id=approval_id, message=f"Rejected {approval_id}"))
    return {"approval": schemas.Approval.model_validate(item)}


@router.get("/settings")
def get_settings(db: Session = Depends(get_db)) -> dict:
    rows = db.query(models.AppSettings).all()
    return {r.key: r.value for r in rows}


@router.patch("/settings")
def update_settings(payload: dict, db: Session = Depends(get_db)) -> dict:
    for key, value in payload.items():
        row = db.query(models.AppSettings).filter(models.AppSettings.key == key).first()
        if row:
            row.value = value
            row.updated_at = datetime.utcnow()
        else:
            db.add(models.AppSettings(key=key, value=value))
    db.commit()
    log(db, AuditLogCreate(action="update", entity_type="settings", entity_id="global", message="Settings updated"))
    return {r.key: r.value for r in db.query(models.AppSettings).all()}


@router.get("/system/activity")
def activity(db: Session = Depends(get_db)) -> list[schemas.ActivityItem]:
    items = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(50).all()
    return [schemas.ActivityItem.model_validate(i) for i in items]


@router.post("/run")
def run_generic(request: schemas.RunRequest, db: Session = Depends(get_db)) -> schemas.RunResponse:
    run_id = str(uuid4())[:8]
    run_manager.start(run_id, request.type, request.payload)
    log(db, AuditLogCreate(action="run", entity_type=request.type, entity_id=run_id, message=f"Started generic run {run_id}"))
    return schemas.RunResponse(run_id=run_id)


@router.get("/run/{run_id}")
def get_run(run_id: str, db: Session = Depends(get_db)) -> dict:
    task = db.query(models.Task).filter(models.Task.run_id == run_id).first()
    if not task:
        return {"run_id": run_id, "status": "unknown"}
    return {"run_id": run_id, "task_id": task.id, "status": task.status, "progress": task.progress}


@router.get("/run/{run_id}/events")
def events(run_id: str, request: Request):
    async def stream():
        queue = run_manager.create_stream(run_id)
        try:
            while True:
                if await request.is_disconnected():
                    break
                event = await queue.get()
                data = json.dumps(event)
                yield f"data: {data}\n\n"
                if event.get("type") == "done":
                    break
        finally:
            run_manager.close_stream(run_id)

    return StreamingResponse(stream(), media_type="text/event-stream")
