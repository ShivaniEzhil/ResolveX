from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.services.analytics_service import (
    get_complaint_statistics,
    get_staff_workload,
    get_recent_complaints,
    get_recent_activity,
    get_resolution_metrics,
)


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


def require_admin(current_user):
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access analytics",
        )


@router.get("/complaints")
def complaint_statistics(
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    return get_complaint_statistics()


@router.get("/staff-workload")
def staff_workload(
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    return {
        "staff_workload": get_staff_workload(),
    }


@router.get("/recent-complaints")
def recent_complaints(
    limit: int = 10,
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 50",
        )

    complaints = get_recent_complaints(limit)

    return {
        "count": len(complaints),
        "complaints": complaints,
    }


@router.get("/recent-activity")
def recent_activity(
    limit: int = 10,
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 50",
        )

    activity = get_recent_activity(limit)

    return {
        "count": len(activity),
        "activity": activity,
    }

@router.get("/resolution-metrics")
def resolution_metrics(
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    return {
        "resolution_metrics": get_resolution_metrics(),
    }