from fastapi import APIRouter, Depends, HTTPException, status
from app.services.user_service import get_user_by_id
from app.core.dependencies import get_current_user
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
    created_complaint = create_complaint(
        complaint.model_dump(),
        current_user["id"],
    )

    return {
        "message": "Complaint created successfully",
        "complaint": created_complaint,
    }


@router.get("/")
def get_complaints(
    current_user=Depends(get_current_user),
):
    complaints = get_complaints_for_user(current_user)

    return {
        "count": len(complaints),
        "complaints": complaints,
    }


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

    return {
        "message": "Complaint status updated successfully",
        "complaint": updated_complaint,
    }