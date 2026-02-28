from datetime import date, time
from decimal import Decimal

from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema
from app.models.enums import VendorServiceStatus


class VendorServiceCreate(BaseSchema):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    vendor_id: int | None = None
    event_id: int | None = None
    service_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    amount: Decimal | None = Field(None, ge=0, max_digits=12, decimal_places=2)
    status: VendorServiceStatus | None = None
    notes: str | None = None


class VendorServiceUpdate(BaseSchema):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    vendor_id: int | None = None
    event_id: int | None = None
    service_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    amount: Decimal | None = Field(None, ge=0, max_digits=12, decimal_places=2)
    status: VendorServiceStatus | None = None
    notes: str | None = None


class VendorServiceResponse(BaseResponseSchema):
    title: str
    description: str | None
    vendor_id: int | None
    event_id: int | None
    service_date: date | None
    start_time: time | None
    end_time: time | None
    amount: Decimal | None
    status: VendorServiceStatus
    notes: str | None


class VendorServiceSummaryResponse(BaseSchema):
    total: int
    by_status: dict[str, int]
    unassigned_count: int
    all_events_count: int
