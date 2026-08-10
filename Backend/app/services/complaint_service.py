from datetime import datetime, timezone

from bson import ObjectId

from app.database.mongodb import database


complaints_collection = database["complaints"]


def create_complaint(
    complaint_data: dict,
    user_id: str,
) -> dict:
    now = datetime.now(timezone.utc)

    complaint = {
        **complaint_data,
        "user_id": user_id,
        "status": "SUBMITTED",
        "priority": "PENDING",
        "category": "PENDING",
        "department": "PENDING",
        "created_at": now,
        "updated_at": now,
    }

    result = complaints_collection.insert_one(complaint)

    complaint["id"] = str(result.inserted_id)
    complaint.pop("_id", None)

    return complaint


def get_all_complaints() -> list:
    complaints = []

    for complaint in complaints_collection.find().sort("created_at", -1):
        complaint["id"] = str(complaint["_id"])
        complaint.pop("_id", None)
        complaints.append(complaint)

    return complaints


def get_complaint_by_id(complaint_id: str) -> dict | None:
    if not ObjectId.is_valid(complaint_id):
        return None

    complaint = complaints_collection.find_one(
        {"_id": ObjectId(complaint_id)}
    )

    if complaint is None:
        return None

    complaint["id"] = str(complaint["_id"])
    complaint.pop("_id", None)

    return complaint

def update_complaint(
    complaint_id: str,
    update_data: dict,
) -> dict | None:

    if not ObjectId.is_valid(complaint_id):
        return None

    update_data = {
        key: value
        for key, value in update_data.items()
        if value is not None
    }

    if not update_data:
        return get_complaint_by_id(complaint_id)

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {"$set": update_data},
    )

    if result.matched_count == 0:
        return None

    return get_complaint_by_id(complaint_id)


def delete_complaint(complaint_id: str) -> bool:

    if not ObjectId.is_valid(complaint_id):
        return False

    result = complaints_collection.delete_one(
        {"_id": ObjectId(complaint_id)}
    )

    return result.deleted_count > 0

def get_complaints_for_user(user: dict) -> list:
    role = user["role"]

    if role == "ADMIN":
        query = {}

    elif role == "STAFF":
        query = {
            "assigned_to": user["id"]
        }

    else:
        query = {
            "user_id": user["id"]
        }

    complaints = []

    for complaint in complaints_collection.find(query).sort(
        "created_at",
        -1,
    ):
        complaint["id"] = str(complaint["_id"])
        complaint.pop("_id", None)

        complaints.append(complaint)

    return complaints

def can_access_complaint(
    complaint: dict,
    user: dict,
) -> bool:

    role = user["role"]

    # Admin can access everything
    if role == "ADMIN":
        return True

    # Student can access only their own complaint
    if role == "STUDENT":
        return complaint.get("user_id") == user["id"]

    # Staff can access complaints assigned to them
    if role == "STAFF":
        return complaint.get("assigned_to") == user["id"]

    return False