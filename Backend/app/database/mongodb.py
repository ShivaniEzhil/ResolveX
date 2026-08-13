from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from app.core.config import settings


client = MongoClient(settings.mongodb_uri)

database = client[settings.database_name]

complaints_collection = database["complaints"]
notifications_collection = database["notifications"]
audit_collection = database["audit_logs"]
users_collection = database["users"]


def check_database_connection() -> bool:
    try:
        client.admin.command("ping")
        return True
    except ConnectionFailure:
        return False

def create_indexes():
    complaints_collection.create_index(
        [("user_id", 1), ("created_at", -1)]
    )

    complaints_collection.create_index(
        [("assigned_to", 1), ("created_at", -1)]
    )

    complaints_collection.create_index(
        [("status", 1), ("created_at", -1)]
    )

    complaints_collection.create_index(
        [("priority", 1), ("created_at", -1)]
    )

    complaints_collection.create_index(
        [("department", 1), ("created_at", -1)]
    )

    notifications_collection.create_index(
        [("user_id", 1), ("is_read", 1), ("created_at", -1)]
    )

    audit_collection.create_index(
        [("complaint_id", 1), ("created_at", 1)]
    )

    audit_collection.create_index(
        [("user_id", 1), ("created_at", -1)]
    )

    users_collection.create_index(
        "email",
        unique=True,
    )
create_indexes()