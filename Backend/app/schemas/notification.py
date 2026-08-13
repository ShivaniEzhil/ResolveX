from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    complaint_id: str | None = None
    title: str
    message: str
    type: str
    is_read: bool
    created_at: str