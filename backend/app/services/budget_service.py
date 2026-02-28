from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ConflictException
from app.models.budget import BudgetCategory, Expense
from app.models.enums import PaymentStatus, GuestSide
from app.repositories.budget import BudgetCategoryRepository, ExpenseRepository
from app.repositories.event import EventRepository
from app.repositories.vendor import VendorRepository
from app.repositories.user import UserRepository
from app.schemas.budget import (
    BudgetCategoryCreate, BudgetCategoryUpdate, ExpenseCreate, ExpenseUpdate,
)


class BudgetService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.budget_repo = BudgetCategoryRepository(db)
        self.expense_repo = ExpenseRepository(db)
        self.event_repo = EventRepository(db)
        self.vendor_repo = VendorRepository(db)
        self.user_repo = UserRepository(db)

    # --- Budget Categories ---

    async def get_category(self, category_id: int) -> BudgetCategory:
        cat = await self.budget_repo.get_by_id(category_id)
        if not cat:
            raise NotFoundException("Budget category not found")
        return cat

    async def get_categories(self) -> list[BudgetCategory]:
        return await self.budget_repo.get_all()

    async def create_category(self, data: BudgetCategoryCreate) -> BudgetCategory:
        if await self.budget_repo.category_exists(data.category):
            raise ConflictException("Budget category already exists")
        return await self.budget_repo.create(data.model_dump())

    async def update_category(self, category_id: int, data: BudgetCategoryUpdate) -> BudgetCategory:
        await self.get_category(category_id)
        update_data = data.model_dump(exclude_unset=True)

        if "category" in update_data:
            existing = await self.budget_repo.get_by_category_name(update_data["category"])
            if existing and existing.id != category_id:
                raise ConflictException("Budget category name already exists")

        updated = await self.budget_repo.update(category_id, update_data)
        if not updated:
            raise NotFoundException("Budget category not found")
        return updated

    async def delete_category(self, category_id: int) -> bool:
        await self.get_category(category_id)
        return await self.budget_repo.delete(category_id)

    # --- Expenses ---

    async def get_expense(self, expense_id: int) -> Expense:
        exp = await self.expense_repo.get_by_id(expense_id)
        if not exp:
            raise NotFoundException("Expense not found")
        return exp

    async def get_expenses(
        self,
        skip: int = 0,
        limit: int = 100,
        budget_id: int | None = None,
        vendor_id: int | None = None,
        event_id: int | None = None,
        payment_status: PaymentStatus | None = None,
        side: GuestSide | None = None,
        paid_by_user_id: int | None = None,
    ) -> list[Expense]:
        if budget_id:
            return await self.expense_repo.get_by_budget(budget_id, skip, limit)
        if vendor_id:
            return await self.expense_repo.get_by_vendor(vendor_id, skip, limit)
        if event_id:
            return await self.expense_repo.get_by_event(event_id, skip, limit)
        if payment_status:
            return await self.expense_repo.get_by_payment_status(payment_status, skip, limit)
        if side:
            return await self.expense_repo.get_by_side(side, skip, limit)
        if paid_by_user_id:
            return await self.expense_repo.get_by_paid_by_user(paid_by_user_id, skip, limit)
        return await self.expense_repo.get_all(skip=skip, limit=limit)

    async def create_expense(self, data: ExpenseCreate) -> Expense:
        if data.budget_id:
            cat = await self.budget_repo.get_by_id(data.budget_id)
            if not cat:
                raise NotFoundException("Budget category not found")
        if data.vendor_id:
            vendor = await self.vendor_repo.get_by_id(data.vendor_id)
            if not vendor:
                raise NotFoundException("Vendor not found")
        if data.event_id:
            event = await self.event_repo.get_by_id(data.event_id)
            if not event:
                raise NotFoundException("Event not found")
        if data.paid_by_user_id:
            user = await self.user_repo.get_by_id(data.paid_by_user_id)
            if not user:
                raise NotFoundException("Paid-by user not found")
        return await self.expense_repo.create(data.model_dump())

    async def update_expense(self, expense_id: int, data: ExpenseUpdate) -> Expense:
        await self.get_expense(expense_id)
        update_data = data.model_dump(exclude_unset=True)

        if "budget_id" in update_data and update_data["budget_id"]:
            cat = await self.budget_repo.get_by_id(update_data["budget_id"])
            if not cat:
                raise NotFoundException("Budget category not found")
        if "vendor_id" in update_data and update_data["vendor_id"]:
            vendor = await self.vendor_repo.get_by_id(update_data["vendor_id"])
            if not vendor:
                raise NotFoundException("Vendor not found")
        if "event_id" in update_data and update_data["event_id"]:
            event = await self.event_repo.get_by_id(update_data["event_id"])
            if not event:
                raise NotFoundException("Event not found")
        if "paid_by_user_id" in update_data and update_data["paid_by_user_id"]:
            user = await self.user_repo.get_by_id(update_data["paid_by_user_id"])
            if not user:
                raise NotFoundException("Paid-by user not found")

        updated = await self.expense_repo.update(expense_id, update_data)
        if not updated:
            raise NotFoundException("Expense not found")
        return updated

    async def delete_expense(self, expense_id: int) -> bool:
        await self.get_expense(expense_id)
        return await self.expense_repo.delete(expense_id)

    # --- Overview ---

    async def get_overview(self) -> dict:
        categories = await self.budget_repo.get_all()
        return await self.expense_repo.get_overview(categories)

    async def count_expenses(self) -> int:
        return await self.expense_repo.count_all()
