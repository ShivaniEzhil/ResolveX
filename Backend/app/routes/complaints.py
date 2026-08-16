from fastapi import APIRouter, Depends, HTTPException, status

from app.services.routing_service import find_best_staff
from app.services.user_service import get_user_by_id
from app.services.audit_service import create_audit_log
from app.services.notification_service import create_notification
from app.core.dependencies import get_current_user
from app.services.ai_service import analyze_complaint
from app.schemas.complaint import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintAssignment,
    ComplaintStatusUpdate,
)
from app.services.complaint_service import (
    create_complaint,
    get_all_complaints,
    get_complaints_for_user,
    get_complaint_by_id,
    update_complaint,
    delete_complaint,
    assign_complaint,
    can_access_complaint,
    update_complaint_status,
)


router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"],
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_complaint(
    complaint: ComplaintCreate,
    current_user=Depends(get_current_user),
):
    ai_analysis = None

    try:
        ai_result = analyze_complaint(
            title=complaint.title,
            description=complaint.description,
            location=complaint.location,
        )

        ai_analysis = {
            "category": ai_result.category.value,
            "priority": ai_result.priority.value,
            "department": ai_result.department.value,
            "summary": ai_result.summary,
            "reason": ai_result.reason,
        }

    except Exception:
        # AI failure should not prevent complaint submission
        ai_analysis = None

    created_complaint = create_complaint(
        complaint.model_dump(),
        current_user["id"],
        ai_analysis,
    )
    create_audit_log(
        user_id=current_user["id"],
        complaint_id=created_complaint["id"],
        action="COMPLAINT_CREATED",
        description="Complaint created successfully",
    )
    if ai_analysis:
        staff = find_best_staff(
        ai_analysis["department"]
        )

        if staff:
            assigned_complaint = assign_complaint(
                created_complaint["id"],
                staff["id"],
            )

            if assigned_complaint:
                created_complaint = assigned_complaint

                create_notification(
                    user_id=staff["id"],
                    complaint_id=created_complaint["id"],
                    title="New Complaint Assigned",
                    message=(
                        f'A new complaint has been assigned to you: '
                        f'"{created_complaint["title"]}"'
                    ),
                    notification_type="COMPLAINT_ASSIGNED",
                )

                create_audit_log(
                    user_id=None,
                    complaint_id=created_complaint["id"],
                    action="COMPLAINT_ASSIGNED",
                    description="Complaint automatically assigned to staff",
                    metadata={
                        "assigned_to": staff["id"],
                        "assignment_type": "AUTOMATIC",
                    },
                )

    return {
        "message": "Complaint created successfully",
        "complaint": created_complaint,
    }


@router.get("/")
def get_complaints(
    status_filter: str | None = None,
    priority: str | None = None,
    category: str | None = None,
    department: str | None = None,
    search: str | None = None,
    page: int = 1,
    limit: int = 10,
    current_user=Depends(get_current_user),
):
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be greater than or equal to 1",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100",
        )

    complaints = get_complaints_for_user(
        user=current_user,
        status_filter=status_filter,
        priority=priority,
        category=category,
        department=department,
        search=search,
        page=page,
        limit=limit,
    )

    return complaints


