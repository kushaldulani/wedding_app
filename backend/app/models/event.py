from datetime import date, time

from sqlalchemy import String, Text, Date, Time, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.enums import EventStatus


class Event(Base):
    __tablename__ = "events"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    event_type_id: Mapped[int] = mapped_column(
        ForeignKey("event_types.id"), nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    venue_name: Mapped[str | None] = mapped_column(String(300), nullable=True)
    venue_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    end_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum(EventStatus, name="event_status_enum", create_constraint=True),
        default=EventStatus.UPCOMING,
        nullable=False,
    )
