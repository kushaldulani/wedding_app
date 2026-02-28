from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.gift import Gift
from app.repositories.gift import GiftRepository
from app.repositories.guest import GuestRepository
from app.repositories.gift_type import GiftTypeRepository
from app.schemas.gift import GiftCreate, GiftUpdate


class GiftService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.gift_repo = GiftRepository(db)
        self.guest_repo = GuestRepository(db)
        self.gift_type_repo = GiftTypeRepository(db)

    async def get_gift(self, gift_id: int) -> Gift:
        gift = await self.gift_repo.get_by_id(gift_id)
        if not gift:
            raise NotFoundException("Gift not found")
        return gift

    async def get_gifts(
        self,
        skip: int = 0,
        limit: int = 100,
        guest_id: int | None = None,
        gift_type_id: int | None = None,
    ) -> list[Gift]:
        if guest_id:
            return await self.gift_repo.get_by_guest(guest_id, skip, limit)
        if gift_type_id:
            return await self.gift_repo.get_by_gift_type(gift_type_id, skip, limit)
        return await self.gift_repo.get_all(skip=skip, limit=limit)

    async def create_gift(self, data: GiftCreate) -> Gift:
        guest = await self.guest_repo.get_by_id(data.guest_id)
        if not guest:
            raise NotFoundException("Guest not found")
        gift_type = await self.gift_type_repo.get_by_id(data.gift_type_id)
        if not gift_type:
            raise NotFoundException("Gift type not found")
        return await self.gift_repo.create(data.model_dump())

    async def update_gift(self, gift_id: int, data: GiftUpdate) -> Gift:
        await self.get_gift(gift_id)
        update_data = data.model_dump(exclude_unset=True)

        if "guest_id" in update_data and update_data["guest_id"]:
            guest = await self.guest_repo.get_by_id(update_data["guest_id"])
            if not guest:
                raise NotFoundException("Guest not found")
        if "gift_type_id" in update_data and update_data["gift_type_id"]:
            gift_type = await self.gift_type_repo.get_by_id(update_data["gift_type_id"])
            if not gift_type:
                raise NotFoundException("Gift type not found")

        updated = await self.gift_repo.update(gift_id, update_data)
        if not updated:
            raise NotFoundException("Gift not found")
        return updated

    async def delete_gift(self, gift_id: int) -> bool:
        await self.get_gift(gift_id)
        return await self.gift_repo.delete(gift_id)

    async def get_thank_you_pending(self) -> list[Gift]:
        return await self.gift_repo.get_thank_you_pending()

    async def get_summary(self) -> dict:
        return await self.gift_repo.get_summary()

    async def count_gifts(self) -> int:
        return await self.gift_repo.count_all()
