from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.guest import Guest
from app.models.dietary_preference import DietaryPreference
from app.models.enums import GuestSide
from app.repositories.base import BaseRepository


class GuestRepository(BaseRepository[Guest]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, Guest)

    async def get_by_side(
        self, side: GuestSide, skip: int = 0, limit: int = 100
    ) -> list[Guest]:
        query = (
            select(Guest)
            .where(Guest.side == side, Guest.is_deleted == False)
            .order_by(Guest.first_name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_family_group(
        self, family_group_id: int, skip: int = 0, limit: int = 100
    ) -> list[Guest]:
        query = (
            select(Guest)
            .where(Guest.family_group_id == family_group_id, Guest.is_deleted == False)
            .order_by(Guest.first_name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_vip_guests(
        self, skip: int = 0, limit: int = 100
    ) -> list[Guest]:
        query = (
            select(Guest)
            .where(Guest.is_vip == True, Guest.is_deleted == False)
            .order_by(Guest.first_name)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_email(self, email: str) -> Guest | None:
        query = select(Guest).where(Guest.email == email, Guest.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def phone_exists(self, phone: str) -> bool:
        query = select(Guest).where(Guest.phone == phone, Guest.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar_one_or_none() is not None

    async def count_all(self) -> int:
        query = select(func.count(Guest.id)).where(Guest.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_summary(self) -> dict:
        base = Guest.is_deleted == False

        side_q = select(Guest.side, func.count(Guest.id)).where(base).group_by(Guest.side)
        side_r = await self.db.execute(side_q)
        by_side = {k.value: v for k, v in side_r.all()}

        diet_q = (
            select(DietaryPreference.name, func.count(Guest.id))
            .join(DietaryPreference, Guest.dietary_preference_id == DietaryPreference.id)
            .where(base)
            .group_by(DietaryPreference.name)
        )
        diet_r = await self.db.execute(diet_q)
        by_diet = dict(diet_r.all())

        age_q = select(Guest.age_group, func.count(Guest.id)).where(base).group_by(Guest.age_group)
        age_r = await self.db.execute(age_q)
        by_age = {k.value: v for k, v in age_r.all()}

        vip_q = select(func.count(Guest.id)).where(base, Guest.is_vip == True)
        vip_r = await self.db.execute(vip_q)
        vip_count = vip_r.scalar() or 0

        fg_q = select(func.count(distinct(Guest.family_group_id))).where(
            base, Guest.family_group_id.isnot(None)
        )
        fg_r = await self.db.execute(fg_q)
        fg_count = fg_r.scalar() or 0

        total = sum(by_side.values())

        persons_q = select(func.coalesce(func.sum(Guest.number_of_persons), 0)).where(base)
        persons_r = await self.db.execute(persons_q)
        total_persons = persons_r.scalar() or 0

        return {
            "total_guests": total,
            "total_persons": total_persons,
            "by_side": by_side,
            "by_dietary_preference": by_diet,
            "by_age_group": by_age,
            "vip_count": vip_count,
            "family_groups_count": fg_count,
        }
