from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema, BaseResponseSchema
from app.models.enums import GuestSide, AgeGroup


class GuestCreate(BaseSchema):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str = Field(..., min_length=1, max_length=20)
    side: GuestSide
    relation_type_id: int | None = None
    family_group_id: int | None = None
    dietary_preference_id: int | None = None
    age_group: AgeGroup = AgeGroup.ADULT
    notes: str | None = None
    is_vip: bool = False


class GuestUpdate(BaseSchema):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(None, min_length=1, max_length=20)
    side: GuestSide | None = None
    relation_type_id: int | None = None
    family_group_id: int | None = None
    dietary_preference_id: int | None = None
    age_group: AgeGroup | None = None
    notes: str | None = None
    is_vip: bool | None = None


class GuestResponse(BaseResponseSchema):
    first_name: str
    last_name: str
    email: str | None
    phone: str
    side: GuestSide
    relation_type_id: int | None
    family_group_id: int | None
    dietary_preference_id: int | None
    age_group: AgeGroup
    notes: str | None
    is_vip: bool


class GuestSummaryResponse(BaseSchema):
    total_guests: int
    by_side: dict[str, int]
    by_dietary_preference: dict[str, int]
    by_age_group: dict[str, int]
    vip_count: int
    family_groups_count: int
