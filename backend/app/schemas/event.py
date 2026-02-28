from datetime import date, time

from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema
from app.models.enums import EventStatus


class EventCreate(BaseSchema):
    name: str = Field(..., min_length=1, max_length=200)
    event_type_id: int
    description: str | None = None
    venue_name: str | None = Field(None, max_length=300)
    venue_address: str | None = None
    event_date: date
    start_time: time | None = None
    end_time: time | None = None
    status: EventStatus = EventStatus.UPCOMING


class EventUpdate(BaseSchema):
    name: str | None = Field(None, min_length=1, max_length=200)
    event_type_id: int | None = None
    description: str | None = None
    venue_name: str | None = Field(None, max_length=300)
    venue_address: str | None = None
    event_date: date | None = None
    start_time: time | None = None
    end_time: time | None = None
    status: EventStatus | None = None


class EventResponse(BaseResponseSchema):
    name: str
    event_type_id: int
    description: str | None
    venue_name: str | None
    venue_address: str | None
    event_date: date
    start_time: time | None
    end_time: time | None
    status: EventStatus


class EventSummaryResponse(BaseSchema):
    total_events: int
    by_status: dict[str, int]
    by_type: dict[str, int]
