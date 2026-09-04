import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, JSON, ForeignKey
from backend.config.database import Base
from pydantic import BaseModel
from typing import Optional, Any
import uuid

class DisputeType(str, enum.Enum):
    OWNERSHIP_CONFLICT = "OWNERSHIP_CONFLICT"
    BOUNDARY_OVERLAP = "BOUNDARY_OVERLAP"
    CHAIN_GAP = "CHAIN_GAP"
    ACTIVE_LITIGATION = "ACTIVE_LITIGATION"
    DATABASE_CONTRADICTION = "DATABASE_CONTRADICTION"
    AREA_MISMATCH = "AREA_MISMATCH"

class DisputeStatus(str, enum.Enum):
    DETECTED = "DETECTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    ESCALATED = "ESCALATED"

class Priority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class Dispute(Base):
    """Dispute Model"""
    __tablename__ = "disputes"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    land_record_id = Column(String, ForeignKey("land_records.id"), nullable=False)
    dispute_type = Column(Enum(DisputeType), nullable=False)
    description = Column(String, nullable=False)
    parties_json = Column(JSON, nullable=True)
    evidence_urls = Column(JSON, nullable=True)
    status = Column(Enum(DisputeStatus), nullable=False, default=DisputeStatus.DETECTED)
    priority = Column(Enum(Priority), nullable=False, default=Priority.MEDIUM)
    detected_by_layer = Column(String, nullable=True)
    assigned_to = Column(String, ForeignKey("users.id"), nullable=True)
    resolution_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class DisputeCreate(BaseModel):
    land_record_id: str
    dispute_type: DisputeType
    description: str
    parties_json: Optional[Any] = None
    evidence_urls: Optional[Any] = None
    status: DisputeStatus = DisputeStatus.DETECTED
    priority: Priority = Priority.MEDIUM
    detected_by_layer: Optional[str] = None
    assigned_to: Optional[str] = None

class DisputeResponse(DisputeCreate):
    id: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
