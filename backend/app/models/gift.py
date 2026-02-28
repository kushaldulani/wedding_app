from datetime import date

from sqlalchemy import String, Text, Date, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Gift(Base):
    __tablename__ = "gifts"

    guest_id: Mapped[int] = mapped_column(
        ForeignKey("guests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    gift_type_id: Mapped[int] = mapped_column(
        ForeignKey("gift_types.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimated_value: Mapped[float | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    received_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    thank_you_sent: Mapped[bool] = mapped_column(default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
