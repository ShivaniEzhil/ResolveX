from pydantic import BaseModel, Field


class UserRoleUpdate(BaseModel):
    role: str = Field(
        ...,
        pattern="^(STUDENT|STAFF)$",
    )


class UserStatusUpdate(BaseModel):
    is_active: bool