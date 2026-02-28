from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbSession, CurrentUser, AdminUser, ManagerOrAdmin, StaffUser
from app.core.exceptions import ForbiddenException
from app.models.enums import TaskStatus, TaskPriority
from app.repositories.event import EventRepository
from app.repositories.user import UserRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskUserUpdate, TaskResponse, TaskSummaryResponse
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.task_service import TaskService
from app.utils.excel import generate_excel

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("", response_model=PaginatedResponse[TaskResponse])
async def get_tasks(
    db: DbSession,
    user: ManagerOrAdmin,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    event_id: int | None = None,
    assigned_to_user_id: int | None = None,
):
    """Get all tasks with optional filters (manager/admin)."""
    service = TaskService(db)
    skip = (page - 1) * page_size
    items = await service.get_tasks(
        skip=skip, limit=page_size, status=status, priority=priority,
        event_id=event_id, assigned_to_user_id=assigned_to_user_id,
    )
    total = await service.count_tasks()
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/summary", response_model=TaskSummaryResponse)
async def get_task_summary(db: DbSession, user: ManagerOrAdmin):
    """Get task summary statistics (manager/admin)."""
    service = TaskService(db)
    return await service.get_summary()


@router.get("/export")
async def export_tasks(
    db: DbSession,
    user: ManagerOrAdmin,
    status: TaskStatus | None = None,
    priority: TaskPriority | None = None,
    event_id: int | None = None,
    assigned_to_user_id: int | None = None,
):
    """Export tasks to Excel (manager/admin)."""
    service = TaskService(db)
    items = await service.get_tasks(
        skip=0, limit=10000, status=status, priority=priority,
        event_id=event_id, assigned_to_user_id=assigned_to_user_id,
    )

    events = await EventRepository(db).get_all(limit=10000)
    users = await UserRepository(db).get_all(limit=10000)
    event_map = {e.id: e.name for e in events}
    user_map = {u.id: u.email for u in users}

    columns = [
        ("title", "Title"),
        ("description", "Description"),
        (lambda t: event_map.get(t.event_id, ""), "Event"),
        (lambda t: user_map.get(t.assigned_to_user_id, ""), "Assigned To"),
        (lambda t: user_map.get(t.created_by_user_id, ""), "Created By"),
        ("priority", "Priority"),
        ("status", "Status"),
        ("due_date", "Due Date"),
        ("completed_at", "Completed At"),
        ("created_at", "Created At"),
    ]

    buffer = generate_excel(items, columns, "Tasks")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=tasks.xlsx"},
    )


@router.get("/overdue", response_model=list[TaskResponse])
async def get_overdue_tasks(db: DbSession, current_user: CurrentUser):
    """Get overdue tasks. Admin sees all; users see only their own."""
    service = TaskService(db)
    user_id = None if current_user.role in ("admin", "manager") else current_user.id
    return await service.get_overdue_tasks(user_id=user_id)


@router.get("/my-tasks", response_model=list[TaskResponse])
async def get_my_tasks(db: DbSession, current_user: CurrentUser):
    """Get tasks assigned to the current user."""
    service = TaskService(db)
    return await service.get_tasks(assigned_to_user_id=current_user.id)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int, db: DbSession, current_user: CurrentUser):
    """Get task by ID. Users can only view their own tasks."""
    service = TaskService(db)
    task = await service.get_task(task_id)
    if current_user.role not in ("admin", "manager") and task.assigned_to_user_id != current_user.id:
        raise ForbiddenException("You can only view tasks assigned to you")
    return task


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate, db: DbSession, current_user: StaffUser):
    """Create a new task (admin/manager/user)."""
    service = TaskService(db)
    return await service.create_task(data, current_user)


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, data: TaskUpdate, db: DbSession, user: ManagerOrAdmin):
    """Full update of any task field (manager/admin)."""
    service = TaskService(db)
    return await service.update_task(task_id, data)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_my_task(task_id: int, data: TaskUserUpdate, db: DbSession, current_user: CurrentUser):
    """Update own task — status and reassign to admin only."""
    service = TaskService(db)
    return await service.update_task_as_user(task_id, data, current_user)


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(task_id: int, db: DbSession, admin: AdminUser):
    """Delete a task (admin only)."""
    service = TaskService(db)
    await service.delete_task(task_id)
    return MessageResponse(message="Task deleted successfully")
