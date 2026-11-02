import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.app.config import settings
from backend.app.database.session import init_db
from backend.app.api.health import router as health_router
from backend.app.api.endpoints import router as api_router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

init_db()  # Ensure database tables exist immediately

app = FastAPI(
    title="VeriAI — AI Hallucination Detection & Verification System",
    description="Production-grade, claim-level factual verification pipeline with multi-source evidence grounding.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware (allowing Vite dev server and external clients)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router, prefix="/api")
app.include_router(api_router, prefix="/api")

# Determine Frontend Distribution Directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
frontend_dist = BASE_DIR / "frontend" / "dist"
legacy_dir = BASE_DIR / "frontend_legacy"

# Mount static assets if Vite dist exists
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path in ("docs", "openapi.json", "redoc"):
            return JSONResponse({"detail": "Not found"}, status_code=404)

        # Check if requesting a direct static file in dist (like vite.svg, favicon, etc.)
        direct_file = frontend_dist / full_path
        if full_path and direct_file.is_file():
            return FileResponse(direct_file)

        # Fallback to SPA root index.html
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)

        return JSONResponse({"message": "VeriAI API active. Frontend dist missing."}, status_code=200)

elif legacy_dir.exists():
    app.mount("/static", StaticFiles(directory=str(legacy_dir)), name="static")

    @app.get("/")
    async def serve_legacy():
        index_file = legacy_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"message": "VeriAI API active."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
