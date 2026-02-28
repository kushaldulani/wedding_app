from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dietary_preference import DietaryPreference
from app.repositories.base import BaseRepository


class DietaryPreferenceRepository(BaseRepository[DietaryPreference]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, DietaryPreference)

    async def get_by_name(self, name: str) -> DietaryPreference | None:
        query = select(DietaryPreference).where(
            DietaryPreference.name == name, DietaryPreference.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_active(self) -> list[DietaryPreference]:
        query = (
            select(DietaryPreference)
            .where(DietaryPreference.is_active == True, DietaryPreference.is_deleted == False)
            .order_by(DietaryPreference.name)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
