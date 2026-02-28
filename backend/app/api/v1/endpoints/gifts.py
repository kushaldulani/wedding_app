from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.repositories.guest import GuestRepository
from app.repositories.gift_type import GiftTypeRepository
from app.schemas.gift import GiftCreate, GiftUpdate, GiftResponse, GiftSummaryResponse
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.gift_service import GiftService
from app.utils.excel import generate_excel

router = APIRouter(prefix="/gifts", tags=["Gifts"])


@router.get("", response_model=PaginatedResponse[GiftResponse])
async def get_gifts(
    db: DbSession,
    user: ManagerOrAdmin,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    guest_id: int | None = None,
    gift_type_id: int | None = None,
):
    """Get all gifts with optional filters."""
    service = GiftService(db)
    skip = (page - 1) * page_size
    items = await service.get_gifts(
        skip=skip, limit=page_size, guest_id=guest_id, gift_type_id=gift_type_id,
    )
    total = await service.count_gifts()
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/summary", response_model=GiftSummaryResponse)
async def get_gift_summary(db: DbSession, user: ManagerOrAdmin):
    """Get gift summary statistics."""
    service = GiftService(db)
    return await service.get_summary()


@router.get("/thank-you-pending", response_model=list[GiftResponse])
async def get_thank_you_pending(db: DbSession, user: ManagerOrAdmin):
    """Get gifts where thank you has not been sent."""
    service = GiftService(db)
    return await service.get_thank_you_pending()


@router.get("/export")
async def export_gifts(
    db: DbSession,
    user: ManagerOrAdmin,
    guest_id: int | None = None,
    gift_type_id: int | None = None,
):
    """Export gifts to Excel (manager/admin)."""
    service = GiftService(db)
    items = await service.get_gifts(
        skip=0, limit=10000, guest_id=guest_id, gift_type_id=gift_type_id,
    )

    guests = await GuestRepository(db).get_all(limit=10000)
    gift_types = await GiftTypeRepository(db).get_all(limit=10000)
    guest_map = {g.id: f"{g.first_name} {g.last_name}" for g in guests}
    gt_map = {t.id: t.name for t in gift_types}

    columns = [
        (lambda g: guest_map.get(g.guest_id, ""), "Guest"),
        (lambda g: gt_map.get(g.gift_type_id, ""), "Gift Type"),
        ("description", "Description"),
        ("estimated_value", "Estimated Value"),
        ("received_at", "Received At"),
        ("thank_you_sent", "Thank You Sent"),
        ("notes", "Notes"),
        ("created_at", "Created At"),
    ]

    buffer = generate_excel(items, columns, "Gifts")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=gifts.xlsx"},
    )


@router.get("/{gift_id}", response_model=GiftResponse)
async def get_gift(gift_id: int, db: DbSession, user: ManagerOrAdmin):
    """Get gift by ID."""
    service = GiftService(db)
    return await service.get_gift(gift_id)


@router.post("", response_model=GiftResponse, status_code=201)
async def create_gift(data: GiftCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new gift record (manager/admin)."""
    service = GiftService(db)
    return await service.create_gift(data)


@router.put("/{gift_id}", response_model=GiftResponse)
async def update_gift(gift_id: int, data: GiftUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a gift record (manager/admin)."""
    service = GiftService(db)
    return await service.update_gift(gift_id, data)


@router.delete("/{gift_id}", response_model=MessageResponse)
async def delete_gift(gift_id: int, db: DbSession, admin: AdminUser):
    """Delete a gift record (admin only)."""
    service = GiftService(db)
    await service.delete_gift(gift_id)
    return MessageResponse(message="Gift deleted successfully")
