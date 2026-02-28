from fastapi import APIRouter, Query

from app.core.dependencies import DbSession, CurrentUser, AdminUser
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserUpdateAdmin,
    PasswordUpdate,
    UserResponse,
)
from app.schemas.common import MessageResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


# ============ Admin Endpoints ============

@router.get("", response_model=list[UserResponse])
async def get_users(
    db: DbSession,
    admin: AdminUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
):
    """Get all users (admin only)."""
    service = UserService(db)
    return await service.get_users(skip=skip, limit=limit)


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(data: UserCreate, db: DbSession, admin: AdminUser):
    """Create a new user (admin only)."""
    service = UserService(db)
    return await service.create_user(data)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: DbSession, admin: AdminUser):
    """Get user by ID (admin only)."""
    service = UserService(db)
    return await service.get_user(user_id)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: int,
    data: UserUpdateAdmin,
    db: DbSession,
    admin: AdminUser,
):
    """Update user (admin only - can change role)."""
    service = UserService(db)
    return await service.update_user_admin(user_id, data)


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(user_id: int, db: DbSession, admin: AdminUser):
    """Delete user (admin only)."""
    service = UserService(db)
    await service.delete_user(user_id)
    return MessageResponse(message="User deleted successfully")


# ============ User Self-Service Endpoints ============

@router.put("/me/profile", response_model=UserResponse)
async def update_my_profile(data: UserUpdate, db: DbSession, current_user: CurrentUser):
    """Update current user's profile."""
    service = UserService(db)
    return await service.update_user(current_user.id, data)


@router.put("/me/password", response_model=MessageResponse)
async def update_my_password(
    data: PasswordUpdate,
    db: DbSession,
    current_user: CurrentUser,
):
    """Update current user's password."""
    service = UserService(db)
    await service.update_password(current_user.id, data)
    return MessageResponse(message="Password updated successfully")
