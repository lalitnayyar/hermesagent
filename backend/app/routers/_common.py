from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import AuditLog
from backend.app.schemas import AuditLogCreate
from uuid import uuid4
from datetime import datetime


def log(db: Session, create: AuditLogCreate) -> None:
    entry = AuditLog(
        action=create.action,
        entity_type=create.entity_type,
        entity_id=create.entity_id,
        message=create.message,
        actor=create.actor,
        created_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()


def make_crud_router(prefix: str, model_cls, create_schema, update_schema, response_schema):
    router = APIRouter(prefix=prefix, tags=[prefix.strip("/")])

    @router.get("")
    def list_items(db: Session = Depends(get_db)) -> list:
        items = db.query(model_cls).all()
        return [response_schema.model_validate(i) for i in items]

    @router.get("/{item_id}")
    def get_item(item_id: str, db: Session = Depends(get_db)):
        item = db.query(model_cls).filter(model_cls.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        return response_schema.model_validate(item)

    @router.post("")
    def create_item(payload: create_schema, db: Session = Depends(get_db)):
        data = payload.model_dump()
        if not hasattr(model_cls, "id") or data.get("id") is None:
            data["id"] = str(uuid4())[:8]
        item = model_cls(**data)
        db.add(item)
        db.commit()
        db.refresh(item)
        log(db, AuditLogCreate(action="create", entity_type=prefix.strip("/"), entity_id=item.id, message=f"Created {prefix.strip('/')} {item.id}"))
        return response_schema.model_validate(item)

    @router.patch("/{item_id}")
    def update_item(item_id: str, payload: dict, db: Session = Depends(get_db)):
        item = db.query(model_cls).filter(model_cls.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"{prefix.strip('/')} not found")
        for key, value in payload.items():
            if value is not None and hasattr(item, key):
                setattr(item, key, value)
        item.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(item)
        log(db, AuditLogCreate(action="update", entity_type=prefix.strip("/"), entity_id=item.id, message=f"Updated {prefix.strip('/')} {item.id}"))
        return response_schema.model_validate(item)

    @router.delete("/{item_id}")
    def delete_item(item_id: str, db: Session = Depends(get_db)):
        item = db.query(model_cls).filter(model_cls.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Not found")
        db.delete(item)
        db.commit()
        log(db, AuditLogCreate(action="delete", entity_type=prefix.strip("/"), entity_id=item_id, message=f"Deleted {prefix.strip('/')} {item_id}"))
        return {"success": True}

    return router
