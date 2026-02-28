from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.relation_type import RelationType
from app.repositories.base import BaseRepository


class RelationTypeRepository(BaseRepository[RelationType]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, RelationType)

    async def get_by_name(self, name: str) -> RelationType | None:
        query = select(RelationType).where(
            RelationType.name == name, RelationType.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_active(self) -> list[RelationType]:
        query = (
            select(RelationType)
            .where(RelationType.is_active == True, RelationType.is_deleted == False)
            .order_by(RelationType.name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
