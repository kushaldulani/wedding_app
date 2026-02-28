from datetime import date, datetime

from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema
from app.models.enums import TaskPriority, TaskStatus


class TaskCreate(BaseSchema):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    event_id: int | None = None
    assigned_to_user_id: int | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: date | None = None


class TaskUpdate(BaseSchema):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    event_id: int | None = None
    assigned_to_user_id: int | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None
    due_date: date | None = None


class TaskUserUpdate(BaseSchema):
    """Restricted update schema for regular users (status + reassign only)."""
    status: TaskStatus | None = None
    assigned_to_user_id: int | None = None


class TaskResponse(BaseResponseSchema):
    title: str
    description: str | None
    event_id: int | None
    assigned_to_user_id: int | None
    created_by_user_id: int | None
    priority: TaskPriority
    status: TaskStatus
    due_date: date | None
    completed_at: datetime | None


class TaskSummaryResponse(BaseSchema):
    total_tasks: int
    pending: int
    in_progress: int
    completed: int
    cancelled: int
    overdue: int
    by_priority: dict[str, int]
    by_event: dict[str, int]
