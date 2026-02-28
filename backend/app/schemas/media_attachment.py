from app.schemas.base import BaseResponseSchema


class MediaAttachmentResponse(BaseResponseSchema):
    entity_type: str
    entity_id: int
    original_filename: str
    stored_filename: str
    file_size: int
    mime_type: str
    upload_path: str
