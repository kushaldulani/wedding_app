from sqlalchemy import select, func, update as sa_update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.invitation import Invitation
from app.models.event import Event
from app.models.enums import InvitationStatus
from app.repositories.base import BaseRepository


class InvitationRepository(BaseRepository[Invitation]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, Invitation)

    async def get_all(self) -> list[Invitation]:
        query = (
            select(Invitation)
            .options(selectinload(Invitation.guest), selectinload(Invitation.event))
            .where(Invitation.is_deleted == False)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_event(
        self, event_id: int, skip: int = 0, limit: int = 100
    ) -> list[Invitation]:
        query = (
            select(Invitation)
            .options(selectinload(Invitation.guest), selectinload(Invitation.event))
            .where(Invitation.event_id == event_id, Invitation.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_guest(
        self, guest_id: int, skip: int = 0, limit: int = 100
    ) -> list[Invitation]:
        query = (
            select(Invitation)
            .options(selectinload(Invitation.guest), selectinload(Invitation.event))
            .where(Invitation.guest_id == guest_id, Invitation.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_event_and_guest(
        self, event_id: int, guest_id: int
    ) -> Invitation | None:
        query = select(Invitation).where(
            Invitation.event_id == event_id,
            Invitation.guest_id == guest_id,
            Invitation.is_deleted == False,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_event_and_guest_including_deleted(
        self, event_id: int, guest_id: int
    ) -> Invitation | None:
        query = select(Invitation).where(
            Invitation.event_id == event_id,
            Invitation.guest_id == guest_id,
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def reactivate(self, invitation_id: int, data: dict) -> Invitation | None:
        """Update a soft-deleted invitation (bypasses is_deleted filter)."""
        query = (
            sa_update(Invitation)
            .where(Invitation.id == invitation_id)
            .values(**data)
        )
        await self.db.execute(query)
        await self.db.flush()
        # Refetch with eager loading
        refetch = (
            select(Invitation)
            .options(selectinload(Invitation.guest), selectinload(Invitation.event))
            .where(Invitation.id == invitation_id)
        )
        result = await self.db.execute(refetch)
        return result.scalar_one_or_none()

    async def count_by_event(self, event_id: int) -> int:
        query = select(func.count(Invitation.id)).where(
            Invitation.event_id == event_id, Invitation.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_rsvp_summary(self, event_id: int) -> dict:
        base = (Invitation.event_id == event_id) & (Invitation.is_deleted == False)

        event_q = select(Event.name).where(Event.id == event_id)
        event_r = await self.db.execute(event_q)
        event_name = event_r.scalar() or ""

        status_q = (
            select(Invitation.status, func.count(Invitation.id))
            .where(base)
            .group_by(Invitation.status)
        )
        status_r = await self.db.execute(status_q)
        counts = {k: v for k, v in status_r.all()}

        plus_q = select(func.coalesce(func.sum(Invitation.plus_ones), 0)).where(base)
        plus_r = await self.db.execute(plus_q)
        total_plus_ones = plus_r.scalar() or 0

        confirmed = counts.get(InvitationStatus.CONFIRMED, 0)
        total_invited = sum(counts.values())

        return {
            "event_id": event_id,
            "event_name": event_name,
            "total_invited": total_invited,
            "confirmed": confirmed,
            "declined": counts.get(InvitationStatus.DECLINED, 0),
            "maybe": counts.get(InvitationStatus.MAYBE, 0),
            "pending": counts.get(InvitationStatus.PENDING, 0),
            "sent": counts.get(InvitationStatus.SENT, 0),
            "total_plus_ones": total_plus_ones,
            "total_expected_attendees": confirmed + total_plus_ones,
        }
