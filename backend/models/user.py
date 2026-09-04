import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from backend.config.database import Base
from pydantic import BaseModel
from typing import Optional
import uuid

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    PATWARI = "PATWARI"
    TEHSILDAR = "TEHSILDAR"
    DISTRICT_COLLECTOR = "DISTRICT_COLLECTOR"
    ADMIN = "ADMIN"
    AUDITOR = "AUDITOR"

class User(Base):
    """User Model"""
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    aadhaar_hash = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.FARMER)
    state_code = Column(String, nullable=True)
    district = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    mfa_enabled = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserCreate(BaseModel):
    aadhaar_hash: Optional[str] = None
    name: str
    phone: str
    email: Optional[str] = None
    role: UserRole
    state_code: Optional[str] = None
    district: Optional[str] = None

class UserResponse(UserCreate):
    id: str
    is_active: bool
    mfa_enabled: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    phone: Optional[str] = None
    otp: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None

class UserPasswordLogin(BaseModel):
    username: str
    password: str

