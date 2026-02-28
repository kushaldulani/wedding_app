from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import get_settings
from app.api.v1.router import router as v1_router
from app.db.session import engine
from app.db.base import Base
from app.repositories.user import UserRepository
from app.core.security import hash_password
from app.models.event_type import EventType
from app.models.vendor_category import VendorCategory
from app.models.dietary_preference import DietaryPreference
from app.models.gift_type import GiftType
from app.models.relation_type import RelationType
from app.models.family_group import FamilyGroup

settings = get_settings()

SEED_DATA = {
    EventType: [
        "Engagement", "Mehendi", "Haldi", "Sangeet",
        "Wedding Ceremony", "Reception",
    ],
    VendorCategory: [
        "Photographer", "Caterer", "Decorator", "DJ",
        "Makeup Artist", "Pandit", "Venue", "Transport",
    ],
    DietaryPreference: ["Veg", "Non-Veg", "Jain", "Vegan"],
    GiftType: ["Cash", "Gold", "Silver", "Item"],
    RelationType: [
        "Father", "Mother", "Brother", "Sister",
        "Mama", "Mausi", "Bua", "Chacha",
        "Friend", "Colleague",
    ],
    FamilyGroup: [
        "Immediate Family", "Extended Family",
        "Friends", "Colleagues", "Neighbours",
    ],
}


async def create_first_admin(engine):
    """Create first admin user if not exists."""
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        user_repo = UserRepository(session)

        admin = await user_repo.get_by_email(settings.first_admin_email)
        if not admin:
            admin_data = {
                "email": settings.first_admin_email,
                "hashed_password": hash_password(settings.first_admin_password),
                "first_name": "Admin",
                "last_name": "User",
                "role": "admin",
                "is_active": True,
            }
            await user_repo.create(admin_data)
            await session.commit()
            print(f"Created admin user: {settings.first_admin_email}")


async def seed_lookup_tables(engine):
    """Seed default lookup table entries if empty."""
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.orm import sessionmaker

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        for model, names in SEED_DATA.items():
            result = await session.execute(select(model).limit(1))
            if result.scalar_one_or_none() is not None:
                continue
            for name in names:
                session.add(model(name=name))
            await session.commit()
            print(f"Seeded {len(names)} entries into {model.__tablename__}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await create_first_admin(engine)
    await seed_lookup_tables(engine)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)


@app.get("/")
async def root():
    return {"app": settings.app_name, "version": "1.0.0", "docs": "/docs"}
