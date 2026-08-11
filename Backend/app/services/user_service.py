from bson import ObjectId

from app.database.mongodb import database


users_collection = database["users"]


def get_all_users() -> list:
    users = []

    for user in users_collection.find().sort("created_at", -1):
        user["id"] = str(user["_id"])
        user.pop("_id", None)
        user.pop("password_hash", None)

        users.append(user)

    return users


def get_user_by_id(user_id: str) -> dict | None:
    if not ObjectId.is_valid(user_id):
        return None

    user = users_collection.find_one(
        {"_id": ObjectId(user_id)}
    )

    if user is None:
        return None

    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password_hash", None)

    return user


def update_user_role(
    user_id: str,
    role: str,
) -> dict | None:

    if not ObjectId.is_valid(user_id):
        return None

    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "role": role,
            }
        },
    )

    if result.matched_count == 0:
        return None

    return get_user_by_id(user_id)


def update_user_status(
    user_id: str,
    is_active: bool,
) -> dict | None:

    if not ObjectId.is_valid(user_id):
        return None

    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "is_active": is_active,
            }
        },
    )

    if result.matched_count == 0:
        return None

    return get_user_by_id(user_id)