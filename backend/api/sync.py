from fastapi import APIRouter
from typing import List, Dict, Any
from pydantic import BaseModel

router = APIRouter()

class SyncPayload(BaseModel):
    device_id: str
    last_sync_time: str
    records: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]

@router.post("/push")
async def push_offline_changes(payload: SyncPayload):
    """Push changes made offline from mobile device to server."""
    return {"status": "success", "processed_records": len(payload.records)}

@router.get("/pull")
async def pull_updates(device_id: str, last_sync: str):
    """Pull updates from server since last sync timestamp."""
    return {
        "new_records": [],
        "updated_records": [],
        "deleted_ids": [],
        "sync_time": "2026-09-04T12:00:00Z"
    }

@router.get("/status")
async def sync_status(device_id: str):
    """Get the current sync status for a device."""
    return {
        "device_id": device_id,
        "last_sync": "2026-09-04T11:00:00Z",
        "pending_pushes": 0
    }
