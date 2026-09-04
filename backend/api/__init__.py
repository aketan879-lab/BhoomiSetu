from fastapi import APIRouter
from backend.api.records import router as records_router
from backend.api.scan import router as scan_router
from backend.api.validate import router as validate_router
from backend.api.disputes import router as disputes_router
from backend.api.auth import router as auth_router
from backend.api.sync import router as sync_router

api_router = APIRouter()

api_router.include_router(records_router, prefix="/records", tags=["Records"])
api_router.include_router(scan_router, prefix="/scan", tags=["Scanning & OCR"])
api_router.include_router(validate_router, prefix="/validate", tags=["Validation"])
api_router.include_router(disputes_router, prefix="/disputes", tags=["Disputes"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sync_router, prefix="/sync", tags=["Offline Sync"])
