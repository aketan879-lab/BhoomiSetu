import enum
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Enum, JSON, ForeignKey
from backend.config.database import Base
from pydantic import BaseModel
from typing import Optional, Any
import uuid

class AuditAction(str, enum.Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    EXPORT = "EXPORT"
    VALIDATE = "VALIDATE"
    APPROVE = "APPROVE"
    REJECT = "REJECT"

class AuditLog(Base):
    """Audit Log Model"""
    __tablename__ = "audit_logs"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(Enum(AuditAction), nullable=False)
    resource_type = Column(String, nullable=False)
    resource_id = Column(String, nullable=False)
    details_json = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    gps_lat = Column(Float, nullable=True)
    gps_lng = Column(Float, nullable=True)
    device_fingerprint = Column(String, nullable=True)
    blockchain_tx_hash = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AuditLogCreate(BaseModel):
    user_id: str
    action: AuditAction
    resource_type: str
    resource_id: str
    details_json: Optional[Any] = None
    ip_address: Optional[str] = None
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    device_fingerprint: Optional[str] = None
    blockchain_tx_hash: Optional[str] = None

class AuditLogResponse(AuditLogCreate):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
