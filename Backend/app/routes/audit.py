from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.services.audit_service import (
    get_audit_logs_for_complaint,
    get_all_audit_logs,
)
from app.services.complaint_service import get_complaint_by_id


router = APIRouter(
    prefix="/api/audit",
    tags=["Audit"],
)


@router.get("/")
def get_all_audit_logs_route(
    current_user=Depends(get_current_user),
):
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view audit logs",
        )

    logs = get_all_audit_logs()

    return {
        "count": len(logs),
        "audit_logs": logs,
    }


@router.get("/complaints/{complaint_id}")
def get_complaint_audit_logs(
    complaint_id: str,
    current_user=Depends(get_current_user),
):
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can view audit history",
        )

    complaint = get_complaint_by_id(complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Complaint not found",
        )

    logs = get_audit_logs_for_complaint(
        complaint_id
    )

    return {
        "count": len(logs),
        "audit_logs": logs,
    }