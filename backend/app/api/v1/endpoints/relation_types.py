from fastapi import APIRouter

from app.core.dependencies import DbSession, AdminUser, ManagerOrAdmin
from app.schemas.lookup import LookupCreate, LookupUpdate, LookupResponse
from app.schemas.common import MessageResponse
from app.services.relation_type_service import RelationTypeService

router = APIRouter(prefix="/relation-types", tags=["Relation Types"])


@router.get("", response_model=list[LookupResponse])
async def get_relation_types(db: DbSession, user: ManagerOrAdmin):
    """Get all active relation types (manager/admin)."""
    service = RelationTypeService(db)
    return await service.get_all()


@router.post("", response_model=LookupResponse, status_code=201)
async def create_relation_type(data: LookupCreate, db: DbSession, user: ManagerOrAdmin):
    """Create a new relation type (manager/admin)."""
    service = RelationTypeService(db)
    return await service.create(data)


@router.put("/{entry_id}", response_model=LookupResponse)
async def update_relation_type(entry_id: int, data: LookupUpdate, db: DbSession, user: ManagerOrAdmin):
    """Update a relation type (manager/admin)."""
    service = RelationTypeService(db)
    return await service.update(entry_id, data)


@router.delete("/{entry_id}", response_model=MessageResponse)
async def delete_relation_type(entry_id: int, db: DbSession, admin: AdminUser):
    """Delete a relation type (admin only)."""
    service = RelationTypeService(db)
    await service.delete(entry_id)
    return MessageResponse(message="Relation type deleted successfully")
