from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event_type import EventType
from app.repositories.base import BaseRepository


class EventTypeRepository(BaseRepository[EventType]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, EventType)

    async def get_by_name(self, name: str) -> EventType | None:
        query = select(EventType).where(
            EventType.name == name, EventType.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_active(self) -> list[EventType]:
        query = (
            select(EventType)
            .where(EventType.is_active == True, EventType.is_deleted == False)
            .order_by(EventType.name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
