from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.models.dispute import Dispute, DisputeCreate, DisputeResponse, DisputeStatus

router = APIRouter()

@router.get("/", response_model=List[DisputeResponse])
async def list_disputes(
    status: Optional[DisputeStatus] = None,
    assigned_to: Optional[str] = None
):
    """List disputes with optional filtering."""
    return []

@router.get("/map", response_model=List[dict])
async def get_disputes_map():
    """Get disputes with spatial coordinates for map visualization."""
    return []

@router.get("/{dispute_id}", response_model=DisputeResponse)
async def get_dispute(dispute_id: str):
    """Get a single dispute by ID."""
    raise HTTPException(status_code=404, detail="Dispute not found")

@router.post("/", response_model=DisputeResponse, status_code=201)
async def report_dispute(dispute: DisputeCreate):
    """Manually report a new dispute."""
    return {"id": "new-dispute-id", **dispute.model_dump(), "status": DisputeStatus.OPEN}

@router.put("/{dispute_id}/assign")
async def assign_dispute(dispute_id: str, official_id: str):
    """Assign a dispute to a revenue official."""
    return {"status": "success", "message": "Dispute assigned"}

@router.put("/{dispute_id}/resolve")
async def resolve_dispute(dispute_id: str, resolution_notes: str):
    """Mark a dispute as resolved."""
    return {"status": "success", "message": "Dispute resolved"}
