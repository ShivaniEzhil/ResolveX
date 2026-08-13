from app.database.mongodb import (
    complaints_collection,
    users_collection,
    audit_collection,
)

from datetime import datetime, timezone

def get_complaint_statistics() -> dict:
    total = complaints_collection.count_documents({})

    submitted = complaints_collection.count_documents({
        "status": "SUBMITTED"
    })

    assigned = complaints_collection.count_documents({
        "status": "ASSIGNED"
    })

    in_progress = complaints_collection.count_documents({
        "status": "IN_PROGRESS"
    })

    resolved = complaints_collection.count_documents({
        "status": "RESOLVED"
    })

    priority_distribution = {}

    for result in complaints_collection.aggregate([
        {
            "$group": {
                "_id": "$priority",
                "count": {"$sum": 1},
            }
        }
    ]):
        priority_distribution[result["_id"]] = result["count"]

    department_distribution = {}

    for result in complaints_collection.aggregate([
        {
            "$group": {
                "_id": "$department",
                "count": {"$sum": 1},
            }
        }
    ]):
        department_distribution[result["_id"]] = result["count"]

    category_distribution = {}

    for result in complaints_collection.aggregate([
        {
            "$group": {
                "_id": "$category",
                "count": {"$sum": 1},
            }
        }
    ]):
        category_distribution[result["_id"]] = result["count"]

    return {
        "summary": {
            "total": total,
            "submitted": submitted,
            "assigned": assigned,
            "in_progress": in_progress,
            "resolved": resolved,
        },
        "by_priority": priority_distribution,
        "by_department": department_distribution,
        "by_category": category_distribution,
    }

def get_staff_workload() -> list:
    staff_users = list(
        users_collection.find(
            {
                "role": "STAFF",
                "is_active": True,
            }
        )
    )

    workload = []

    for staff in staff_users:
        staff_id = str(staff["_id"])

        assigned = complaints_collection.count_documents({
            "assigned_to": staff_id,
            "status": "ASSIGNED",
        })

        in_progress = complaints_collection.count_documents({
            "assigned_to": staff_id,
            "status": "IN_PROGRESS",
        })

        resolved = complaints_collection.count_documents({
            "assigned_to": staff_id,
            "status": "RESOLVED",
        })

        workload.append({
            "staff_id": staff_id,
            "name": staff["name"],
            "department": staff.get("department"),
            "assigned": assigned,
            "in_progress": in_progress,
            "resolved": resolved,
            "active_workload": assigned + in_progress,
        })

    return workload

def get_recent_complaints(limit: int = 10) -> list:
    complaints = []

    cursor = (
        complaints_collection
        .find()
        .sort("created_at", -1)
        .limit(limit)
    )

    for complaint in cursor:
        complaint["id"] = str(complaint["_id"])
        complaint.pop("_id", None)

        complaints.append(complaint)

    return complaints

def get_recent_activity(limit: int = 10) -> list:
    activity = []

    cursor = (
        audit_collection
        .find()
        .sort("created_at", -1)
        .limit(limit)
    )

    for event in cursor:
        event["id"] = str(event["_id"])
        event.pop("_id", None)

        activity.append(event)

    return activity


def get_resolution_metrics() -> dict:
    resolved_complaints = list(
        complaints_collection.find(
            {
                "status": "RESOLVED",
                "created_at": {"$exists": True},
                "updated_at": {"$exists": True},
            },
            {
                "created_at": 1,
                "updated_at": 1,
            },
        )
    )

    total_resolved = len(resolved_complaints)

    total_complaints = complaints_collection.count_documents({})

    unresolved = total_complaints - total_resolved

    if total_resolved == 0:
        average_resolution_hours = 0
    else:
        total_seconds = 0

        for complaint in resolved_complaints:
            created_at = complaint["created_at"]
            resolved_at = complaint["updated_at"]

            total_seconds += (
                resolved_at - created_at
            ).total_seconds()

        average_resolution_hours = (
            total_seconds / total_resolved / 3600
        )

    return {
        "resolved_count": total_resolved,
        "unresolved_count": unresolved,
        "average_resolution_hours": round(
            average_resolution_hours,
            2,
        ),
    }