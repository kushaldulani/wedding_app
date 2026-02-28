from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gift import Gift
from app.models.gift_type import GiftType
from app.repositories.base import BaseRepository


class GiftRepository(BaseRepository[Gift]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, Gift)

    async def get_by_guest(
        self, guest_id: int, skip: int = 0, limit: int = 100
    ) -> list[Gift]:
        query = (
            select(Gift)
            .where(Gift.guest_id == guest_id, Gift.is_deleted == False)
            .order_by(Gift.received_at.desc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_gift_type(
        self, gift_type_id: int, skip: int = 0, limit: int = 100
    ) -> list[Gift]:
        query = (
            select(Gift)
            .where(Gift.gift_type_id == gift_type_id, Gift.is_deleted == False)
            .order_by(Gift.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_thank_you_pending(self) -> list[Gift]:
        query = (
            select(Gift)
            .where(Gift.thank_you_sent == False, Gift.is_deleted == False)
            .order_by(Gift.received_at.asc().nullslast())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_all(self) -> int:
        query = select(func.count(Gift.id)).where(Gift.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_summary(self) -> dict:
        base = Gift.is_deleted == False

        # Total count
        total_q = select(func.count(Gift.id)).where(base)
        total_r = await self.db.execute(total_q)
        total = total_r.scalar() or 0

        # Total value
        value_q = select(func.coalesce(func.sum(Gift.estimated_value), 0)).where(base)
        value_r = await self.db.execute(value_q)
        total_value = value_r.scalar() or 0

        # By gift type
        type_q = (
            select(GiftType.name, func.count(Gift.id))
            .join(GiftType, Gift.gift_type_id == GiftType.id)
            .where(base)
            .group_by(GiftType.name)
        )
        type_r = await self.db.execute(type_q)
        by_gift_type = dict(type_r.all())

        # Thank you pending
        pending_q = select(func.count(Gift.id)).where(
            base, Gift.thank_you_sent == False
        )
        pending_r = await self.db.execute(pending_q)
        thank_you_pending = pending_r.scalar() or 0

        return {
            "total_gifts": total,
            "total_value": total_value,
            "by_gift_type": by_gift_type,
            "thank_you_pending": thank_you_pending,
        }
