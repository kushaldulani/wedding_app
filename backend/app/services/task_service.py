from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ForbiddenException
from app.models.enums import TaskStatus, TaskPriority
from app.models.task import Task
from app.models.user import User
from app.repositories.task import TaskRepository
from app.repositories.event import EventRepository
from app.repositories.user import UserRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskUserUpdate


class TaskService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.task_repo = TaskRepository(db)
        self.event_repo = EventRepository(db)
        self.user_repo = UserRepository(db)

    async def get_task(self, task_id: int) -> Task:
        task = await self.task_repo.get_by_id(task_id)
        if not task:
            raise NotFoundException("Task not found")
        return task

    async def get_tasks(
        self,
        skip: int = 0,
        limit: int = 100,
        status: TaskStatus | None = None,
        priority: TaskPriority | None = None,
        event_id: int | None = None,
        assigned_to_user_id: int | None = None,
    ) -> list[Task]:
        if status:
            return await self.task_repo.get_by_status(status, skip, limit)
        if priority:
            return await self.task_repo.get_by_priority(priority, skip, limit)
        if event_id:
            return await self.task_repo.get_by_event(event_id, skip, limit)
        if assigned_to_user_id:
            return await self.task_repo.get_by_assigned_user(assigned_to_user_id, skip, limit)
        return await self.task_repo.get_all(skip=skip, limit=limit)

    async def create_task(self, data: TaskCreate, current_user: User) -> Task:
        if data.event_id:
            event = await self.event_repo.get_by_id(data.event_id)
            if not event:
                raise NotFoundException("Event not found")
        if data.assigned_to_user_id:
            user = await self.user_repo.get_by_id(data.assigned_to_user_id)
            if not user:
                raise NotFoundException("Assigned user not found")

        task_data = data.model_dump()
        task_data["created_by_user_id"] = current_user.id
        return await self.task_repo.create(task_data)

    async def update_task(self, task_id: int, data: TaskUpdate) -> Task:
        """Admin-only full update."""
        task = await self.get_task(task_id)
        update_data = data.model_dump(exclude_unset=True)

        if "event_id" in update_data and update_data["event_id"]:
            event = await self.event_repo.get_by_id(update_data["event_id"])
            if not event:
                raise NotFoundException("Event not found")
        if "assigned_to_user_id" in update_data and update_data["assigned_to_user_id"]:
            user = await self.user_repo.get_by_id(update_data["assigned_to_user_id"])
            if not user:
                raise NotFoundException("Assigned user not found")

        self._handle_completed_at(update_data, task)

        updated = await self.task_repo.update(task_id, update_data)
        if not updated:
            raise NotFoundException("Task not found")
        return updated

    async def update_task_as_user(
        self, task_id: int, data: TaskUserUpdate, current_user: User
    ) -> Task:
        """User-scoped update: status + reassign to admin only."""
        task = await self.get_task(task_id)

        if task.assigned_to_user_id != current_user.id:
            raise ForbiddenException("You can only update tasks assigned to you")

        update_data = data.model_dump(exclude_unset=True)

        # Validate target user exists if reassigning
        if "assigned_to_user_id" in update_data:
            new_assignee_id = update_data["assigned_to_user_id"]
            if new_assignee_id is not None:
                target_user = await self.user_repo.get_by_id(new_assignee_id)
                if not target_user:
                    raise NotFoundException("Target user not found")

        self._handle_completed_at(update_data, task)

        updated = await self.task_repo.update(task_id, update_data)
        if not updated:
            raise NotFoundException("Task not found")
        return updated

    def _handle_completed_at(self, update_data: dict, task: Task) -> None:
        """Auto-set/clear completed_at based on status transitions."""
        if update_data.get("status") == TaskStatus.COMPLETED and task.status != TaskStatus.COMPLETED:
            update_data["completed_at"] = datetime.now(timezone.utc)
        elif update_data.get("status") and update_data["status"] != TaskStatus.COMPLETED and task.status == TaskStatus.COMPLETED:
            update_data["completed_at"] = None

    async def delete_task(self, task_id: int) -> bool:
        await self.get_task(task_id)
        return await self.task_repo.delete(task_id)

    async def get_overdue_tasks(self, user_id: int | None = None) -> list[Task]:
        tasks = await self.task_repo.get_overdue()
        if user_id is not None:
            return [t for t in tasks if t.assigned_to_user_id == user_id]
        return tasks

    async def get_summary(self) -> dict:
        return await self.task_repo.get_summary()

    async def count_tasks(self) -> int:
        return await self.task_repo.count_all()
