from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.family_group import FamilyGroup
from app.repositories.base import BaseRepository


class FamilyGroupRepository(BaseRepository[FamilyGroup]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, FamilyGroup)

    async def get_by_name(self, name: str) -> FamilyGroup | None:
        query = select(FamilyGroup).where(
            FamilyGroup.name == name, FamilyGroup.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_active(self) -> list[FamilyGroup]:
        query = (
            select(FamilyGroup)
            .where(FamilyGroup.is_active == True, FamilyGroup.is_deleted == False)
            .order_by(FamilyGroup.name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
