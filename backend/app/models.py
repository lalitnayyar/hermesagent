from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, default="assistant")
    status = Column(String, default="idle")
    icon = Column(String, default="smart_toy")
    color = Column(String, default="primary")
    description = Column(Text, default="")
    skills = Column(JSON, default=list)
    profile = Column(Text, default="")
    hermes_profile = Column(String, default="default")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    domain = Column(String, default="")
    status = Column(String, default="draft")
    nodes = Column(JSON, default=list)
    edges = Column(JSON, default=list)
    context_file = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    domain = Column(String, default="")
    workflow = Column(String, default="")
    agent = Column(String, default="")
    status = Column(String, default="queued")
    progress = Column(Integer, default=0)
    run_id = Column(String, default="")
    hermes_session_id = Column(String, default="")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    agent = Column(String, default="")
    risk = Column(String, default="MEDIUM")
    description = Column(Text, default="")
    impact = Column(Text, default="")
    status = Column(String, default="pending")
    task_id = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    workflow = Column(String, nullable=False)
    cadence = Column(String, default="")
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    code = Column(Text, default="")
    language = Column(String, default="python")
    cached = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Memory(Base):
    __tablename__ = "memory"

    id = Column(String, primary_key=True, index=True)
    key = Column(String, nullable=False, index=True)
    value = Column(Text, default="")
    category = Column(String, default="general")
    agent_id = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Tool(Base):
    __tablename__ = "tools"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    enabled = Column(Boolean, default=True)
    config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HermesModel(Base):
    __tablename__ = "models"

    id = Column(String, primary_key=True, index=True)
    provider = Column(String, default="")
    name = Column(String, nullable=False)
    active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AppSettings(Base):
    __tablename__ = "settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, default="")
    entity_id = Column(String, default="")
    message = Column(Text, default="")
    actor = Column(String, default="system")
    created_at = Column(DateTime, default=datetime.utcnow)


class HermesConnection(Base):
    __tablename__ = "hermes_connections"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    base_url = Column(String, default="")
    gateway_url = Column(String, default="")
    workspace_url = Column(String, default="")
    # secret stored only as a reference/path, never plain text
    api_key_secret_path = Column(String, default="")
    default_profile = Column(String, default="default")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HermesProfileMapping(Base):
    __tablename__ = "hermes_profile_mappings"

    id = Column(String, primary_key=True, index=True)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=False)
    hermes_connection_id = Column(String, ForeignKey("hermes_connections.id"), nullable=False)
    hermes_profile = Column(String, default="default")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
