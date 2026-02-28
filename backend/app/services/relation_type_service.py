from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ConflictException
from app.repositories.relation_type import RelationTypeRepository
from app.schemas.lookup import LookupCreate, LookupUpdate


class RelationTypeService:

    def __init__(self, db: AsyncSession):
        self.repo = RelationTypeRepository(db)

    async def get_all(self) -> list:
        return await self.repo.get_active()

    async def get_by_id(self, id: int):
        item = await self.repo.get_by_id(id)
        if not item:
            raise NotFoundException("Relation type not found")
        return item

    async def create(self, data: LookupCreate):
        existing = await self.repo.get_by_name(data.name)
        if existing:
            raise ConflictException(f"'{data.name}' already exists")
        return await self.repo.create(data.model_dump())

    async def update(self, id: int, data: LookupUpdate):
        await self.get_by_id(id)
        update_data = data.model_dump(exclude_unset=True)
        if "name" in update_data:
            existing = await self.repo.get_by_name(update_data["name"])
            if existing and existing.id != id:
                raise ConflictException(f"'{update_data['name']}' already exists")
        updated = await self.repo.update(id, update_data)
        if not updated:
            raise NotFoundException("Relation type not found")
        return updated

    async def delete(self, id: int) -> bool:
        await self.get_by_id(id)
        return await self.repo.delete(id)
