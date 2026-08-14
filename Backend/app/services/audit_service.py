from datetime import datetime, timezone

from app.database.mongodb import database


audit_collection = database["audit_logs"]


def create_audit_log(
    user_id: str | None,
    action: str,
    description: str,
    complaint_id: str | None = None,
    metadata: dict | None = None,
) -> dict:

    audit_log = {
        "user_id": user_id,
        "complaint_id": complaint_id,
        "action": action,
        "description": description,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc),
    }

    result = audit_collection.insert_one(audit_log)

    audit_log["id"] = str(result.inserted_id)
    audit_log.pop("_id", None)

    return audit_log


def get_audit_logs_for_complaint(
    complaint_id: str,
) -> list:

    logs = []

    for log in audit_collection.find(
        {"complaint_id": complaint_id}
    ).sort("created_at", 1):

        log["id"] = str(log["_id"])
        log.pop("_id", None)

        logs.append(log)

    return logs


def get_all_audit_logs() -> list:
    logs = []

    for log in audit_collection.find().sort(
        "created_at",
        -1,
    ):
        log["id"] = str(log["_id"])
        log.pop("_id", None)

        logs.append(log)

    return logs