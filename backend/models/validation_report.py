import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Enum, JSON, ForeignKey
from backend.config.database import Base
from pydantic import BaseModel
from typing import Optional, Any
import uuid

class AnomalyRiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class OverallStatus(str, enum.Enum):
    AUTO_APPROVED = "AUTO_APPROVED"
    REQUIRES_REVIEW = "REQUIRES_REVIEW"
    ESCALATED = "ESCALATED"

class ValidationReport(Base):
    """Validation Report Model"""
    __tablename__ = "validation_reports"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    land_record_id = Column(String, ForeignKey("land_records.id"), nullable=False)
    format_score = Column(Float, nullable=False, default=0.0)
    cross_db_score = Column(Float, nullable=False, default=0.0)
    spatial_score = Column(Float, nullable=False, default=0.0)
    title_chain_score = Column(Float, nullable=False, default=0.0)
    anomaly_risk_level = Column(Enum(AnomalyRiskLevel), nullable=False, default=AnomalyRiskLevel.LOW)
    overall_status = Column(Enum(OverallStatus), nullable=False, default=OverallStatus.REQUIRES_REVIEW)
    issues_json = Column(JSON, nullable=True) # list of issue objects
    assigned_to = Column(String, ForeignKey("users.id"), nullable=True)
    reviewed_by = Column(String, ForeignKey("users.id"), nullable=True)
    review_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

class ValidationReportCreate(BaseModel):
    land_record_id: str
    format_score: float
    cross_db_score: float
    spatial_score: float
    title_chain_score: float
    anomaly_risk_level: AnomalyRiskLevel
    overall_status: OverallStatus
    issues_json: Optional[Any] = None
    assigned_to: Optional[str] = None

class ValidationReportResponse(ValidationReportCreate):
    id: str
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: datetime
    reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
