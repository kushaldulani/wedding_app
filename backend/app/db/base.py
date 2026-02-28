from app.models.base import Base

# Import all models here for Alembic discovery
from app.models.user import User

# Lookup tables
from app.models.event_type import EventType
from app.models.vendor_category import VendorCategory
from app.models.dietary_preference import DietaryPreference
from app.models.gift_type import GiftType
from app.models.relation_type import RelationType
from app.models.family_group import FamilyGroup

# Wedding modules
from app.models.event import Event
from app.models.guest import Guest
from app.models.invitation import Invitation
from app.models.vendor import Vendor
from app.models.budget import BudgetCategory, Expense
from app.models.task import Task
from app.models.gift import Gift
from app.models.vendor_service import VendorServiceItem
from app.models.media_attachment import MediaAttachment
