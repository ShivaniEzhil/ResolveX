from fastapi import FastAPI

app = FastAPI(
    title="ResolveX API",
    description="AI-Powered Intelligent Complaint Management & Resolution Platform",
    version="1.0.0",
)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "ResolveX",
    }