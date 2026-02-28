from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.enums import EventStatus
from app.models.event import Event
from app.repositories.event import EventRepository
from app.repositories.event_type import EventTypeRepository
from app.schemas.event import EventCreate, EventUpdate


class EventService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.event_repo = EventRepository(db)
        self.event_type_repo = EventTypeRepository(db)

    async def get_event(self, event_id: int) -> Event:
        event = await self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException("Event not found")
        return event

    async def get_events(
        self,
        skip: int = 0,
        limit: int = 100,
        status: EventStatus | None = None,
        event_type_id: int | None = None,
    ) -> list[Event]:
        if status:
            return await self.event_repo.get_by_status(status, skip, limit)
        if event_type_id:
            return await self.event_repo.get_by_type(event_type_id, skip, limit)
        return await self.event_repo.get_all(skip=skip, limit=limit)

    async def create_event(self, data: EventCreate) -> Event:
        event_type = await self.event_type_repo.get_by_id(data.event_type_id)
        if not event_type:
            raise NotFoundException("Event type not found")
        return await self.event_repo.create(data.model_dump())

    async def update_event(self, event_id: int, data: EventUpdate) -> Event:
        await self.get_event(event_id)
        update_data = data.model_dump(exclude_unset=True)

        if "event_type_id" in update_data:
            event_type = await self.event_type_repo.get_by_id(update_data["event_type_id"])
            if not event_type:
                raise NotFoundException("Event type not found")

        updated = await self.event_repo.update(event_id, update_data)
        if not updated:
            raise NotFoundException("Event not found")
        return updated

    async def delete_event(self, event_id: int) -> bool:
        await self.get_event(event_id)
        return await self.event_repo.delete(event_id)

    async def get_summary(self) -> dict:
        return await self.event_repo.get_summary()

    async def count_events(self) -> int:
        return await self.event_repo.count_all()
