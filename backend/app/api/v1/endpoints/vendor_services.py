from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin, StaffUser
from app.models.enums import VendorServiceStatus
from app.repositories.vendor import VendorRepository
from app.repositories.event import EventRepository
from app.schemas.vendor_service import (
    VendorServiceCreate, VendorServiceUpdate,
    VendorServiceResponse, VendorServiceSummaryResponse,
)
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.vendor_service_manager import VendorServiceManager
from app.utils.excel import generate_excel

router = APIRouter(prefix="/vendor-services", tags=["Vendor Services"])


@router.get("", response_model=PaginatedResponse[VendorServiceResponse])
async def get_vendor_services(
    db: DbSession,
    user: StaffUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    vendor_id: int | None = None,
    event_id: int | None = None,
    status: VendorServiceStatus | None = None,
    unassigned: bool | None = None,
):
    """Get all vendor services with optional filters (admin/manager/user)."""
    service = VendorServiceManager(db)
    skip = (page - 1) * page_size
    items = await service.get_services(
        skip=skip, limit=page_size, vendor_id=vendor_id,
        event_id=event_id, status=status, unassigned=unassigned,
    )
    total = await service.count_services()
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/summary", response_model=VendorServiceSummaryResponse)
async def get_vendor_service_summary(db: DbSession, user: StaffUser):
    """Get vendor service summary statistics (admin/manager/user)."""
    service = VendorServiceManager(db)
    return await service.get_summary()


@router.get("/export")
async def export_vendor_services(
    db: DbSession,
    user: StaffUser,
    vendor_id: int | None = None,
    event_id: int | None = None,
    status: VendorServiceStatus | None = None,
):
    """Export vendor services to Excel (admin/manager/user)."""
    service = VendorServiceManager(db)
    items = await service.get_services(
        skip=0, limit=10000, vendor_id=vendor_id,
        event_id=event_id, status=status,
    )

    vendors = await VendorRepository(db).get_all(limit=10000)
    events = await EventRepository(db).get_all(limit=10000)
    vendor_map = {v.id: v.name for v in vendors}
    event_map = {e.id: e.name for e in events}

    columns = [
        ("title", "Title"),
        ("description", "Description"),
        (lambda vs: vendor_map.get(vs.vendor_id, ""), "Vendor"),
        (lambda vs: event_map.get(vs.event_id, ""), "Event"),
        ("service_date", "Service Date"),
        ("start_time", "Start Time"),
        ("end_time", "End Time"),
        ("amount", "Amount"),
        ("status", "Status"),
        ("notes", "Notes"),
        ("created_at", "Created At"),
    ]

    buffer = generate_excel(items, columns, "Vendor Services")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=vendor_services.xlsx"},
    )


@router.get("/{service_id}", response_model=VendorServiceResponse)
async def get_vendor_service(service_id: int, db: DbSession, user: StaffUser):
    """Get vendor service by ID (admin/manager/user)."""
    service = VendorServiceManager(db)
    return await service.get_service(service_id)


@router.post("", response_model=VendorServiceResponse, status_code=201)
async def create_vendor_service(
    data: VendorServiceCreate, db: DbSession, user: ManagerOrAdmin
):
    """Create a new vendor service (manager/admin). No vendor assigned yet."""
    service = VendorServiceManager(db)
    return await service.create_service(data)


@router.put("/{service_id}", response_model=VendorServiceResponse)
async def update_vendor_service(
    service_id: int, data: VendorServiceUpdate, db: DbSession, user: ManagerOrAdmin
):
    """Update a vendor service / assign vendor (manager/admin)."""
    service = VendorServiceManager(db)
    return await service.update_service(service_id, data)


@router.delete("/{service_id}", response_model=MessageResponse)
async def delete_vendor_service(service_id: int, db: DbSession, admin: AdminUser):
    """Delete a vendor service (admin only)."""
    service = VendorServiceManager(db)
    await service.delete_service(service_id)
    return MessageResponse(message="Vendor service deleted successfully")
