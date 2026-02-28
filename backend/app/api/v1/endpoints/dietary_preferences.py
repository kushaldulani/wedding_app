from fastapi import APIRouter

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.schemas.lookup import LookupCreate, LookupUpdate, LookupResponse
from app.schemas.common import MessageResponse
from app.services.dietary_preference_service import DietaryPreferenceService

router = APIRouter(prefix="/dietary-preferences", tags=["Dietary Preferences"])


@router.get("", response_model=list[LookupResponse])
async def get_dietary_preferences(db: DbSession, user: ManagerOrAdmin):
    """Get all active dietary preferences (manager/admin)."""
    service = DietaryPreferenceService(db)
    return await service.get_all()


@router.post("", response_model=LookupResponse, status_code=201)
async def create_dietary_preference(data: LookupCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new dietary preference (manager/admin)."""
    service = DietaryPreferenceService(db)
    return await service.create(data)


@router.put("/{entry_id}", response_model=LookupResponse)
async def update_dietary_preference(entry_id: int, data: LookupUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a dietary preference (manager/admin)."""
    service = DietaryPreferenceService(db)
    return await service.update(entry_id, data)


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_dietary_preference(entry_id: int, db: DbSession, admin: AdminUser):
    """Delete a dietary preference (admin only)."""
    service = DietaryPreferenceService(db)
    await service.delete(entry_id)
    return MessageResponse(message="Dietary preference deleted successfully")
