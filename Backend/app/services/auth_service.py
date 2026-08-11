from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database.mongodb import database
from app.models.user import build_user_document


users_collection = database["users"]


def get_user_by_email(email: str):
    return users_collection.find_one(
        {"email": email.lower()}
    )


def register_user(
    name: str,
    email: str,
    password: str,
):

    if get_user_by_email(email):
        return None

    password_hash = hash_password(password)

    user = build_user_document(
        name=name,
        email=email,
        password_hash=password_hash,
    )

    result = users_collection.insert_one(user)

    user["id"] = str(result.inserted_id)
    user.pop("_id", None)
    user.pop("password_hash", None)

    return user


def authenticate_user(
    email: str,
    password: str,
):

    user = get_user_by_email(email)

    if user is None:
        return None

    if not user.get("is_active", False):
        return None

    if not verify_password(
        password,
        user["password_hash"],
    ):
        return None

    user["id"] = str(user["_id"])

    token = create_access_token(
        user_id=user["id"],
        role=user["role"],
    )

    user.pop("_id", None)
    user.pop("password_hash", None)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }