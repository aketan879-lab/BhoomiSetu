from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.config.database import get_db
from backend.models.land_record import LandRecord, LandRecordCreate, LandRecordResponse

router = APIRouter()

@router.get("/", response_model=List[LandRecordResponse])
async def list_records(
    state: Optional[str] = None,
    district: Optional[str] = None,
    is_urban: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all land records with optional filtering."""
    query = select(LandRecord)
    if state:
        query = query.where(LandRecord.state_code == state.upper())
    if district:
        query = query.where(LandRecord.district.ilike(f"%{district}%"))
    if is_urban is not None:
        query = query.where(LandRecord.is_urban == is_urban)
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    records = result.scalars().all()
    return records

@router.get("/search", response_model=List[LandRecordResponse])
async def search_records(
    owner_name: Optional[str] = None,
    survey_number: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Search records by owner name or survey number."""
    query = select(LandRecord)
    if owner_name:
        query = query.where(LandRecord.owner_name.ilike(f"%{owner_name}%"))
    if survey_number:
        query = query.where(
            (LandRecord.survey_number.ilike(f"%{survey_number}%")) |
            (LandRecord.khasra_number.ilike(f"%{survey_number}%"))
        )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{record_id}", response_model=LandRecordResponse)
async def get_record(record_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single record by ID."""
    result = await db.execute(select(LandRecord).where(LandRecord.id == record_id))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")
    return record

from datetime import datetime

@router.post("/", response_model=LandRecordResponse, status_code=201)
async def create_record(record_in: LandRecordCreate, db: AsyncSession = Depends(get_db)):
    """Create or update a land record from Mobile App or Web Portal."""
    data = record_in.model_dump(exclude_unset=True)
    if data.get("id"):
        result = await db.execute(select(LandRecord).where(LandRecord.id == data["id"]))
        existing = result.scalar_one_or_none()
        if existing:
            for key, val in data.items():
                setattr(existing, key, val)
            existing.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(existing)
            return existing

    db_record = LandRecord(**data)
    db.add(db_record)
    await db.commit()
    await db.refresh(db_record)
    return db_record

@router.put("/{record_id}/status")
async def update_record_status(
    record_id: str,
    status: str = Query(..., description="VALIDATED, REJECTED, FLAGGED, or PENDING"),
    db: AsyncSession = Depends(get_db)
):
    """Update record validation status (Approve / Reject / Flag). Auto-creates record if missing."""
    clean_status = status.upper().strip()
    if clean_status in ["VALIDATED", "APPROVED", "SOLVED"]:
        target_status = "VALIDATED"
    elif clean_status in ["REJECTED", "DECLINED"]:
        target_status = "REJECTED"
    elif clean_status in ["FLAGGED", "AUDIT"]:
        target_status = "FLAGGED"
    else:
        target_status = "PENDING"

    result = await db.execute(select(LandRecord).where(LandRecord.id == record_id))
    record = result.scalar_one_or_none()

    if not record:
        # Create record with specific ID if not present in DB
        record = LandRecord(
            id=record_id,
            record_type="SALE_DEED",
            state_code="UP",
            district="Lucknow",
            tehsil="Sadar",
            village="Alambagh",
            khasra_number="45/12",
            khata_number="102",
            owner_name="Rakesh Kumar",
            father_husband_name="Shri Harish Kumar",
            area_value=2.5,
            area_unit="HECTARE",
            area_normalized_sqm=25000.0,
            land_type="AGRICULTURAL",
            validation_status=target_status,
            digitized_by="USR-FARMER-01",
            updated_at=datetime.utcnow()
        )
        db.add(record)
    else:
        record.validation_status = target_status
        record.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(record)
    return {"status": "success", "record_id": record.id, "validation_status": record.validation_status}

