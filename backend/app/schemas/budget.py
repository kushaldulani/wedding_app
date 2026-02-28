from datetime import date
from decimal import Decimal

from pydantic import Field

from app.schemas.base import BaseSchema, BaseResponseSchema
from app.models.enums import PaymentMethod, PaymentStatus, GuestSide


class BudgetCategoryCreate(BaseSchema):
    category: str = Field(..., min_length=1, max_length=200)
    estimated_amount: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    notes: str | None = None


class BudgetCategoryUpdate(BaseSchema):
    category: str | None = Field(None, min_length=1, max_length=200)
    estimated_amount: Decimal | None = Field(None, ge=0, max_digits=12, decimal_places=2)
    notes: str | None = None


class BudgetCategoryResponse(BaseResponseSchema):
    category: str
    estimated_amount: Decimal
    notes: str | None


class BudgetCategoryDetailResponse(BudgetCategoryResponse):
    total_spent: Decimal
    remaining: Decimal
    expense_count: int


class ExpenseCreate(BaseSchema):
    budget_id: int | None = None
    vendor_id: int | None = None
    event_id: int | None = None
    description: str = Field(..., min_length=1, max_length=500)
    amount: Decimal = Field(..., ge=0, max_digits=12, decimal_places=2)
    payment_method: PaymentMethod
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_date: date | None = None
    receipt_url: str | None = Field(None, max_length=500)
    paid_by_user_id: int | None = None
    paid_by_name: str | None = Field(None, max_length=200)
    side: GuestSide | None = None
    notes: str | None = None


class ExpenseUpdate(BaseSchema):
    budget_id: int | None = None
    vendor_id: int | None = None
    event_id: int | None = None
    description: str | None = Field(None, min_length=1, max_length=500)
    amount: Decimal | None = Field(None, ge=0, max_digits=12, decimal_places=2)
    payment_method: PaymentMethod | None = None
    payment_status: PaymentStatus | None = None
    payment_date: date | None = None
    receipt_url: str | None = Field(None, max_length=500)
    paid_by_user_id: int | None = None
    paid_by_name: str | None = Field(None, max_length=200)
    side: GuestSide | None = None
    notes: str | None = None


class ExpenseResponse(BaseResponseSchema):
    budget_id: int | None
    vendor_id: int | None
    event_id: int | None
    description: str
    amount: Decimal
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    payment_date: date | None
    receipt_url: str | None
    paid_by_user_id: int | None
    paid_by_name: str | None
    side: GuestSide | None
    notes: str | None


class BudgetOverviewResponse(BaseSchema):
    total_estimated: Decimal
    total_spent: Decimal
    remaining: Decimal
    categories: list[BudgetCategoryDetailResponse]
    by_payment_status: dict[str, Decimal]
    by_payment_method: dict[str, Decimal]
