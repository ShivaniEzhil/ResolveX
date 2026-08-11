from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user

from app.schemas.user import (
    UserRoleUpdate,
    UserStatusUpdate,
)

from app.services.user_service import (
    get_all_users,
    get_user_by_id,
    update_user_role,
    update_user_status,
)


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


def require_admin(current_user):
    if current_user["role"] != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can manage users",
        )


@router.get("/")
def list_users(
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    users = get_all_users()

    return {
        "count": len(users),
        "users": users,
    }


@router.get("/{user_id}")
def get_user(
    user_id: str,
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "user": user,
    }


@router.put("/{user_id}/role")
def change_user_role(
    user_id: str,
    role_update: UserRoleUpdate,
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    # Prevent an admin from modifying their own role
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own role",
        )

    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Don't modify another ADMIN's role
    if user["role"] == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator roles cannot be changed",
        )

    updated_user = update_user_role(
        user_id,
        role_update.role,
    )

    return {
        "message": "User role updated successfully",
        "user": updated_user,
    }


@router.put("/{user_id}/status")
def change_user_status(
    user_id: str,
    status_update: UserStatusUpdate,
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    # Prevent an admin from deactivating themselves
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own account status",
        )

    user = get_user_by_id(user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    updated_user = update_user_status(
        user_id,
        status_update.is_active,
    )

    return {
        "message": "User status updated successfully",
        "user": updated_user,
    }