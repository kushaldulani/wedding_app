from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema, BaseResponseSchema


class UserCreate(BaseSchema):
    """Schema for creating a user (admin use)."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    role: str = Field(default="user", pattern="^(admin|manager|user|guest)$")
    is_active: bool = True


class UserUpdate(BaseSchema):
    """Schema for updating a user."""

    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)
    is_active: bool | None = None


class UserUpdateAdmin(UserUpdate):
    """Schema for admin updating a user (includes role)."""

    role: str | None = Field(None, pattern="^(admin|manager|user|guest)$")


class PasswordUpdate(BaseSchema):
    """Schema for password change."""

    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)


class UserResponse(BaseResponseSchema):
    """Schema for user response."""

    email: EmailStr
    first_name: str | None
    last_name: str | None
    role: str
    is_active: bool
