from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.config.database import get_db
from backend.models.land_record import LandRecord, ValidationStatus
from backend.services.validation.validation_pipeline import ValidationPipeline

router = APIRouter()
pipeline = ValidationPipeline()

@router.post("/{record_id}")
async def trigger_validation(record_id: str, db: AsyncSession = Depends(get_db)):
    """Trigger the 5-layer validation pipeline for a record."""
    result = await db.execute(select(LandRecord).where(LandRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found for validation")

    report = await pipeline.validate(record)
    return {
        "record_id": record_id,
        "format_score": report.format_score,
        "cross_db_score": report.cross_db_score,
        "spatial_score": report.spatial_score,
        "title_chain_score": report.title_chain_score,
        "anomaly_risk_level": report.anomaly_risk_level.value,
        "overall_status": report.overall_status.value,
        "issues": report.issues_json or []
    }

@router.get("/queue", response_model=List[Dict[str, Any]])
async def get_validation_queue(db: AsyncSession = Depends(get_db)):
    """Get list of records pending manual validation review for the Web Portal."""
    result = await db.execute(select(LandRecord))
    records = result.scalars().all()
    queue = []
    for r in records:
        queue.append({
            "record_id": r.id,
            "record_type": r.record_type.value,
            "owner_name": r.owner_name,
            "district": r.district,
            "state_code": r.state_code,
            "khasra_number": r.khasra_number or r.survey_number,
            "status": r.validation_status.value
        })
    return queue

@router.post("/approve/{record_id}")
async def approve_record(record_id: str, db: AsyncSession = Depends(get_db)):
    """Tehsildar / Officer approves a record — updates database & syncs to Mobile App."""
    result = await db.execute(select(LandRecord).where(LandRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record.validation_status = ValidationStatus.VALIDATED
    await db.commit()
    return {"status": "success", "message": f"Record {record_id} approved and status synced to Mobile App!", "validation_status": "VALIDATED"}

@router.post("/reject/{record_id}")
async def reject_record(record_id: str, reason: str = "Discrepancy found", db: AsyncSession = Depends(get_db)):
    """Officer rejects a record — updates database & syncs to Mobile App."""
    result = await db.execute(select(LandRecord).where(LandRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    record.validation_status = ValidationStatus.REJECTED
    await db.commit()
    return {"status": "success", "message": f"Record {record_id} rejected. Reason: {reason}", "validation_status": "REJECTED"}
