from fastapi import APIRouter

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.schemas.lookup import LookupCreate, LookupUpdate, LookupResponse
from app.schemas.common import MessageResponse
from app.services.gift_type_service import GiftTypeService

router = APIRouter(prefix="/gift-types", tags=["Gift Types"])


@router.get("", response_model=list[LookupResponse])
async def get_gift_types(db: DbSession, user: ManagerOrAdmin):
    """Get all active gift types (manager/admin)."""
    service = GiftTypeService(db)
    return await service.get_all()


@router.post("", response_model=LookupResponse, status_code=201)
async def create_gift_type(data: LookupCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new gift type (manager/admin)."""
    service = GiftTypeService(db)
    return await service.create(data)


@router.put("/{entry_id}", response_model=LookupResponse)
async def update_gift_type(entry_id: int, data: LookupUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a gift type (manager/admin)."""
    service = GiftTypeService(db)
    return await service.update(entry_id, data)


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_gift_type(entry_id: int, db: DbSession, admin: AdminUser):
    """Delete a gift type (admin only)."""
    service = GiftTypeService(db)
    await service.delete(entry_id)
    return MessageResponse(message="Gift type deleted successfully")
