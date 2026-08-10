from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user

from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
)
from app.services.auth_service import (
    authenticate_user,
    register_user,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
)
def register(request: RegisterRequest):

    user = register_user(
        name=request.name,
        email=request.email,
        password=request.password,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    return {
        "message": "User registered successfully",
        "user": user,
    }


@router.post("/login")
def login(request: LoginRequest):

    result = authenticate_user(
        email=request.email,
        password=request.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return result

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "user": current_user,
    }