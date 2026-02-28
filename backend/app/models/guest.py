from datetime import datetime

from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.enums import GuestSide, AgeGroup


class Guest(Base):
    __tablename__ = "guests"

    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    side: Mapped[str] = mapped_column(
        SAEnum(GuestSide, name="guest_side_enum", create_constraint=True),
        nullable=False,
    )
    relation_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("relation_types.id"), nullable=True, index=True
    )
    family_group_id: Mapped[int | None] = mapped_column(
        ForeignKey("family_groups.id"), nullable=True, index=True
    )
    dietary_preference_id: Mapped[int | None] = mapped_column(
        ForeignKey("dietary_preferences.id"), nullable=True, index=True
    )
    age_group: Mapped[str] = mapped_column(
        SAEnum(AgeGroup, name="age_group_enum", create_constraint=True),
        default=AgeGroup.ADULT,
        nullable=False,
    )
    number_of_persons: Mapped[int | None] = mapped_column(Integer, default=1, nullable=True)
    room_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    floor: Mapped[str | None] = mapped_column(String(50), nullable=True)
    arrival_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    departure_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_vip: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
