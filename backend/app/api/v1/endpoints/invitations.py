from fastapi import APIRouter, Query

from app.core.dependencies import DbSession, CurrentUser, AdminUser, ManagerOrAdmin, StaffUser
from app.schemas.invitation import (
    InvitationCreate, BulkInvitationCreate, InvitationUpdate,
    BulkRSVPUpdate, InvitationResponse, BulkInvitationResponse,
    RSVPSummaryResponse,
)
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.invitation_service import InvitationService
from app.repositories.guest import GuestRepository

router = APIRouter(prefix="/invitations", tags=["Invitations"])


@router.get("", response_model=list[InvitationResponse])
async def list_all_invitations(db: DbSession, user: StaffUser):
    """List all invitations with guest and event data (admin/manager/user)."""
    service = InvitationService(db)
    return await service.get_all()


@router.get("/my-invitations", response_model=list[InvitationResponse])
async def get_my_invitations(db: DbSession, current_user: CurrentUser):
    """Get invitations for the current user (matched by email to guest record)."""
    guest_repo = GuestRepository(db)
    guest = await guest_repo.get_by_email(current_user.email)
    if not guest:
        return []
    service = InvitationService(db)
    return await service.get_by_guest(guest.id)


@router.get("/event/{event_id}", response_model=PaginatedResponse[InvitationResponse])
async def get_invitations_by_event(
    event_id: int,
    db: DbSession,
    user: StaffUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """Get invitations for an event (admin/manager/user)."""
    service = InvitationService(db)
    skip = (page - 1) * page_size
    items = await service.get_by_event(event_id, skip, page_size)
    total = await service.count_by_event(event_id)
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/guest/{guest_id}", response_model=list[InvitationResponse])
async def get_invitations_by_guest(
    guest_id: int, db: DbSession, user: StaffUser
):
    """Get invitations for a guest (admin/manager/user)."""
    service = InvitationService(db)
    return await service.get_by_guest(guest_id)


@router.get("/rsvp-summary/{event_id}", response_model=RSVPSummaryResponse)
async def get_rsvp_summary(event_id: int, db: DbSession, user: StaffUser):
    """Get RSVP summary for an event (admin/manager/user)."""
    service = InvitationService(db)
    return await service.get_rsvp_summary(event_id)


@router.get("/{invitation_id}", response_model=InvitationResponse)
async def get_invitation(invitation_id: int, db: DbSession, user: StaffUser):
    """Get invitation by ID (admin/manager/user)."""
    service = InvitationService(db)
    return await service.get_invitation(invitation_id)


@router.post("", response_model=InvitationResponse, status_code=201)
async def create_invitation(data: InvitationCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a single invitation (manager/admin)."""
    service = InvitationService(db)
    return await service.create_invitation(data)


@router.post("/bulk", response_model=BulkInvitationResponse, status_code=201)
async def bulk_invite(data: BulkInvitationCreate, db: DbSession, user: ManagerOrAdmin):
    """Bulk invite guests to an event (manager/admin)."""
    service = InvitationService(db)
    return await service.bulk_invite(data)


@router.put("/{invitation_id}", response_model=InvitationResponse)
async def update_invitation(
    invitation_id: int, data: InvitationUpdate, db: DbSession, user: ManagerOrAdmin
):
    """Update an invitation (manager/admin)."""
    service = InvitationService(db)
    return await service.update_invitation(invitation_id, data)


@router.put("/bulk-rsvp", response_model=list[InvitationResponse])
async def bulk_update_rsvp(data: BulkRSVPUpdate, db: DbSession, user: ManagerOrAdmin):
    """Bulk update RSVP statuses (manager/admin)."""
    service = InvitationService(db)
    return await service.bulk_update_rsvp(data)


@router.delete("/{invitation_id}", response_model=MessageResponse)
async def delete_invitation(invitation_id: int, db: DbSession, admin: AdminUser):
    """Delete an invitation (admin only)."""
    service = InvitationService(db)
    await service.delete_invitation(invitation_id)
    return MessageResponse(message="Invitation deleted successfully")
