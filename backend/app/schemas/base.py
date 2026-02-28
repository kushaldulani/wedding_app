from datetime import datetime

from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with common configuration."""

    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )


class BaseResponseSchema(BaseSchema):
    """Base schema for responses with common fields."""

    id: int
    created_at: datetime
    updated_at: datetime
