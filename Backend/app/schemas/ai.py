from enum import Enum

from pydantic import BaseModel, Field


class ComplaintCategory(str, Enum):
    ACADEMIC = "ACADEMIC"
    HOSTEL = "HOSTEL"
    TRANSPORT = "TRANSPORT"
    NETWORK = "NETWORK"
    ELECTRICAL = "ELECTRICAL"
    CLEANLINESS = "CLEANLINESS"
    SECURITY = "SECURITY"
    FACILITIES = "FACILITIES"
    TECHNICAL = "TECHNICAL"
    OTHER = "OTHER"


class ComplaintPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ComplaintDepartment(str, Enum):
    ACADEMICS = "ACADEMICS"
    HOSTEL = "HOSTEL"
    TRANSPORT = "TRANSPORT"
    IT = "IT"
    ELECTRICAL = "ELECTRICAL"
    MAINTENANCE = "MAINTENANCE"
    SECURITY = "SECURITY"
    ADMINISTRATION = "ADMINISTRATION"


class ComplaintAIAnalysis(BaseModel):
    category: ComplaintCategory
    priority: ComplaintPriority
    department: ComplaintDepartment

    summary: str = Field(
        min_length=10,
        max_length=300,
    )

    reason: str = Field(
        min_length=10,
        max_length=500,
    )