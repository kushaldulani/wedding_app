from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema


class VendorCreate(BaseSchema):
    name: str = Field(..., min_length=1, max_length=200)
    vendor_category_id: int
    contact_person: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=20)
    email: str | None = Field(None, max_length=255)
    website: str | None = Field(None, max_length=500)
    address: str | None = None
    notes: str | None = None
    is_booked: bool = False


class VendorUpdate(BaseSchema):
    name: str | None = Field(None, min_length=1, max_length=200)
    vendor_category_id: int | None = None
    contact_person: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=20)
    email: str | None = Field(None, max_length=255)
    website: str | None = Field(None, max_length=500)
    address: str | None = None
    notes: str | None = None
    is_booked: bool | None = None


class VendorResponse(BaseResponseSchema):
    name: str
    vendor_category_id: int
    contact_person: str | None
    phone: str | None
    email: str | None
    website: str | None
    address: str | None
    notes: str | None
    is_booked: bool


class VendorSummaryResponse(BaseSchema):
    total_vendors: int
    booked: int
    not_booked: int
    by_category: dict[str, int]
