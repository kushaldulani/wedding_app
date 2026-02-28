from datetime import date as date_type

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.models.event import Event
from app.models.enums import TaskPriority, TaskStatus
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, Task)

    async def get_by_status(
        self, status: TaskStatus, skip: int = 0, limit: int = 100
    ) -> list[Task]:
        query = (
            select(Task)
            .where(Task.status == status, Task.is_deleted == False)
            .order_by(Task.due_date.asc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_priority(
        self, priority: TaskPriority, skip: int = 0, limit: int = 100
    ) -> list[Task]:
        query = (
            select(Task)
            .where(Task.priority == priority, Task.is_deleted == False)
            .order_by(Task.due_date.asc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_event(
        self, event_id: int, skip: int = 0, limit: int = 100
    ) -> list[Task]:
        query = (
            select(Task)
            .where(Task.event_id == event_id, Task.is_deleted == False)
            .order_by(Task.due_date.asc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_assigned_user(
        self, user_id: int, skip: int = 0, limit: int = 100
    ) -> list[Task]:
        query = (
            select(Task)
            .where(Task.assigned_to_user_id == user_id, Task.is_deleted == False)
            .order_by(Task.due_date.asc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_overdue(self) -> list[Task]:
        query = (
            select(Task)
            .where(
                Task.due_date < date_type.today(),
                Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
                Task.is_deleted == False,
            )
            .order_by(Task.due_date.asc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        query = select(func.count(Task.id)).where(Task.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_summary(self) -> dict:
        base = Task.is_deleted == False

        status_q = (
            select(Task.status, func.count(Task.id)).where(base).group_by(Task.status)
        )
        status_r = await self.db.execute(status_q)
        status_counts = {k.value: v for k, v in status_r.all()}

        prio_q = (
            select(Task.priority, func.count(Task.id)).where(base).group_by(Task.priority)
        )
        prio_r = await self.db.execute(prio_q)
        by_priority = {k.value: v for k, v in prio_r.all()}

        overdue_q = select(func.count(Task.id)).where(
            base,
            Task.due_date < date_type.today(),
            Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS]),
        )
        overdue_r = await self.db.execute(overdue_q)
        overdue = overdue_r.scalar() or 0

        event_q = (
            select(Event.name, func.count(Task.id))
            .join(Event, Task.event_id == Event.id)
            .where(base)
            .group_by(Event.name)
        )
        event_r = await self.db.execute(event_q)
        by_event = dict(event_r.all())

        total = sum(status_counts.values())
        return {
            "total_tasks": total,
            "pending": status_counts.get(TaskStatus.PENDING.value, 0),
            "in_progress": status_counts.get(TaskStatus.IN_PROGRESS.value, 0),
            "completed": status_counts.get(TaskStatus.COMPLETED.value, 0),
            "cancelled": status_counts.get(TaskStatus.CANCELLED.value, 0),
            "overdue": overdue,
            "by_priority": by_priority,
            "by_event": by_event,
        }
