from typing import Generic, TypeVar

from pydantic import BaseModel

DataT = TypeVar("DataT")


class MessageResponse(BaseModel):
    """Simple message response."""

    message: str


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Paginated response wrapper."""

    items: list[DataT]
    total: int
    page: int
    page_size: int
    total_pages: int
