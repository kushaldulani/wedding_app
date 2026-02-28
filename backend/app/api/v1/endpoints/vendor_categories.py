from fastapi import APIRouter

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.schemas.lookup import LookupCreate, LookupUpdate, LookupResponse
from app.schemas.common import MessageResponse
from app.services.vendor_category_service import VendorCategoryService

router = APIRouter(prefix="/vendor-categories", tags=["Vendor Categories"])


@router.get("", response_model=list[LookupResponse])
async def get_vendor_categories(db: DbSession, user: ManagerOrAdmin):
    """Get all active vendor categories (manager/admin)."""
    service = VendorCategoryService(db)
    return await service.get_all()


@router.post("", response_model=LookupResponse, status_code=201)
async def create_vendor_category(data: LookupCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new vendor category (manager/admin)."""
    service = VendorCategoryService(db)
    return await service.create(data)


@router.put("/{entry_id}", response_model=LookupResponse)
async def update_vendor_category(entry_id: int, data: LookupUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a vendor category (manager/admin)."""
    service = VendorCategoryService(db)
    return await service.update(entry_id, data)


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_vendor_category(entry_id: int, db: DbSession, admin: AdminUser):
    """Delete a vendor category (admin only)."""
    service = VendorCategoryService(db)
    await service.delete(entry_id)
    return MessageResponse(message="Vendor category deleted successfully")
