from datetime import date
from decimal import Decimal

from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema


class GiftCreate(BaseSchema):
    guest_id: int
    gift_type_id: int
    description: str | None = None
    estimated_value: Decimal | None = Field(None, ge=0)
    received_at: date | None = None
    thank_you_sent: bool = False
    notes: str | None = None


class GiftUpdate(BaseSchema):
    guest_id: int | None = None
    gift_type_id: int | None = None
    description: str | None = None
    estimated_value: Decimal | None = Field(None, ge=0)
    received_at: date | None = None
    thank_you_sent: bool | None = None
    notes: str | None = None


class GiftResponse(BaseResponseSchema):
    guest_id: int
    gift_type_id: int
    description: str | None
    estimated_value: Decimal | None
    received_at: date | None
    thank_you_sent: bool
    notes: str | None


class GiftSummaryResponse(BaseSchema):
    total_gifts: int
    total_value: Decimal
    by_gift_type: dict[str, int]
    thank_you_pending: int
