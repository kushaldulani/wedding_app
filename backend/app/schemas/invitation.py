from datetime import date

from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema
from app.models.enums import InvitationStatus


class GuestBrief(BaseSchema):
    id: int
    first_name: str
    last_name: str
    phone: str | None = None
    side: str | None = None
    is_vip: bool = False


class EventBrief(BaseSchema):
    id: int
    name: str
    event_date: date | None = None


class InvitationCreate(BaseSchema):
    guest_id: int
    event_id: int
    status: InvitationStatus = InvitationStatus.PENDING
    plus_ones: int = Field(0, ge=0)
    notes: str | None = None


class BulkInvitationCreate(BaseSchema):
    event_id: int
    guest_ids: list[int]
    status: InvitationStatus = InvitationStatus.PENDING


class InvitationUpdate(BaseSchema):
    status: InvitationStatus | None = None
    plus_ones: int | None = Field(None, ge=0)
    notes: str | None = None


class BulkRSVPItem(BaseSchema):
    invitation_id: int
    status: InvitationStatus
    plus_ones: int | None = Field(None, ge=0)


class BulkRSVPUpdate(BaseSchema):
    updates: list[BulkRSVPItem]


class InvitationResponse(BaseResponseSchema):
    guest_id: int
    event_id: int
    status: InvitationStatus
    plus_ones: int
    notes: str | None
    guest: GuestBrief | None = None
    event: EventBrief | None = None


class BulkInvitationResponse(BaseSchema):
    created: int
    skipped: int
    message: str


class RSVPSummaryResponse(BaseSchema):
    event_id: int
    event_name: str
    total_invited: int
    confirmed: int
    declined: int
    maybe: int
    pending: int
    sent: int
    total_plus_ones: int
    total_expected_attendees: int
