from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.vendor import Vendor
from app.repositories.vendor import VendorRepository
from app.repositories.vendor_category import VendorCategoryRepository
from app.schemas.vendor import VendorCreate, VendorUpdate


class VendorService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.vendor_repo = VendorRepository(db)
        self.category_repo = VendorCategoryRepository(db)

    async def get_vendor(self, vendor_id: int) -> Vendor:
        vendor = await self.vendor_repo.get_by_id(vendor_id)
        if not vendor:
            raise NotFoundException("Vendor not found")
        return vendor

    async def get_vendors(
        self,
        skip: int = 0,
        limit: int = 100,
        vendor_category_id: int | None = None,
        is_booked: bool | None = None,
    ) -> list[Vendor]:
        if vendor_category_id:
            return await self.vendor_repo.get_by_category(vendor_category_id, skip, limit)
        if is_booked:
            return await self.vendor_repo.get_booked(skip, limit)
        return await self.vendor_repo.get_all(skip=skip, limit=limit)

    async def create_vendor(self, data: VendorCreate) -> Vendor:
        category = await self.category_repo.get_by_id(data.vendor_category_id)
        if not category:
            raise NotFoundException("Vendor category not found")
        return await self.vendor_repo.create(data.model_dump())

    async def update_vendor(self, vendor_id: int, data: VendorUpdate) -> Vendor:
        await self.get_vendor(vendor_id)
        update_data = data.model_dump(exclude_unset=True)

        if "vendor_category_id" in update_data:
            category = await self.category_repo.get_by_id(update_data["vendor_category_id"])
            if not category:
                raise NotFoundException("Vendor category not found")

        updated = await self.vendor_repo.update(vendor_id, update_data)
        if not updated:
            raise NotFoundException("Vendor not found")
        return updated

    async def delete_vendor(self, vendor_id: int) -> bool:
        await self.get_vendor(vendor_id)
        return await self.vendor_repo.delete(vendor_id)

    async def get_summary(self) -> dict:
        return await self.vendor_repo.get_summary()

    async def count_vendors(self) -> int:
        return await self.vendor_repo.count_all()
