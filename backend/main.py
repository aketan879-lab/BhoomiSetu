from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import settings
from backend.config.database import engine, Base
from backend.api import api_router

# Import all models so SQLAlchemy registers them
from backend.models import land_record, user, validation_report, dispute, audit_log  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables on startup, dispose engine on shutdown."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "BhumiSetu — Intelligent Land Record Digitization & Validation Platform. "
        "Digitize, validate, and manage land records for urban and rural India."
    ),
    lifespan=lifespan,
)

from fastapi.middleware.gzip import GZipMiddleware

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Compression for Low-Bandwidth 2G/3G Connections
app.add_middleware(GZipMiddleware, minimum_size=500)


# Wire up all API routes
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "BhumiSetu API is running!",
        "version": settings.VERSION,
    }
