import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError

from app.core.config import settings


try:
    client = MongoClient(
        settings.mongodb_uri,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000,
    )
except Exception:
    client = MongoClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=5000,
    )

database = client[settings.database_name]

complaints_collection = database["complaints"]
notifications_collection = database["notifications"]
audit_collection = database["audit_logs"]
users_collection = database["users"]


def check_database_connection() -> bool:
    try:
        client.admin.command("ping")
        return True
    except (ConnectionFailure, PyMongoError, Exception):
        return False

def create_indexes():
    try:
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

        complaints_collection.create_index(
            "complaint_number",
            unique=True,
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
    except Exception as e:
        print(f"Index creation skipped/failed: {e}")

create_indexes()