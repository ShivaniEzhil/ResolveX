from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.schemas.response import ComplaintResponseCreate
from app.services.audit_service import create_audit_log
from app.services.notification_service import create_notification
from app.services.complaint_service import (
    get_complaint_by_id,
    can_access_complaint,
)
from app.services.response_service import (
    create_response,
    get_responses_for_complaint,
)


router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaint Responses"],
)


@router.post(
    "/{complaint_id}/responses",
    status_code=status.HTTP_201_CREATED,
)
def add_complaint_response(
    complaint_id: str,
    response_data: ComplaintResponseCreate,
    current_user=Depends(get_current_user),
):
    complaint = get_complaint_by_id(complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    # Students cannot create staff responses
    if current_user["role"] == "STUDENT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Students cannot add complaint responses",
        )

    # Staff can respond only to complaints assigned to them
    if current_user["role"] == "STAFF":
        if complaint.get("assigned_to") != current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only respond to complaints assigned to you",
            )

    created_response = create_response(
        complaint_id=complaint_id,
        user_id=current_user["id"],
        message=response_data.message,
    )

    create_audit_log(
        user_id=current_user["id"],
        complaint_id=complaint_id,
        action="RESPONSE_ADDED",
        description="A response was added to the complaint",
        metadata={
            "response_id": created_response["id"],
        },
    )

    create_notification(
        user_id=complaint["user_id"],
        complaint_id=complaint_id,
        title="New Complaint Response",
        message=(
            f'You have received a new response for '
            f'your complaint "{complaint["title"]}".'
        ),
        notification_type="COMPLAINT_RESPONSE",
    )

    return {
        "message": "Complaint response added successfully",
        "response": created_response,
    }


@router.get("/{complaint_id}/responses")
def get_complaint_responses(
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
            detail="You do not have permission to view these responses",
        )

    responses = get_responses_for_complaint(
        complaint_id
    )

    return {
        "count": len(responses),
        "responses": responses,
    }