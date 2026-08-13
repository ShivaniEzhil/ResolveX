from fastapi import FastAPI
from app.routes.users import router as users_router
from app.database.mongodb import check_database_connection
from app.routes.complaints import router as complaints_router
from app.routes.auth import router as auth_router
from app.routes.responses import router as responses_router
from app.routes.analytics import router as analytics_router
from app.routes.notifications import router as notifications_router
from app.routes.audit import router as audit_router

app = FastAPI(
    title="ResolveX API",
    description="AI-Powered Intelligent Complaint Management & Resolution Platform",
    version="1.0.0",
)


app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(users_router)
app.include_router(responses_router)
app.include_router(notifications_router)
app.include_router(audit_router)
app.include_router(analytics_router)

@app.get("/api/health")
def health_check():
    database_status = check_database_connection()

    return {
        "status": "ok",
        "service": "ResolveX",
        "database": "connected" if database_status else "disconnected",
    }