from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema


class RegisterRequest(BaseSchema):
    """Schema for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    first_name: str | None = Field(None, max_length=100)
    last_name: str | None = Field(None, max_length=100)


class LoginRequest(BaseSchema):
    """Schema for user login."""

    email: EmailStr
    password: str


class TokenResponse(BaseSchema):
    """Schema for token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseSchema):
    """Schema for token refresh."""

    refresh_token: str
