from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin, StaffUser
from app.repositories.vendor_category import VendorCategoryRepository
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorResponse, VendorSummaryResponse
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.vendor_service import VendorService
from app.utils.excel import generate_excel

router = APIRouter(prefix="/vendors", tags=["Vendors"])


@router.get("", response_model=PaginatedResponse[VendorResponse])
async def get_vendors(
    db: DbSession,
    user: StaffUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    vendor_category_id: int | None = None,
    is_booked: bool | None = None,
):
    """Get all vendors with optional filters (admin/manager/user)."""
    service = VendorService(db)
    skip = (page - 1) * page_size
    items = await service.get_vendors(
        skip=skip, limit=page_size,
        vendor_category_id=vendor_category_id, is_booked=is_booked,
    )
    total = await service.count_vendors()
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/summary", response_model=VendorSummaryResponse)
async def get_vendor_summary(db: DbSession, user: StaffUser):
    """Get vendor summary statistics (admin/manager/user)."""
    service = VendorService(db)
    return await service.get_summary()


@router.get("/export")
async def export_vendors(
    db: DbSession,
    user: StaffUser,
    vendor_category_id: int | None = None,
    is_booked: bool | None = None,
):
    """Export vendors to Excel (admin/manager/user)."""
    service = VendorService(db)
    items = await service.get_vendors(
        skip=0, limit=10000,
        vendor_category_id=vendor_category_id, is_booked=is_booked,
    )

    categories = await VendorCategoryRepository(db).get_all(limit=10000)
    cat_map = {c.id: c.name for c in categories}

    columns = [
        ("name", "Name"),
        (lambda v: cat_map.get(v.vendor_category_id, ""), "Vendor Category"),
        ("contact_person", "Contact Person"),
        ("phone", "Phone"),
        ("email", "Email"),
        ("website", "Website"),
        ("address", "Address"),
        ("is_booked", "Booked"),
        ("notes", "Notes"),
        ("created_at", "Created At"),
    ]

    buffer = generate_excel(items, columns, "Vendors")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=vendors.xlsx"},
    )


@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: int, db: DbSession, user: StaffUser):
    """Get vendor by ID (admin/manager/user)."""
    service = VendorService(db)
    return await service.get_vendor(vendor_id)


@router.post("", response_model=VendorResponse, status_code=201)
async def create_vendor(data: VendorCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new vendor (manager/admin)."""
    service = VendorService(db)
    return await service.create_vendor(data)


@router.put("/{vendor_id}", response_model=VendorResponse)
async def update_vendor(vendor_id: int, data: VendorUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a vendor (manager/admin)."""
    service = VendorService(db)
    return await service.update_vendor(vendor_id, data)


@router.delete("/{vendor_id}", response_model=MessageResponse)
async def delete_vendor(vendor_id: int, db: DbSession, admin: AdminUser):
    """Delete a vendor (admin only)."""
    service = VendorService(db)
    await service.delete_vendor(vendor_id)
    return MessageResponse(message="Vendor deleted successfully")
