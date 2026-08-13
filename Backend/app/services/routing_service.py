from app.database.mongodb import database


users_collection = database["users"]
complaints_collection = database["complaints"]


ACTIVE_COMPLAINT_STATUSES = [
    "ASSIGNED",
    "IN_PROGRESS",
]


def find_best_staff(department: str) -> dict | None:
    """
    Find an active staff member belonging to the requested department.

    The staff member with the fewest active complaints is selected.
    """

    staff_members = list(
        users_collection.find(
            {
                "role": "STAFF",
                "is_active": True,
                "department": department,
            }
        )
    )

    if not staff_members:
        return None

    best_staff = None
    lowest_workload = None

    for staff in staff_members:
        staff_id = str(staff["_id"])

        workload = complaints_collection.count_documents(
            {
                "assigned_to": staff_id,
                "status": {
                    "$in": ACTIVE_COMPLAINT_STATUSES,
                },
            }
        )

        if (
            lowest_workload is None
            or workload < lowest_workload
        ):
            best_staff = staff
            lowest_workload = workload

    if best_staff is None:
        return None

    best_staff["id"] = str(best_staff["_id"])
    best_staff.pop("_id", None)
    best_staff.pop("password_hash", None)

    best_staff["active_complaints"] = lowest_workload

    return best_staff