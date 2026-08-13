from pydantic import BaseModel, Field


class ComplaintResponseCreate(BaseModel):
    message: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Response or update regarding the complaint",
    )