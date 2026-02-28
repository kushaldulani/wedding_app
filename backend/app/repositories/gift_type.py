from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gift_type import GiftType
from app.repositories.base import BaseRepository


class GiftTypeRepository(BaseRepository[GiftType]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, GiftType)

    async def get_by_name(self, name: str) -> GiftType | None:
        query = select(GiftType).where(
            GiftType.name == name, GiftType.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_active(self) -> list[GiftType]:
        query = (
            select(GiftType)
            .where(GiftType.is_active == True, GiftType.is_deleted == False)
            .order_by(GiftType.name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
