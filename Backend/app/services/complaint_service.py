from datetime import datetime, timezone
from bson import ObjectId
from pymongo import ReturnDocument

from app.database.mongodb import database
from app.services.user_service import get_user_by_id


complaints_collection = database["complaints"]
complaint_counters_collection = database["complaint_counters"]

def get_next_complaint_number() -> str:
    result = complaint_counters_collection.find_one_and_update(
        {"_id": "complaint_number"},
        {
            "$inc": {
                "sequence": 1,
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    sequence = result["sequence"]

    return f"CMP-{sequence:04d}"


def create_complaint(
    complaint_data: dict,
    user_id: str,
    ai_analysis: dict | None = None,
) -> dict:
    now = datetime.now(timezone.utc)

    complaint_number = get_next_complaint_number()

    complaint = {
        **complaint_data,
        "complaint_number": complaint_number,
        "user_id": user_id,
        "status": "SUBMITTED",
        "priority": (
            ai_analysis["priority"]
            if ai_analysis
            else "PENDING"
        ),
        "category": (
            ai_analysis["category"]
            if ai_analysis
            else "PENDING"
        ),
        "department": (
            ai_analysis["department"]
            if ai_analysis
            else "PENDING"
        ),
        "created_at": now,
        "updated_at": now,
    }
    if ai_analysis:
        complaint["ai_summary"] = ai_analysis["summary"]
        complaint["ai_reason"] = ai_analysis["reason"]

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

    # Add assigned staff name for frontend display
    assigned_staff_id = complaint.get("assigned_to")

    if assigned_staff_id:
        staff_user = get_user_by_id(assigned_staff_id)

        if staff_user:
            complaint["assignedStaffName"] = staff_user.get(
                "name",
                "Staff Member",
            )
        else:
            complaint["assignedStaffName"] = "Staff Member"

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

def get_complaints_for_user(
    user: dict,
    status_filter: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    department: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
) -> dict:

    role = user["role"]

    # Base query based on RBAC
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

    # Apply optional filters
    if status_filter:
        query["status"] = status_filter

    if priority:
        query["priority"] = priority

    if category:
        query["category"] = category

    if department:
        query["department"] = department

    # Search title and description
    if search:
        query["$or"] = [
            {
                "title": {
                    "$regex": search,
                    "$options": "i",
                }
            },
            {
                "description": {
                    "$regex": search,
                    "$options": "i",
                }
            },
            {
                "complaint_number": {
                    "$regex": search,
                    "$options": "i",
                }
            },
        ]

    # Count before pagination
    total = complaints_collection.count_documents(query)

    # Pagination
    skip = (page - 1) * limit

    complaints = []

    cursor = (
        complaints_collection
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    for complaint in cursor:
        complaint["id"] = str(complaint["_id"])
        complaint.pop("_id", None)

        # Add assigned staff name for frontend display
        assigned_staff_id = complaint.get("assigned_to")

        if assigned_staff_id:
            staff_user = get_user_by_id(assigned_staff_id)

            if staff_user:
                complaint["assignedStaffName"] = staff_user.get(
                    "name",
                    "Staff Member",
                )
            else:
                complaint["assignedStaffName"] = "Staff Member"

        complaints.append(complaint)

    total_pages = (
        (total + limit - 1) // limit
        if total > 0
        else 0
    )

    return {
        "count": len(complaints),
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "complaints": complaints,
    }

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

def assign_complaint(
    complaint_id: str,
    staff_id: str,
) -> dict | None:

    if not ObjectId.is_valid(complaint_id):
        return None

    complaint = complaints_collection.find_one(
        {"_id": ObjectId(complaint_id)}
    )

    if complaint is None:
        return None

    # Resolved complaints are closed and cannot be reassigned
    if complaint.get("status") == "RESOLVED":
        raise ValueError(
            "Resolved complaints cannot be reassigned"
        )

    result = complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {
                "assigned_to": staff_id,
                "status": "ASSIGNED",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    if result.matched_count == 0:
        return None

    return get_complaint_by_id(complaint_id)

def update_complaint_status(
    complaint_id: str,
    new_status: str,
) -> dict | None:

    if not ObjectId.is_valid(complaint_id):
        return None

    complaint = complaints_collection.find_one(
        {"_id": ObjectId(complaint_id)}
    )

    if complaint is None:
        return None

    current_status = complaint.get("status")

    allowed_transitions = {
        "ASSIGNED": ["IN_PROGRESS"],
        "IN_PROGRESS": ["RESOLVED"],
        "RESOLVED": [],
    }

    if new_status not in allowed_transitions.get(current_status, []):
        raise ValueError(
            f"Invalid status transition: "
            f"{current_status} -> {new_status}"
        )

    complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {
            "$set": {
                "status": new_status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return get_complaint_by_id(complaint_id)