@router.get("/{complaint_id}")
def get_complaint(
    complaint_id: str,
    current_user=Depends(get_current_user),
):
    complaint = get_complaint_by_id(complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    

    if not can_access_complaint(
        complaint,
        current_user,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this complaint",
        )

    return {
        "complaint": complaint,
    }

@router.put("/{complaint_id}")
def update_complaint_endpoint(
    complaint_id: str,
    complaint: ComplaintUpdate,
    current_user=Depends(get_current_user),
):
    existing_complaint = get_complaint_by_id(
        complaint_id
    )

    if existing_complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    if not can_access_complaint(
        existing_complaint,
        current_user,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this complaint",
        )

    updated_complaint = update_complaint(
        complaint_id,
        complaint.model_dump(exclude_unset=True),
    )

    return {
        "message": "Complaint updated successfully",
        "complaint": updated_complaint,
    }


@router.delete("/{complaint_id}")
def delete_complaint_endpoint(
    complaint_id: str,
    current_user=Depends(get_current_user),
):
    existing_complaint = get_complaint_by_id(
        complaint_id
    )

    if existing_complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    if not can_access_complaint(
        existing_complaint,
        current_user,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this complaint",
        )

    deleted = delete_complaint(complaint_id)

    return {
        "message": "Complaint deleted successfully",
    }


@router.put("/{complaint_id}/assign")
def assign_complaint_endpoint(
    complaint_id: str,
    assignment: ComplaintAssignment,
    current_user=Depends(get_current_user),
):
    # Only ADMIN can assign complaints
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can assign complaints",
        )

    # Find the complaint first
    complaint = get_complaint_by_id(complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    # Resolved complaints are closed and cannot be reassigned
    if complaint.get("status") == "RESOLVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resolved complaints cannot be reassigned",
        )

    # Find the user who should receive the complaint
    staff_user = get_user_by_id(assignment.staff_id)

    if staff_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff user not found",
        )

    # Make sure the selected user is actually STAFF
    if staff_user.get("role") != "STAFF":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint can only be assigned to a staff member",
        )

    # Make sure the staff member is active
    if not staff_user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint cannot be assigned to an inactive staff member",
        )

    # Assign the complaint
    updated_complaint = assign_complaint(
        complaint_id,
        assignment.staff_id,
    )

    if updated_complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    # Notify the assigned staff member
    create_notification(
        user_id=staff_user["id"],
        complaint_id=complaint_id,
        title="New Complaint Assigned",
        message=(
            f'A new complaint has been assigned to you: '
            f'"{updated_complaint["title"]}"'
        ),
        notification_type="COMPLAINT_ASSIGNED",
    )

    create_audit_log(
        user_id=current_user["id"],
        complaint_id=complaint_id,
        action="COMPLAINT_ASSIGNED",
        description="Complaint manually assigned by administrator",
        metadata={
            "assigned_to": assignment.staff_id,
            "assignment_type": "MANUAL",
        },
    )

    return {
        "message": "Complaint assigned successfully",
        "complaint": updated_complaint,
    }

@router.patch("/{complaint_id}/status")
def update_status(
    complaint_id: str,
    status_update: ComplaintStatusUpdate,
    current_user=Depends(get_current_user),
):
    complaint = get_complaint_by_id(complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )
    old_status = complaint.get("status")

    # Staff can only update complaints assigned to them
    if current_user["role"] == "STAFF":
        if complaint.get("assigned_to") != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update complaints assigned to you",
            )

    # Students cannot update operational status
    elif current_user["role"] == "STUDENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students cannot update complaint status",
        )

    # Admin can update any complaint

    try:
        updated_complaint = update_complaint_status(
            complaint_id,
            status_update.status,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )

    create_audit_log(
        user_id=current_user["id"],
        complaint_id=complaint_id,
        action="STATUS_CHANGED",
        description=(
            f"Complaint status changed from "
            f"{old_status} to {status_update.status}"
        ),
        metadata={
            "old_status": old_status,
            "new_status": status_update.status,
        },
    )

    # Notify the student who created the complaint
    if status_update.status == "IN_PROGRESS":
        create_notification(
            user_id=complaint["user_id"],
            complaint_id=complaint_id,
            title="Complaint In Progress",
            message=(
                f'Your complaint "{complaint["title"]}" '
                "is now being processed."
            ),
            notification_type="COMPLAINT_STATUS",
        )

    elif status_update.status == "RESOLVED":
        create_notification(
            user_id=complaint["user_id"],
            complaint_id=complaint_id,
            title="Complaint Resolved",
            message=(
                f'Your complaint "{complaint["title"]}" '
                "has been resolved."
            ),
            notification_type="COMPLAINT_STATUS",
        )

    return {
        "message": "Complaint status updated successfully",
        "complaint": updated_complaint,
    }