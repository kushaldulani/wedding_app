from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.core.exceptions import NotFoundException, ConflictException, BadRequestException
from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserUpdateAdmin, PasswordUpdate
from app.models.user import User


class UserService:
    """Service for user operations."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_user(self, user_id: int) -> User:
        """Get user by ID."""
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return user

    async def get_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users."""
        return await self.user_repo.get_all(skip=skip, limit=limit)

    async def create_user(self, data: UserCreate) -> User:
        """Create a new user (admin use)."""
        if await self.user_repo.email_exists(data.email):
            raise ConflictException("Email already registered")

        user_data = {
            "email": data.email,
            "hashed_password": hash_password(data.password),
            "first_name": data.first_name,
            "last_name": data.last_name,
            "role": data.role,
            "is_active": data.is_active,
        }
        return await self.user_repo.create(user_data)

    async def update_user(self, user_id: int, data: UserUpdate) -> User:
        """Update user (self-update)."""
        user = await self.get_user(user_id)

        update_data = data.model_dump(exclude_unset=True)
        updated_user = await self.user_repo.update(user.id, update_data)
        if not updated_user:
            raise NotFoundException("User not found")
        return updated_user

    async def update_user_admin(self, user_id: int, data: UserUpdateAdmin) -> User:
        """Update user (admin - can change role)."""
        user = await self.get_user(user_id)

        update_data = data.model_dump(exclude_unset=True)
        updated_user = await self.user_repo.update(user.id, update_data)
        if not updated_user:
            raise NotFoundException("User not found")
        return updated_user

    async def update_password(self, user_id: int, data: PasswordUpdate) -> User:
        """Update user password."""
        user = await self.get_user(user_id)

        if not verify_password(data.current_password, user.hashed_password):
            raise BadRequestException("Current password is incorrect")

        update_data = {"hashed_password": hash_password(data.new_password)}
        updated_user = await self.user_repo.update(user.id, update_data)
        if not updated_user:
            raise NotFoundException("User not found")
        return updated_user

    async def delete_user(self, user_id: int) -> bool:
        """Soft delete a user."""
        user = await self.get_user(user_id)
        return await self.user_repo.delete(user.id)
