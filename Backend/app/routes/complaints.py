from fastapi import APIRouter, HTTPException, status

from app.schemas.complaint import ComplaintCreate, ComplaintUpdate
from app.services.complaint_service import (
    create_complaint,
    get_all_complaints,
    get_complaint_by_id,
    update_complaint,
    delete_complaint,
)


router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"],
)


@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_complaint(complaint: ComplaintCreate):
    created_complaint = create_complaint(
        complaint.model_dump()
    )

    return {
        "message": "Complaint created successfully",
        "complaint": created_complaint,
    }


@router.get("/")
def get_complaints():
    complaints = get_all_complaints()

    return {
        "count": len(complaints),
        "complaints": complaints,
    }


@router.get("/{complaint_id}")
def get_complaint(complaint_id: str):
    complaint = get_complaint_by_id(complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    return {
        "complaint": complaint,
    }

@router.put("/{complaint_id}")
def update_complaint_endpoint(
    complaint_id: str,
    complaint: ComplaintUpdate,
):
    updated_complaint = update_complaint(
        complaint_id,
        complaint.model_dump(exclude_unset=True),
    )

    if updated_complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    return {
        "message": "Complaint updated successfully",
        "complaint": updated_complaint,
    }


@router.delete("/{complaint_id}")
def delete_complaint_endpoint(complaint_id: str):
    deleted = delete_complaint(complaint_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    return {
        "message": "Complaint deleted successfully",
    }