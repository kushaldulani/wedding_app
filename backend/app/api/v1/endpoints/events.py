from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbSession, CurrentUser, AdminUser, ManagerOrAdmin
from app.models.enums import EventStatus
from app.repositories.event_type import EventTypeRepository
from app.schemas.event import EventCreate, EventUpdate, EventResponse, EventSummaryResponse
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.event_service import EventService
from app.utils.excel import generate_excel

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=PaginatedResponse[EventResponse])
async def get_events(
    db: DbSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: EventStatus | None = None,
    event_type_id: int | None = None,
):
    """Get all events with optional filters."""
    service = EventService(db)
    skip = (page - 1) * page_size
    items = await service.get_events(skip=skip, limit=page_size, status=status, event_type_id=event_type_id)
    total = await service.count_events()
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/summary", response_model=EventSummaryResponse)
async def get_event_summary(db: DbSession, current_user: CurrentUser):
    """Get event summary statistics."""
    service = EventService(db)
    return await service.get_summary()


@router.get("/export")
async def export_events(
    db: DbSession,
    current_user: CurrentUser,
    status: EventStatus | None = None,
    event_type_id: int | None = None,
):
    """Export events to Excel."""
    service = EventService(db)
    items = await service.get_events(skip=0, limit=10000, status=status, event_type_id=event_type_id)

    event_types = await EventTypeRepository(db).get_all(limit=10000)
    et_map = {e.id: e.name for e in event_types}

    columns = [
        ("name", "Name"),
        (lambda e: et_map.get(e.event_type_id, ""), "Event Type"),
        ("description", "Description"),
        ("venue_name", "Venue Name"),
        ("venue_address", "Venue Address"),
        ("event_date", "Event Date"),
        ("start_time", "Start Time"),
        ("end_time", "End Time"),
        ("status", "Status"),
        ("created_at", "Created At"),
    ]

    buffer = generate_excel(items, columns, "Events")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=events.xlsx"},
    )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: int, db: DbSession, current_user: CurrentUser):
    """Get event by ID."""
    service = EventService(db)
    return await service.get_event(event_id)


@router.post("", response_model=EventResponse, status_code=201)
async def create_event(data: EventCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new event (manager/admin)."""
    service = EventService(db)
    return await service.create_event(data)


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(event_id: int, data: EventUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update an event (manager/admin)."""
    service = EventService(db)
    return await service.update_event(event_id, data)


@router.delete("/{event_id}", response_model=MessageResponse)
async def delete_event(event_id: int, db: DbSession, admin: AdminUser):
    """Delete an event (admin only)."""
    service = EventService(db)
    await service.delete_event(event_id)
    return MessageResponse(message="Event deleted successfully")
