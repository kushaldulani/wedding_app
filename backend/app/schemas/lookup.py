from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema


class LookupCreate(BaseSchema):
    """Schema for creating a lookup entry."""
    name: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    is_active: bool = True


class LookupUpdate(BaseSchema):
    """Schema for updating a lookup entry."""
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    is_active: bool | None = None


class LookupResponse(BaseResponseSchema):
    """Schema for lookup response."""
    name: str
    description: str | None
    is_active: bool
