from app.database.mongodb import database


complaints_collection = database["complaints"]
counters_collection = database["complaint_counters"]


def migrate():
    complaints = list(
        complaints_collection
        .find(
            {
                "complaint_number": {
                    "$exists": False,
                }
            }
        )
        .sort("created_at", 1)
    )

    sequence = 0

    for complaint in complaints:
        sequence += 1

        complaint_number = f"CMP-{sequence:04d}"

        complaints_collection.update_one(
            {
                "_id": complaint["_id"],
            },
            {
                "$set": {
                    "complaint_number": complaint_number,
                }
            },
        )

        print(
            f"{complaint['_id']} -> {complaint_number}"
        )

    counters_collection.update_one(
        {
            "_id": "complaint_number",
        },
        {
            "$set": {
                "sequence": sequence,
            }
        },
        upsert=True,
    )

    print(
        f"\nMigration complete. "
        f"{sequence} complaints processed."
    )


if __name__ == "__main__":
    migrate()