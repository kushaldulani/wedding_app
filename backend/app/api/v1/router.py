from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    event_types,
    vendor_categories,
    dietary_preferences,
    gift_types,
    relation_types,
    family_groups,
    events,
    guests,
    invitations,
    vendors,
    budget,
    tasks,
    gifts,
    vendor_services,
    media_attachments,
)

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(event_types.router)
router.include_router(vendor_categories.router)
router.include_router(dietary_preferences.router)
router.include_router(gift_types.router)
router.include_router(relation_types.router)
router.include_router(family_groups.router)
router.include_router(events.router)
router.include_router(guests.router)
router.include_router(invitations.router)
router.include_router(vendors.router)
router.include_router(budget.router)
router.include_router(tasks.router)
router.include_router(gifts.router)
router.include_router(vendor_services.router)
router.include_router(media_attachments.router)
