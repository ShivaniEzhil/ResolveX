from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user

from app.services.notification_service import (
    get_notifications_for_user,
    mark_notification_as_read,
)


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


@router.get("/")
def get_my_notifications(
    current_user=Depends(get_current_user),
):
    notifications = get_notifications_for_user(
        current_user["id"]
    )

    return {
        "count": len(notifications),
        "notifications": notifications,
    }


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    current_user=Depends(get_current_user),
):
    notification = mark_notification_as_read(
        notification_id,
        current_user["id"],
    )

    if notification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )

    return {
        "message": "Notification marked as read",
        "notification": notification,
    }