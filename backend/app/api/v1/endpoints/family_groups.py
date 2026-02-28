from fastapi import APIRouter

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.schemas.lookup import LookupCreate, LookupUpdate, LookupResponse
from app.schemas.common import MessageResponse
from app.services.family_group_service import FamilyGroupService

router = APIRouter(prefix="/family-groups", tags=["Family Groups"])


@router.get("", response_model=list[LookupResponse])
async def get_family_groups(db: DbSession, user: ManagerOrAdmin):
    """Get all active family groups (manager/admin)."""
    service = FamilyGroupService(db)
    return await service.get_all()


@router.post("", response_model=LookupResponse, status_code=201)
async def create_family_group(data: LookupCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new family group (manager/admin)."""
    service = FamilyGroupService(db)
    return await service.create(data)


@router.put("/{entry_id}", response_model=LookupResponse)
async def update_family_group(entry_id: int, data: LookupUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a family group (manager/admin)."""
    service = FamilyGroupService(db)
    return await service.update(entry_id, data)


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_family_group(entry_id: int, db: DbSession, admin: AdminUser):
    """Delete a family group (admin only)."""
    service = FamilyGroupService(db)
    await service.delete(entry_id)
    return MessageResponse(message="Family group deleted successfully")
