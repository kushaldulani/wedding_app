from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vendor_category import VendorCategory
from app.repositories.base import BaseRepository


class VendorCategoryRepository(BaseRepository[VendorCategory]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, VendorCategory)

    async def get_by_name(self, name: str) -> VendorCategory | None:
        query = select(VendorCategory).where(
            VendorCategory.name == name, VendorCategory.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_active(self) -> list[VendorCategory]:
        query = (
            select(VendorCategory)
            .where(VendorCategory.is_active == True, VendorCategory.is_deleted == False)
            .order_by(VendorCategory.name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
