from fastapi import APIRouter

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.schemas.lookup import LookupCreate, LookupUpdate, LookupResponse
from app.schemas.common import MessageResponse
from app.services.event_type_service import EventTypeService

router = APIRouter(prefix="/event-types", tags=["Event Types"])


@router.get("", response_model=list[LookupResponse])
async def get_event_types(db: DbSession, user: ManagerOrAdmin):
    """Get all active event types (manager/admin)."""
    service = EventTypeService(db)
    return await service.get_all()


@router.post("", response_model=LookupResponse, status_code=201)
async def create_event_type(data: LookupCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new event type (manager/admin)."""
    service = EventTypeService(db)
    return await service.create(data)


@router.put("/{entry_id}", response_model=LookupResponse)
async def update_event_type(entry_id: int, data: LookupUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update an event type (manager/admin)."""
    service = EventTypeService(db)
    return await service.update(entry_id, data)


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_event_type(entry_id: int, db: DbSession, admin: AdminUser):
    """Delete an event type (admin only)."""
    service = EventTypeService(db)
    await service.delete(entry_id)
    return MessageResponse(message="Event type deleted successfully")
