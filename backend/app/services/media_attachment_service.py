import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import BadRequestException, NotFoundException
from app.models.media_attachment import MediaAttachment
from app.repositories.media_attachment import MediaAttachmentRepository
from app.repositories.vendor_service import VendorServiceRepository
from app.repositories.task import TaskRepository

settings = get_settings()

ALLOWED_ENTITY_TYPES = ("vendor_service", "task")

ALLOWED_MIME_TYPES = {
    # Images
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
    # Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    # Text
    "text/plain", "text/csv",
}


class MediaAttachmentService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = MediaAttachmentRepository(db)
        self.vendor_service_repo = VendorServiceRepository(db)
        self.task_repo = TaskRepository(db)

    async def _validate_entity(self, entity_type: str, entity_id: int) -> None:
        if entity_type not in ALLOWED_ENTITY_TYPES:
            raise BadRequestException(
                f"Invalid entity_type. Must be one of: {', '.join(ALLOWED_ENTITY_TYPES)}"
            )
        if entity_type == "vendor_service":
            entity = await self.vendor_service_repo.get_by_id(entity_id)
        else:
            entity = await self.task_repo.get_by_id(entity_id)

        if not entity:
            raise NotFoundException(f"{entity_type} with id {entity_id} not found")

    def _validate_file(self, file: UploadFile) -> None:
        max_bytes = settings.max_file_size_mb * 1024 * 1024
        if file.size and file.size > max_bytes:
            raise BadRequestException(
                f"File too large. Maximum size is {settings.max_file_size_mb}MB"
            )
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise BadRequestException(
                f"File type '{file.content_type}' is not allowed"
            )

    async def upload_file(
        self, entity_type: str, entity_id: int, file: UploadFile
    ) -> MediaAttachment:
        self._validate_file(file)

        ext = Path(file.filename).suffix.lower() if file.filename else ""
        stored_filename = f"{uuid.uuid4().hex}{ext}"
        relative_path = f"{entity_type}/{entity_id}/{stored_filename}"

        abs_dir = Path(settings.upload_dir) / entity_type / str(entity_id)
        abs_dir.mkdir(parents=True, exist_ok=True)
        abs_path = abs_dir / stored_filename

        content = await file.read()
        max_bytes = settings.max_file_size_mb * 1024 * 1024
        if len(content) > max_bytes:
            raise BadRequestException(
                f"File too large. Maximum size is {settings.max_file_size_mb}MB"
            )

        with open(abs_path, "wb") as f:
            f.write(content)

        attachment = await self.repo.create({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "original_filename": file.filename or "unknown",
            "stored_filename": stored_filename,
            "file_size": len(content),
            "mime_type": file.content_type or "application/octet-stream",
            "upload_path": relative_path,
        })
        return attachment

    async def upload_files(
        self, entity_type: str, entity_id: int, files: list[UploadFile]
    ) -> list[MediaAttachment]:
        await self._validate_entity(entity_type, entity_id)
        results = []
        for file in files:
            attachment = await self.upload_file(entity_type, entity_id, file)
            results.append(attachment)
        return results

    async def get_attachments(
        self, entity_type: str, entity_id: int
    ) -> list[MediaAttachment]:
        return await self.repo.get_by_entity(entity_type, entity_id)

    async def get_attachment(self, attachment_id: int) -> MediaAttachment:
        attachment = await self.repo.get_by_id(attachment_id)
        if not attachment:
            raise NotFoundException("Attachment not found")
        return attachment

    async def delete_attachment(self, attachment_id: int) -> bool:
        attachment = await self.get_attachment(attachment_id)

        abs_path = Path(settings.upload_dir) / attachment.upload_path
        if abs_path.exists():
            abs_path.unlink()

        return await self.repo.delete(attachment_id)
