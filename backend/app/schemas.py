from pydantic import BaseModel, Field
from typing import Any, Optional
from datetime import datetime


class AgentBase(BaseModel):
    name: str
    type: str = "assistant"
    status: str = "idle"
    icon: str = "smart_toy"
    color: str = "primary"
    description: str = ""
    skills: list[str] = []
    profile: str = ""
    hermes_profile: str = "default"


class AgentCreate(AgentBase):
    pass


class Agent(AgentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowBase(BaseModel):
    name: str
    domain: str = ""
    status: str = "draft"
    nodes: list[dict] = []
    edges: list[dict] = []
    context_file: str = ""


class WorkflowCreate(WorkflowBase):
    pass


class Workflow(WorkflowBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str
    domain: str = ""
    workflow: str = ""
    agent: str = ""
    status: str = "queued"
    progress: int = 0
    run_id: str = ""
    hermes_session_id: str = ""


class TaskCreate(TaskBase):
    id: Optional[str] = None


class Task(TaskBase):
    id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApprovalBase(BaseModel):
    title: str
    agent: str = ""
    risk: str = "MEDIUM"
    description: str = ""
    impact: str = ""
    status: str = "pending"
    task_id: str = ""


class ApprovalCreate(ApprovalBase):
    pass


class Approval(ApprovalBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScheduleBase(BaseModel):
    workflow: str
    cadence: str = ""
    enabled: bool = True


class ScheduleCreate(ScheduleBase):
    pass


class Schedule(ScheduleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    name: str
    description: str = ""
    code: str = ""
    language: str = "python"
    cached: bool = False


class SkillCreate(SkillBase):
    pass


class Skill(SkillBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemoryBase(BaseModel):
    key: str
    value: str = ""
    category: str = "general"
    agent_id: str = ""


class MemoryCreate(MemoryBase):
    pass


class Memory(MemoryBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ToolBase(BaseModel):
    name: str
    description: str = ""
    enabled: bool = True
    config: dict = {}


class ToolCreate(ToolBase):
    pass


class Tool(ToolBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelBase(BaseModel):
    provider: str = ""
    name: str
    active: bool = False


class ModelCreate(ModelBase):
    pass


class Model(ModelBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SettingsValue(BaseModel):
    value: dict


class RunRequest(BaseModel):
    type: str = "task"
    payload: dict = {}


class RunResponse(BaseModel):
    run_id: str


class HermesHealth(BaseModel):
    reachable: bool
    version: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    database: str
    hermes: HermesHealth


class ActivityItem(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: str
    message: str
    actor: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuditLogCreate(BaseModel):
    action: str
    entity_type: str = ""
    entity_id: str = ""
    message: str = ""
    actor: str = "system"
