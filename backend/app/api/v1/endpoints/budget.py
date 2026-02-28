from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.models.enums import PaymentStatus, GuestSide
from app.repositories.budget import BudgetCategoryRepository
from app.repositories.vendor import VendorRepository
from app.repositories.event import EventRepository
from app.repositories.user import UserRepository
from app.schemas.budget import (
    BudgetCategoryCreate, BudgetCategoryUpdate, BudgetCategoryResponse,
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, BudgetOverviewResponse,
)
from app.schemas.common import MessageResponse, PaginatedResponse
from app.services.budget_service import BudgetService
from app.utils.excel import generate_excel

router = APIRouter(prefix="/budget", tags=["Budget & Expenses"])


# --- Budget Categories ---

@router.get("/categories", response_model=list[BudgetCategoryResponse])
async def get_budget_categories(db: DbSession, user: ManagerOrAdmin):
    """Get all budget categories."""
    service = BudgetService(db)
    return await service.get_categories()


@router.get("/overview", response_model=BudgetOverviewResponse)
async def get_budget_overview(db: DbSession, user: ManagerOrAdmin):
    """Get full budget vs actual overview."""
    service = BudgetService(db)
    return await service.get_overview()


CATEGORY_EXPORT_COLUMNS = [
    ("category", "Category"),
    ("estimated_amount", "Estimated Amount"),
    ("notes", "Notes"),
    ("created_at", "Created At"),
]


@router.get("/categories/export")
async def export_budget_categories(db: DbSession, user: ManagerOrAdmin):
    """Export budget categories to Excel (manager/admin)."""
    service = BudgetService(db)
    items = await service.get_categories()
    buffer = generate_excel(items, CATEGORY_EXPORT_COLUMNS, "Budget Categories")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=budget_categories.xlsx"},
    )


@router.get("/categories/{category_id}", response_model=BudgetCategoryResponse)
async def get_budget_category(category_id: int, db: DbSession, user: ManagerOrAdmin):
    """Get budget category by ID."""
    service = BudgetService(db)
    return await service.get_category(category_id)


@router.post("/categories", response_model=BudgetCategoryResponse, status_code=201)
async def create_budget_category(data: BudgetCategoryCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a budget category (manager/admin)."""
    service = BudgetService(db)
    return await service.create_category(data)


@router.put("/categories/{category_id}", response_model=BudgetCategoryResponse)
async def update_budget_category(
    category_id: int, data: BudgetCategoryUpdate, db: DbSession, user: ManagerOrAdmin
):
    """Update a budget category (manager/admin)."""
    service = BudgetService(db)
    return await service.update_category(category_id, data)


@router.delete("/categories/{category_id}", response_model=MessageResponse)
async def delete_budget_category(category_id: int, db: DbSession, admin: AdminUser):
    """Delete a budget category (admin only)."""
    service = BudgetService(db)
    await service.delete_category(category_id)
    return MessageResponse(message="Budget category deleted successfully")


# --- Expenses ---

@router.get("/expenses", response_model=PaginatedResponse[ExpenseResponse])
async def get_expenses(
    db: DbSession,
    user: ManagerOrAdmin,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    budget_id: int | None = None,
    vendor_id: int | None = None,
    event_id: int | None = None,
    payment_status: PaymentStatus | None = None,
    side: GuestSide | None = None,
    paid_by_user_id: int | None = None,
):
    """Get all expenses with optional filters."""
    service = BudgetService(db)
    skip = (page - 1) * page_size
    items = await service.get_expenses(
        skip=skip, limit=page_size, budget_id=budget_id,
        vendor_id=vendor_id, event_id=event_id, payment_status=payment_status,
        side=side, paid_by_user_id=paid_by_user_id,
    )
    total = await service.count_expenses()
    return PaginatedResponse(
        items=items, total=total, page=page, page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/expenses/export")
async def export_expenses(
    db: DbSession,
    user: ManagerOrAdmin,
    budget_id: int | None = None,
    vendor_id: int | None = None,
    event_id: int | None = None,
    payment_status: PaymentStatus | None = None,
    side: GuestSide | None = None,
    paid_by_user_id: int | None = None,
):
    """Export expenses to Excel (manager/admin)."""
    service = BudgetService(db)
    items = await service.get_expenses(
        skip=0, limit=10000, budget_id=budget_id,
        vendor_id=vendor_id, event_id=event_id, payment_status=payment_status,
        side=side, paid_by_user_id=paid_by_user_id,
    )

    categories = await BudgetCategoryRepository(db).get_all(limit=10000)
    vendors = await VendorRepository(db).get_all(limit=10000)
    events = await EventRepository(db).get_all(limit=10000)
    users = await UserRepository(db).get_all(limit=10000)
    cat_map = {c.id: c.category for c in categories}
    vendor_map = {v.id: v.name for v in vendors}
    event_map = {e.id: e.name for e in events}
    user_map = {u.id: f"{u.first_name} {u.last_name}" for u in users}

    def paid_by(exp):
        if exp.paid_by_user_id:
            return user_map.get(exp.paid_by_user_id, "")
        return exp.paid_by_name or ""

    columns = [
        (lambda exp: cat_map.get(exp.budget_id, ""), "Budget Category"),
        (lambda exp: vendor_map.get(exp.vendor_id, ""), "Vendor"),
        (lambda exp: event_map.get(exp.event_id, ""), "Event"),
        ("description", "Description"),
        ("amount", "Amount"),
        ("payment_method", "Payment Method"),
        ("payment_status", "Payment Status"),
        ("payment_date", "Payment Date"),
        (paid_by, "Paid By"),
        ("side", "Side"),
        ("receipt_url", "Receipt URL"),
        ("notes", "Notes"),
        ("created_at", "Created At"),
    ]

    buffer = generate_excel(items, columns, "Expenses")
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=expenses.xlsx"},
    )


@router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: int, db: DbSession, user: ManagerOrAdmin):
    """Get expense by ID."""
    service = BudgetService(db)
    return await service.get_expense(expense_id)


@router.post("/expenses", response_model=ExpenseResponse, status_code=201)
async def create_expense(data: ExpenseCreate, db: DbSession, user: ManagerOrAdmin):
    """Create an expense (manager/admin)."""
    service = BudgetService(db)
    return await service.create_expense(data)


@router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int, data: ExpenseUpdate, db: DbSession, user: ManagerOrAdmin
):
    """Update an expense (manager/admin)."""
    service = BudgetService(db)
    return await service.update_expense(expense_id, data)


@router.delete("/expenses/{expense_id}", response_model=MessageResponse)
async def delete_expense(expense_id: int, db: DbSession, admin: AdminUser):
    """Delete an expense (admin only)."""
    service = BudgetService(db)
    await service.delete_expense(expense_id)
    return MessageResponse(message="Expense deleted successfully")
