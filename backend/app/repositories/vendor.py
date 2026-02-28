from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vendor import Vendor
from app.models.vendor_category import VendorCategory
from app.repositories.base import BaseRepository


class VendorRepository(BaseRepository[Vendor]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, Vendor)

    async def get_by_category(
        self, vendor_category_id: int, skip: int = 0, limit: int = 100
    ) -> list[Vendor]:
        query = (
            select(Vendor)
            .where(Vendor.vendor_category_id == vendor_category_id, Vendor.is_deleted == False)
            .order_by(Vendor.name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_booked(self, skip: int = 0, limit: int = 100) -> list[Vendor]:
        query = (
            select(Vendor)
            .where(Vendor.is_booked == True, Vendor.is_deleted == False)
            .order_by(Vendor.name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        query = select(func.count(Vendor.id)).where(Vendor.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_summary(self) -> dict:
        base = Vendor.is_deleted == False

        cat_q = (
            select(VendorCategory.name, func.count(Vendor.id))
            .join(VendorCategory, Vendor.vendor_category_id == VendorCategory.id)
            .where(base)
            .group_by(VendorCategory.name)
        )
        cat_r = await self.db.execute(cat_q)
        by_category = dict(cat_r.all())

        booked_q = select(func.count(Vendor.id)).where(base, Vendor.is_booked == True)
        booked_r = await self.db.execute(booked_q)
        booked = booked_r.scalar() or 0

        total = sum(by_category.values())
        return {
            "total_vendors": total,
            "booked": booked,
            "not_booked": total - booked,
            "by_category": by_category,
        }
