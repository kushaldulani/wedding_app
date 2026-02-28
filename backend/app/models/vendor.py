from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Vendor(Base):
    __tablename__ = "vendors"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    vendor_category_id: Mapped[int] = mapped_column(
        ForeignKey("vendor_categories.id"), nullable=False, index=True
    )
    contact_person: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_booked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
