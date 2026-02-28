from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vendor_service import VendorServiceItem
from app.models.enums import VendorServiceStatus
from app.repositories.base import BaseRepository


class VendorServiceRepository(BaseRepository[VendorServiceItem]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, VendorServiceItem)

    async def get_by_vendor(
        self, vendor_id: int, skip: int = 0, limit: int = 100
    ) -> list[VendorServiceItem]:
        query = (
            select(VendorServiceItem)
            .where(VendorServiceItem.vendor_id == vendor_id, VendorServiceItem.is_deleted == False)
            .order_by(VendorServiceItem.service_date.asc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_event(
        self, event_id: int, skip: int = 0, limit: int = 100
    ) -> list[VendorServiceItem]:
        query = (
            select(VendorServiceItem)
            .where(VendorServiceItem.event_id == event_id, VendorServiceItem.is_deleted == False)
            .order_by(VendorServiceItem.service_date.asc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_status(
        self, status: VendorServiceStatus, skip: int = 0, limit: int = 100
    ) -> list[VendorServiceItem]:
        query = (
            select(VendorServiceItem)
            .where(VendorServiceItem.status == status, VendorServiceItem.is_deleted == False)
            .order_by(VendorServiceItem.service_date.asc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_unassigned(
        self, skip: int = 0, limit: int = 100
    ) -> list[VendorServiceItem]:
        query = (
            select(VendorServiceItem)
            .where(VendorServiceItem.vendor_id.is_(None), VendorServiceItem.is_deleted == False)
            .order_by(VendorServiceItem.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        query = select(func.count(VendorServiceItem.id)).where(
            VendorServiceItem.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_summary(self) -> dict:
        base = VendorServiceItem.is_deleted == False

        status_q = (
            select(VendorServiceItem.status, func.count(VendorServiceItem.id))
            .where(base)
            .group_by(VendorServiceItem.status)
        )
        status_r = await self.db.execute(status_q)
        by_status = {k.value: v for k, v in status_r.all()}

        unassigned_q = select(func.count(VendorServiceItem.id)).where(
            base, VendorServiceItem.vendor_id.is_(None)
        )
        unassigned_r = await self.db.execute(unassigned_q)
        unassigned_count = unassigned_r.scalar() or 0

        all_events_q = select(func.count(VendorServiceItem.id)).where(
            base, VendorServiceItem.event_id.is_(None)
        )
        all_events_r = await self.db.execute(all_events_q)
        all_events_count = all_events_r.scalar() or 0

        total = sum(by_status.values())
        return {
            "total": total,
            "by_status": by_status,
            "unassigned_count": unassigned_count,
            "all_events_count": all_events_count,
        }
