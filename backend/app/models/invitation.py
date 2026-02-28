from sqlalchemy import Integer, Text, ForeignKey, UniqueConstraint, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import InvitationStatus


class Invitation(Base):
    __tablename__ = "invitations"
    __table_args__ = (
        UniqueConstraint("guest_id", "event_id", name="uq_guest_event"),
    )

    guest_id: Mapped[int] = mapped_column(
        ForeignKey("guests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(
        SAEnum(InvitationStatus, name="invitation_status_enum", create_constraint=True),
        default=InvitationStatus.PENDING,
        nullable=False,
    )
    plus_ones: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    guest = relationship("Guest", lazy="noload")
    event = relationship("Event", lazy="noload")
