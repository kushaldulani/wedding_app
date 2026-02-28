from pathlib import Path

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse

from app.core.config import get_settings
from app.core.dependencies import DbSession, StaffUser, ManagerOrAdmin
from app.core.exceptions import NotFoundException
from app.schemas.media_attachment import MediaAttachmentResponse
from app.schemas.common import MessageResponse
from app.services.media_attachment_service import MediaAttachmentService

settings = get_settings()

router = APIRouter(prefix="/media", tags=["Media Attachments"])


@router.post(
    "/{entity_type}/{entity_id}",
    response_model=list[MediaAttachmentResponse],
    status_code=201,
)
async def upload_attachments(
    entity_type: str,
    entity_id: int,
    db: DbSession,
    user: StaffUser,
    files: list[UploadFile] = File(...),
):
    """Upload one or more files to a vendor_service or task."""
    service = MediaAttachmentService(db)
    return await service.upload_files(entity_type, entity_id, files)


@router.get(
    "/{entity_type}/{entity_id}",
    response_model=list[MediaAttachmentResponse],
)
async def get_attachments(
    entity_type: str,
    entity_id: int,
    db: DbSession,
    user: StaffUser,
):
    """Get all attachments for a vendor_service or task."""
    service = MediaAttachmentService(db)
    return await service.get_attachments(entity_type, entity_id)


@router.get("/file/{attachment_id}")
async def serve_file(
    attachment_id: int,
    db: DbSession,
    user: StaffUser,
):
    """Serve/download a specific attachment file."""
    service = MediaAttachmentService(db)
    attachment = await service.get_attachment(attachment_id)

    abs_path = Path(settings.upload_dir) / attachment.upload_path
    if not abs_path.exists():
        raise NotFoundException("File not found on disk")

    return FileResponse(
        path=str(abs_path),
        filename=attachment.original_filename,
        media_type=attachment.mime_type,
    )


@router.delete("/{attachment_id}", response_model=MessageResponse)
async def delete_attachment(
    attachment_id: int,
    db: DbSession,
    user: ManagerOrAdmin,
):
    """Delete an attachment (manager/admin only)."""
    service = MediaAttachmentService(db)
    await service.delete_attachment(attachment_id)
    return MessageResponse(message="Attachment deleted successfully")
