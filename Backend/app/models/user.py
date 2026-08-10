from datetime import datetime, timezone


USER_ROLES = {
    "STUDENT",
    "STAFF",
    "ADMIN",
}


def build_user_document(
    name: str,
    email: str,
    password_hash: str,
    role: str = "STUDENT",
) -> dict:
    now = datetime.now(timezone.utc)

    return {
        "name": name,
        "email": email.lower(),
        "password_hash": password_hash,
        "role": role,
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }