from datetime import date

from sqlalchemy import String, Text, Numeric, Date, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.enums import PaymentMethod, PaymentStatus, GuestSide


class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    category: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    estimated_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class Expense(Base):
    __tablename__ = "expenses"

    budget_id: Mapped[int | None] = mapped_column(
        ForeignKey("budget_categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    vendor_id: Mapped[int | None] = mapped_column(
        ForeignKey("vendors.id", ondelete="SET NULL"), nullable=True, index=True
    )
    event_id: Mapped[int | None] = mapped_column(
        ForeignKey("events.id", ondelete="SET NULL"), nullable=True, index=True
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(
        SAEnum(PaymentMethod, name="payment_method_enum", create_constraint=True),
        nullable=False,
    )
    payment_status: Mapped[str] = mapped_column(
        SAEnum(PaymentStatus, name="payment_status_enum", create_constraint=True),
        default=PaymentStatus.PENDING,
        nullable=False,
    )
    payment_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    receipt_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    paid_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    paid_by_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    side: Mapped[str | None] = mapped_column(
        SAEnum(GuestSide, name="guest_side_enum", create_constraint=False),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
