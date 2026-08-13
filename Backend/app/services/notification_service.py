from datetime import datetime, timezone

from bson import ObjectId

from app.database.mongodb import database


notifications_collection = database["notifications"]


def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    complaint_id: str | None = None,
) -> dict:

    notification = {
        "user_id": user_id,
        "complaint_id": complaint_id,
        "title": title,
        "message": message,
        "type": notification_type,
        "is_read": False,
        "created_at": datetime.now(timezone.utc),
    }

    result = notifications_collection.insert_one(
        notification
    )

    notification["id"] = str(result.inserted_id)
    notification.pop("_id", None)

    return notification


def get_notifications_for_user(
    user_id: str,
) -> list:

    notifications = []

    for notification in notifications_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1):

        notification["id"] = str(
            notification["_id"]
        )

        notification.pop("_id", None)

        notifications.append(notification)

    return notifications


def mark_notification_as_read(
    notification_id: str,
    user_id: str,
) -> dict | None:

    if not ObjectId.is_valid(notification_id):
        return None

    result = notifications_collection.update_one(
        {
            "_id": ObjectId(notification_id),
            "user_id": user_id,
        },
        {
            "$set": {
                "is_read": True,
            }
        },
    )

    if result.matched_count == 0:
        return None

    notification = notifications_collection.find_one(
        {
            "_id": ObjectId(notification_id),
            "user_id": user_id,
        }
    )

    if notification is None:
        return None

    notification["id"] = str(
        notification["_id"]
    )

    notification.pop("_id", None)

    return notification