from pydantic import BaseModel, Field


class ComplaintCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=5,
        max_length=150,
        description="Short title describing the complaint",
    )

    description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Detailed description of the complaint",
    )

    location: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Location where the issue occurred",
    )

class ComplaintUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=5,
        max_length=150,
    )

    description: str | None = Field(
        default=None,
        min_length=10,
        max_length=2000,
    )

    location: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )

    status: str | None = None
    priority: str | None = None
    category: str | None = None
    department: str | None = None