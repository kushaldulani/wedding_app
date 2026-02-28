from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ConflictException
from app.models.enums import GuestSide
from app.models.guest import Guest
from app.repositories.guest import GuestRepository
from app.repositories.dietary_preference import DietaryPreferenceRepository
from app.repositories.relation_type import RelationTypeRepository
from app.repositories.family_group import FamilyGroupRepository
from app.schemas.guest import GuestCreate, GuestUpdate


class GuestService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.guest_repo = GuestRepository(db)
        self.diet_repo = DietaryPreferenceRepository(db)
        self.relation_repo = RelationTypeRepository(db)
        self.family_group_repo = FamilyGroupRepository(db)

    async def get_guest(self, guest_id: int) -> Guest:
        guest = await self.guest_repo.get_by_id(guest_id)
        if not guest:
            raise NotFoundException("Guest not found")
        return guest

    async def get_guests(
        self,
        skip: int = 0,
        limit: int = 100,
        side: GuestSide | None = None,
        family_group_id: int | None = None,
        is_vip: bool | None = None,
        dietary_preference_id: int | None = None,
    ) -> list[Guest]:
        if side:
            return await self.guest_repo.get_by_side(side, skip, limit)
        if family_group_id:
            return await self.guest_repo.get_by_family_group(family_group_id, skip, limit)
        if is_vip:
            return await self.guest_repo.get_vip_guests(skip, limit)
        return await self.guest_repo.get_all(skip=skip, limit=limit)

    async def create_guest(self, data: GuestCreate) -> Guest:
        if await self.guest_repo.phone_exists(data.phone):
            raise ConflictException("Phone number already registered")

        if data.dietary_preference_id:
            pref = await self.diet_repo.get_by_id(data.dietary_preference_id)
            if not pref:
                raise NotFoundException("Dietary preference not found")

        if data.relation_type_id:
            rel = await self.relation_repo.get_by_id(data.relation_type_id)
            if not rel:
                raise NotFoundException("Relation type not found")

        if data.family_group_id:
            fg = await self.family_group_repo.get_by_id(data.family_group_id)
            if not fg:
                raise NotFoundException("Family group not found")

        return await self.guest_repo.create(data.model_dump())

    async def update_guest(self, guest_id: int, data: GuestUpdate) -> Guest:
        await self.get_guest(guest_id)
        update_data = data.model_dump(exclude_unset=True)

        if "dietary_preference_id" in update_data and update_data["dietary_preference_id"]:
            pref = await self.diet_repo.get_by_id(update_data["dietary_preference_id"])
            if not pref:
                raise NotFoundException("Dietary preference not found")

        if "relation_type_id" in update_data and update_data["relation_type_id"]:
            rel = await self.relation_repo.get_by_id(update_data["relation_type_id"])
            if not rel:
                raise NotFoundException("Relation type not found")

        if "family_group_id" in update_data and update_data["family_group_id"]:
            fg = await self.family_group_repo.get_by_id(update_data["family_group_id"])
            if not fg:
                raise NotFoundException("Family group not found")

        updated = await self.guest_repo.update(guest_id, update_data)
        if not updated:
            raise NotFoundException("Guest not found")
        return updated

    async def delete_guest(self, guest_id: int) -> bool:
        await self.get_guest(guest_id)
        return await self.guest_repo.delete(guest_id)

    async def get_summary(self) -> dict:
        return await self.guest_repo.get_summary()

    async def count_guests(self) -> int:
        return await self.guest_repo.count_all()
