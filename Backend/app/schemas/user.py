from pydantic import BaseModel, Field


class UserRoleUpdate(BaseModel):
    role: str = Field(
        ...,
        pattern="^(STUDENT|STAFF)$",
    )


class UserStatusUpdate(BaseModel):
    is_active: bool


class UserDepartmentUpdate(BaseModel):
    department: str = Field(
        ...,
        pattern="^(ACADEMICS|HOSTEL|TRANSPORT|IT|ELECTRICAL|MAINTENANCE|SECURITY|ADMINISTRATION)$",
    )