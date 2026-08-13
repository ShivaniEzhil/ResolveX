from datetime import datetime, timezone
from bson import ObjectId

from app.database.mongodb import database


responses_collection = database["complaint_responses"]


def create_response(
    complaint_id: str,
    user_id: str,
    message: str,
) -> dict | None:

    if not ObjectId.is_valid(complaint_id):
        return None

    response = {
        "complaint_id": complaint_id,
        "user_id": user_id,
        "message": message,
        "created_at": datetime.now(timezone.utc),
    }

    result = responses_collection.insert_one(response)

    response["id"] = str(result.inserted_id)
    response.pop("_id", None)

    return response


def get_responses_for_complaint(
    complaint_id: str,
) -> list:

    responses = []

    for response in responses_collection.find(
        {"complaint_id": complaint_id}
    ).sort("created_at", 1):

        response["id"] = str(response["_id"])
        response.pop("_id", None)

        responses.append(response)

    return responses