from fastapi import FastAPI

from app.database.mongodb import check_database_connection
from app.routes.complaints import router as complaints_router
from app.routes.auth import router as auth_router

app = FastAPI(
    title="ResolveX API",
    description="AI-Powered Intelligent Complaint Management & Resolution Platform",
    version="1.0.0",
)


app.include_router(auth_router)
app.include_router(complaints_router)


@app.get("/api/health")
def health_check():
    database_status = check_database_connection()

    return {
        "status": "ok",
        "service": "ResolveX",
        "database": "connected" if database_status else "disconnected",
    }