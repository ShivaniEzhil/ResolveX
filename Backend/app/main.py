from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


# CORS configuration for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://resolvex-frontend-j9di.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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