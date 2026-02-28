from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ConflictException
from app.models.invitation import Invitation
from app.repositories.invitation import InvitationRepository
from app.repositories.event import EventRepository
from app.repositories.guest import GuestRepository
from app.schemas.invitation import (
    InvitationCreate, InvitationUpdate, BulkInvitationCreate, BulkRSVPUpdate,
)


class InvitationService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.inv_repo = InvitationRepository(db)
        self.event_repo = EventRepository(db)
        self.guest_repo = GuestRepository(db)

    async def get_all(self) -> list[Invitation]:
        return await self.inv_repo.get_all()

    async def get_invitation(self, invitation_id: int) -> Invitation:
        inv = await self.inv_repo.get_by_id(invitation_id)
        if not inv:
            raise NotFoundException("Invitation not found")
        return inv

    async def get_by_event(
        self, event_id: int, skip: int = 0, limit: int = 100
    ) -> list[Invitation]:
        return await self.inv_repo.get_by_event(event_id, skip, limit)

    async def get_by_guest(
        self, guest_id: int, skip: int = 0, limit: int = 100
    ) -> list[Invitation]:
        return await self.inv_repo.get_by_guest(guest_id, skip, limit)

    async def _reactivate_or_create(
        self, guest_id: int, event_id: int, status, plus_ones: int = 0, notes: str | None = None
    ) -> Invitation | None:
        """Reactivate a soft-deleted invitation or create a new one."""
        deleted = await self.inv_repo.get_by_event_and_guest_including_deleted(
            event_id, guest_id
        )
        if deleted and deleted.is_deleted:
            return await self.inv_repo.reactivate(deleted.id, {
                "is_deleted": False,
                "status": status,
                "plus_ones": plus_ones,
                "notes": notes,
            })
        if deleted:
            return None  # Already exists and active
        return await self.inv_repo.create({
            "guest_id": guest_id,
            "event_id": event_id,
            "status": status,
            "plus_ones": plus_ones,
            "notes": notes,
        })

    async def create_invitation(self, data: InvitationCreate) -> Invitation:
        event = await self.event_repo.get_by_id(data.event_id)
        if not event:
            raise NotFoundException("Event not found")

        guest = await self.guest_repo.get_by_id(data.guest_id)
        if not guest:
            raise NotFoundException("Guest not found")

        result = await self._reactivate_or_create(
            data.guest_id, data.event_id, data.status, data.plus_ones, data.notes
        )
        if not result:
            raise ConflictException("Guest is already invited to this event")
        return result

    async def bulk_invite(self, data: BulkInvitationCreate) -> dict:
        event = await self.event_repo.get_by_id(data.event_id)
        if not event:
            raise NotFoundException("Event not found")

        created = 0
        skipped = 0
        for guest_id in data.guest_ids:
            guest = await self.guest_repo.get_by_id(guest_id)
            if not guest:
                skipped += 1
                continue

            result = await self._reactivate_or_create(
                guest_id, data.event_id, data.status
            )
            if result:
                created += 1
            else:
                skipped += 1

        return {
            "created": created,
            "skipped": skipped,
            "message": f"{created} invitations created, {skipped} skipped",
        }

    async def update_invitation(self, invitation_id: int, data: InvitationUpdate) -> Invitation:
        await self.get_invitation(invitation_id)
        update_data = data.model_dump(exclude_unset=True)
        updated = await self.inv_repo.update(invitation_id, update_data)
        if not updated:
            raise NotFoundException("Invitation not found")
        return updated

    async def bulk_update_rsvp(self, data: BulkRSVPUpdate) -> list[Invitation]:
        results = []
        for item in data.updates:
            inv = await self.inv_repo.get_by_id(item.invitation_id)
            if not inv:
                continue
            update_data = {"status": item.status}
            if item.plus_ones is not None:
                update_data["plus_ones"] = item.plus_ones
            updated = await self.inv_repo.update(item.invitation_id, update_data)
            if updated:
                results.append(updated)
        return results

    async def delete_invitation(self, invitation_id: int) -> bool:
        await self.get_invitation(invitation_id)
        return await self.inv_repo.delete(invitation_id)

    async def get_rsvp_summary(self, event_id: int) -> dict:
        event = await self.event_repo.get_by_id(event_id)
        if not event:
            raise NotFoundException("Event not found")
        return await self.inv_repo.get_rsvp_summary(event_id)

    async def count_by_event(self, event_id: int) -> int:
        return await self.inv_repo.count_by_event(event_id)
