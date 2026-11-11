from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.init_db import init_db
from app.api.entries import router as entries_router
from app.api.calendar import router as calendar_router
from app.api.reports import router as reports_router
from app.api.weight import router as weight_router
from app.api.settings import router as settings_router
from app.api.backup import router as backup_router
from app.api.parse import router as parse_router
from app.api.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database and seed defaults on startup
    init_db()
    yield

app = FastAPI(
    title="BiteLog Offline API",
    description="Local offline calorie & protein tracking API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development, Tauri, and local webviews
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers with /api prefix
app.include_router(entries_router, prefix="/api")
app.include_router(calendar_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(weight_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(backup_router, prefix="/api")
app.include_router(parse_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "BiteLog",
        "mode": "100% Offline",
        "storage": "Local SQLite"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)

