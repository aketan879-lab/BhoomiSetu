import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Float, JSON, ForeignKey
from backend.config.database import Base
from pydantic import BaseModel
from typing import Optional, Any
import uuid

class RecordType(str, enum.Enum):
    KHASRA = "KHASRA"
    KHATAUNI = "KHATAUNI"
    SALE_DEED = "SALE_DEED"
    PATTA = "PATTA"
    CHITTA = "CHITTA"
    RTC = "RTC"
    JAMABANDI = "JAMABANDI"
    SEVEN_TWELVE = "SEVEN_TWELVE"
    PROPERTY_CARD = "PROPERTY_CARD"
    RERA_CERT = "RERA_CERT"

class AreaUnit(str, enum.Enum):
    BIGHA = "BIGHA"
    BIGHAPUCCA = "BIGHAPUCCA"
    BIGHACACHHA = "BIGHACACHHA"
    BISWA = "BISWA"
    ACRE = "ACRE"
    HECTARE = "HECTARE"
    SQFT = "SQFT"
    SQMETER = "SQMETER"
    SQYARD = "SQYARD"
    GUNTA = "GUNTA"
    GUNTHA = "GUNTHA"
    ARE = "ARE"
    CENT = "CENT"

class LandType(str, enum.Enum):
    AGRICULTURAL = "AGRICULTURAL"
    RESIDENTIAL = "RESIDENTIAL"
    COMMERCIAL = "COMMERCIAL"
    INDUSTRIAL = "INDUSTRIAL"
    FOREST = "FOREST"
    WASTELAND = "WASTELAND"
    MIXED = "MIXED"

class ValidationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VALIDATED = "VALIDATED"
    FLAGGED = "FLAGGED"
    REJECTED = "REJECTED"

class LandRecord(Base):
    """Land Record Model"""
    __tablename__ = "land_records"
    __table_args__ = {'extend_existing': True}

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    record_type = Column(Enum(RecordType), nullable=False)
    state_code = Column(String, nullable=False)
    district = Column(String, nullable=False)
    tehsil = Column(String, nullable=False) # Used for tehsil/taluk
    village = Column(String, nullable=False) # Used for village/ward
    survey_number = Column(String, nullable=True)
    khasra_number = Column(String, nullable=True)
    khata_number = Column(String, nullable=True)
    plot_number = Column(String, nullable=True)
    owner_name = Column(String, nullable=False)
    father_husband_name = Column(String, nullable=True)
    area_value = Column(Float, nullable=False)
    area_unit = Column(Enum(AreaUnit), nullable=False)
    area_normalized_sqm = Column(Float, nullable=False)
    land_type = Column(Enum(LandType), nullable=False)
    boundaries_json = Column(JSON, nullable=True)
    registration_number = Column(String, nullable=True)
    stamp_duty = Column(Float, nullable=True)
    transaction_type = Column(String, nullable=True)
    transaction_date = Column(DateTime, nullable=True)
    is_urban = Column(Boolean, default=False)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    source_document_url = Column(String, nullable=True)
    ocr_confidence_score = Column(Float, nullable=True)
    validation_status = Column(Enum(ValidationStatus), default=ValidationStatus.PENDING)
    digitized_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LandRecordCreate(BaseModel):
    id: Optional[str] = None
    record_type: RecordType
    state_code: str
    district: str
    tehsil: str
    village: str
    survey_number: Optional[str] = None
    khasra_number: Optional[str] = None
    khata_number: Optional[str] = None
    plot_number: Optional[str] = None
    owner_name: str
    father_husband_name: Optional[str] = None
    area_value: float
    area_unit: AreaUnit
    area_normalized_sqm: float
    land_type: LandType
    boundaries_json: Optional[Any] = None
    registration_number: Optional[str] = None
    stamp_duty: Optional[float] = None
    transaction_type: Optional[str] = None
    transaction_date: Optional[datetime] = None
    is_urban: bool = False
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    source_document_url: Optional[str] = None
    ocr_confidence_score: Optional[float] = None
    validation_status: Optional[ValidationStatus] = None
    digitized_by: Optional[str] = None

class LandRecordResponse(LandRecordCreate):
    id: str
    validation_status: ValidationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LandRecordUpdate(BaseModel):
    validation_status: Optional[ValidationStatus] = None
    owner_name: Optional[str] = None
