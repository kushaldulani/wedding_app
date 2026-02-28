from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin, StaffUser
from app.models.enums import GuestSide
from app.repositories.relation_type import RelationTypeRepository
from app.repositories.family_group import FamilyGroupRepository
from app.repositories.dietary_preference import DietaryPreferenceRepository
from app.schemas.guest import GuestCreate, GuestUpdate, GuestResponse, GuestSummaryResponse
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.guest_service import GuestService
from app.utils.excel import generate_excel

router = APIRouter(prefix="/guests", tags=["Guests"])


@router.get("", response_model=PaginatedResponse[GuestResponse])
async def get_guests(
    db: DbSession,
    user: StaffUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    side: GuestSide | None = None,
    family_group_id: int | None = None,
    is_vip: bool | None = None,
    dietary_preference_id: int | None = None,
):
    """Get all guests with optional filters (admin/manager/user)."""
    service = GuestService(db)
    skip = (page - 1) * page_size
    items = await service.get_guests(
        skip=skip, limit=page_size, side=side,
        family_group_id=family_group_id, is_vip=is_vip,
        dietary_preference_id=dietary_preference_id,
    )
    total = await service.count_guests()
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/summary", response_model=GuestSummaryResponse)
async def get_guest_summary(db: DbSession, user: StaffUser):
    """Get guest summary statistics (admin/manager/user)."""
    service = GuestService(db)
    return await service.get_summary()


@router.get("/export")
async def export_guests(
    db: DbSession,
    user: StaffUser,
    side: GuestSide | None = None,
    family_group_id: int | None = None,
    is_vip: bool | None = None,
    dietary_preference_id: int | None = None,
):
    """Export guests to Excel (admin/manager/user)."""
    service = GuestService(db)
    items = await service.get_guests(
        skip=0, limit=10000, side=side,
        family_group_id=family_group_id, is_vip=is_vip,
        dietary_preference_id=dietary_preference_id,
    )

    relation_types = await RelationTypeRepository(db).get_all(limit=10000)
    family_groups = await FamilyGroupRepository(db).get_all(limit=10000)
    dietary_prefs = await DietaryPreferenceRepository(db).get_all(limit=10000)
    rt_map = {r.id: r.name for r in relation_types}
    fg_map = {f.id: f.name for f in family_groups}
    dp_map = {d.id: d.name for d in dietary_prefs}

    columns = [
        ("first_name", "First Name"),
        ("last_name", "Last Name"),
        ("email", "Email"),
        ("phone", "Phone"),
        ("side", "Side"),
        (lambda g: rt_map.get(g.relation_type_id, ""), "Relation Type"),
        (lambda g: fg_map.get(g.family_group_id, ""), "Family Group"),
        (lambda g: dp_map.get(g.dietary_preference_id, ""), "Dietary Preference"),
        ("age_group", "Age Group"),
        ("number_of_persons", "No. of Persons"),
        ("room_number", "Room Number"),
        ("floor", "Floor"),
        ("arrival_at", "Arrival"),
        ("departure_at", "Departure"),
        ("is_vip", "VIP"),
        ("notes", "Notes"),
        ("created_at", "Created At"),
    ]

    buffer = generate_excel(items, columns, "Guests")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=guests.xlsx"},
    )


@router.get("/{guest_id}", response_model=GuestResponse)
async def get_guest(guest_id: int, db: DbSession, user: StaffUser):
    """Get guest by ID (admin/manager/user)."""
    service = GuestService(db)
    return await service.get_guest(guest_id)


@router.post("", response_model=GuestResponse, status_code=201)
async def create_guest(data: GuestCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new guest (manager/admin)."""
    service = GuestService(db)
    return await service.create_guest(data)


@router.put("/{guest_id}", response_model=GuestResponse)
async def update_guest(guest_id: int, data: GuestUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a guest (manager/admin)."""
    service = GuestService(db)
    return await service.update_guest(guest_id, data)


@router.delete("/{guest_id}", response_model=MessageResponse)
async def delete_guest(guest_id: int, db: DbSession, admin: AdminUser):
    """Delete a guest (admin only)."""
    service = GuestService(db)
    await service.delete_guest(guest_id)
    return MessageResponse(message="Guest deleted successfully")
