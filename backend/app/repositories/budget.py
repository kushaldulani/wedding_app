from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.budget import BudgetCategory, Expense
from app.models.enums import PaymentStatus, GuestSide
from app.repositories.base import BaseRepository


class BudgetCategoryRepository(BaseRepository[BudgetCategory]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, BudgetCategory)

    async def get_by_category_name(self, name: str) -> BudgetCategory | None:
        query = select(BudgetCategory).where(
            BudgetCategory.category == name, BudgetCategory.is_deleted == False
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def category_exists(self, name: str) -> bool:
        return await self.get_by_category_name(name) is not None

    async def count_all(self) -> int:
        query = select(func.count(BudgetCategory.id)).where(BudgetCategory.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar() or 0


class ExpenseRepository(BaseRepository[Expense]):

    def __init__(self, db: AsyncSession):
        super().__init__(db, Expense)

    async def get_by_budget(
        self, budget_id: int, skip: int = 0, limit: int = 100
    ) -> list[Expense]:
        query = (
            select(Expense)
            .where(Expense.budget_id == budget_id, Expense.is_deleted == False)
            .order_by(Expense.payment_date.desc().nullslast())
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_vendor(
        self, vendor_id: int, skip: int = 0, limit: int = 100
    ) -> list[Expense]:
        query = (
            select(Expense)
            .where(Expense.vendor_id == vendor_id, Expense.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_event(
        self, event_id: int, skip: int = 0, limit: int = 100
    ) -> list[Expense]:
        query = (
            select(Expense)
            .where(Expense.event_id == event_id, Expense.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_payment_status(
        self, status: PaymentStatus, skip: int = 0, limit: int = 100
    ) -> list[Expense]:
        query = (
            select(Expense)
            .where(Expense.payment_status == status, Expense.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_side(
        self, side: GuestSide, skip: int = 0, limit: int = 100
    ) -> list[Expense]:
        query = (
            select(Expense)
            .where(Expense.side == side, Expense.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_paid_by_user(
        self, user_id: int, skip: int = 0, limit: int = 100
    ) -> list[Expense]:
        query = (
            select(Expense)
            .where(Expense.paid_by_user_id == user_id, Expense.is_deleted == False)
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_spent_by_budget(self, budget_id: int) -> Decimal:
        query = select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.budget_id == budget_id, Expense.is_deleted == False
        )
        result = await self.db.execute(query)
        return Decimal(str(result.scalar() or 0))

    async def count_all(self) -> int:
        query = select(func.count(Expense.id)).where(Expense.is_deleted == False)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_overview(self, categories: list[BudgetCategory]) -> dict:
        base = Expense.is_deleted == False

        total_estimated = Decimal(0)
        total_spent = Decimal(0)
        cat_details = []

        for cat in categories:
            spent = await self.get_spent_by_budget(cat.id)
            est = Decimal(str(cat.estimated_amount))
            total_estimated += est
            total_spent += spent

            count_q = select(func.count(Expense.id)).where(
                base, Expense.budget_id == cat.id
            )
            count_r = await self.db.execute(count_q)
            expense_count = count_r.scalar() or 0

            cat_details.append({
                "id": cat.id,
                "created_at": cat.created_at,
                "updated_at": cat.updated_at,
                "category": cat.category,
                "estimated_amount": est,
                "notes": cat.notes,
                "total_spent": spent,
                "remaining": est - spent,
                "expense_count": expense_count,
            })

        status_q = (
            select(Expense.payment_status, func.coalesce(func.sum(Expense.amount), 0))
            .where(base)
            .group_by(Expense.payment_status)
        )
        status_r = await self.db.execute(status_q)
        by_status = {k.value: Decimal(str(v)) for k, v in status_r.all()}

        method_q = (
            select(Expense.payment_method, func.coalesce(func.sum(Expense.amount), 0))
            .where(base)
            .group_by(Expense.payment_method)
        )
        method_r = await self.db.execute(method_q)
        by_method = {k.value: Decimal(str(v)) for k, v in method_r.all()}

        return {
            "total_estimated": total_estimated,
            "total_spent": total_spent,
            "remaining": total_estimated - total_spent,
            "categories": cat_details,
            "by_payment_status": by_status,
            "by_payment_method": by_method,
        }
