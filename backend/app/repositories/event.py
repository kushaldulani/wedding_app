from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.event_type import EventType
from app.models.enums import EventStatus
from app.repositories.base import BaseRepository


class EventRepository(BaseRepository[Event]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, Event)

    async def get_by_status(
        self, status: EventStatus, skip: int = 0, limit: int = 100
    ) -> list[Event]:
        query = (
            select(Event)
            .where(Event.status == status, Event.is_deleted == False)
            .order_by(Event.event_date.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_type(
        self, event_type_id: int, skip: int = 0, limit: int = 100
    ) -> list[Event]:
        query = (
            select(Event)
            .where(Event.event_type_id == event_type_id, Event.is_deleted == False)
            .order_by(Event.event_date.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_upcoming(self, skip: int = 0, limit: int = 100) -> list[Event]:
        query = (
            select(Event)
            .where(Event.status == EventStatus.UPCOMING, Event.is_deleted == False)
            .order_by(Event.event_date.asc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        query = select(func.count(Event.id)).where(Event.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_summary(self) -> dict:
        base = Event.is_deleted == False

        status_q = (
            select(Event.status, func.count(Event.id))
            .where(base)
            .group_by(Event.status)
        )
        status_r = await self.db.execute(status_q)
        by_status = {k.value: v for k, v in status_r.all()}

        type_q = (
            select(EventType.name, func.count(Event.id))
            .join(EventType, Event.event_type_id == EventType.id)
            .where(base)
            .group_by(EventType.name)
        )
        type_r = await self.db.execute(type_q)
        by_type = dict(type_r.all())

        total = sum(by_status.values())
        return {
            "total_events": total,
            "by_status": by_status,
            "by_type": by_type,
        }
