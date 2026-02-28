from typing import Generic, TypeVar, Type

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with generic CRUD operations."""

    def __init__(self, db: AsyncSession, model: Type[ModelType]):
        self.db = db
        self.model = model

    async def get_by_id(self, id: int) -> ModelType | None:
        """Get a record by ID (excludes soft-deleted)."""
        query = select(self.model).where(
            self.model.id == id,
            self.model.is_deleted == False,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        """Get all records (excludes soft-deleted)."""
        query = (
            select(self.model)
            .where(self.model.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create(self, data: dict) -> ModelType:
        """Create a new record."""
        instance = self.model(**data)
        self.db.add(instance)
        await self.db.flush()
        await self.db.refresh(instance)
        return instance

    async def update(self, id: int, data: dict) -> ModelType | None:
        """Update a record by ID."""
        if not data:
            return await self.get_by_id(id)

        query = (
            update(self.model)
            .where(self.model.id == id, self.model.is_deleted == False)
            .values(**data)
        )
        await self.db.execute(query)
        await self.db.flush()
        return await self.get_by_id(id)

    async def delete(self, id: int) -> bool:
        """Soft delete a record by ID."""
        query = (
            update(self.model)
            .where(self.model.id == id, self.model.is_deleted == False)
            .values(is_deleted=True)
        )
        result = await self.db.execute(query)
        await self.db.flush()
        return result.rowcount > 0

    async def hard_delete(self, id: int) -> bool:
        """Permanently delete a record by ID."""
        query = delete(self.model).where(self.model.id == id)
        result = await self.db.execute(query)
        await self.db.flush()
        return result.rowcount > 0
