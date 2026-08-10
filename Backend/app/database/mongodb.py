from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from app.core.config import settings


client = MongoClient(settings.mongodb_uri)

database = client[settings.database_name]


def check_database_connection() -> bool:
    try:
        client.admin.command("ping")
        return True
    except ConnectionFailure:
        return False