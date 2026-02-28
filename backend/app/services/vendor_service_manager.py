from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.enums import VendorServiceStatus
from app.models.vendor_service import VendorServiceItem
from app.repositories.vendor_service import VendorServiceRepository
from app.repositories.vendor import VendorRepository
from app.repositories.event import EventRepository
from app.schemas.vendor_service import VendorServiceCreate, VendorServiceUpdate


class VendorServiceManager:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = VendorServiceRepository(db)
        self.vendor_repo = VendorRepository(db)
        self.event_repo = EventRepository(db)

    async def get_service(self, service_id: int) -> VendorServiceItem:
        item = await self.repo.get_by_id(service_id)
        if not item:
            raise NotFoundException("Vendor service not found")
        return item

    async def get_services(
        self,
        skip: int = 0,
        limit: int = 100,
        vendor_id: int | None = None,
        event_id: int | None = None,
        status: VendorServiceStatus | None = None,
        unassigned: bool | None = None,
    ) -> list[VendorServiceItem]:
        if unassigned:
            return await self.repo.get_unassigned(skip, limit)
        if vendor_id:
            return await self.repo.get_by_vendor(vendor_id, skip, limit)
        if event_id:
            return await self.repo.get_by_event(event_id, skip, limit)
        if status:
            return await self.repo.get_by_status(status, skip, limit)
        return await self.repo.get_all(skip=skip, limit=limit)

    async def create_service(self, data: VendorServiceCreate) -> VendorServiceItem:
        if data.event_id:
            event = await self.event_repo.get_by_id(data.event_id)
            if not event:
                raise NotFoundException("Event not found")

        return await self.repo.create(data.model_dump())

    async def update_service(
        self, service_id: int, data: VendorServiceUpdate
    ) -> VendorServiceItem:
        await self.get_service(service_id)
        update_data = data.model_dump(exclude_unset=True)

        if "vendor_id" in update_data and update_data["vendor_id"]:
            vendor = await self.vendor_repo.get_by_id(update_data["vendor_id"])
            if not vendor:
                raise NotFoundException("Vendor not found")

        if "event_id" in update_data and update_data["event_id"]:
            event = await self.event_repo.get_by_id(update_data["event_id"])
            if not event:
                raise NotFoundException("Event not found")

        updated = await self.repo.update(service_id, update_data)
        if not updated:
            raise NotFoundException("Vendor service not found")
        return updated

    async def delete_service(self, service_id: int) -> bool:
        await self.get_service(service_id)
        return await self.repo.delete(service_id)

    async def get_summary(self) -> dict:
        return await self.repo.get_summary()

    async def count_services(self) -> int:
        return await self.repo.count_all()
