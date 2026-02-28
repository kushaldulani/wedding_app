from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.media_attachment import MediaAttachment
from app.repositories.base import BaseRepository


class MediaAttachmentRepository(BaseRepository[MediaAttachment]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, MediaAttachment)

    async def get_by_entity(
        self, entity_type: str, entity_id: int
    ) -> list[MediaAttachment]:
        query = (
            select(MediaAttachment)
            .where(
                MediaAttachment.entity_type == entity_type,
                MediaAttachment.entity_id == entity_id,
                MediaAttachment.is_deleted == False,
            )
            .order_by(MediaAttachment.created_at.desc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_by_entity(
        self, entity_type: str, entity_id: int
    ) -> int:
        query = select(func.count(MediaAttachment.id)).where(
            MediaAttachment.entity_type == entity_type,
            MediaAttachment.entity_id == entity_id,
            MediaAttachment.is_deleted == False,
        )
        result = await self.db.execute(query)
        return result.scalar() or 0
