from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel, Field

from backend.models.user import UserCreate, UserResponse, UserRole
from backend.security.otp_manager import otp_manager
from backend.security.auth import auth_service

router = APIRouter()


class SendOTPRequest(BaseModel):
    phone: str = Field(..., description="Indian 10-digit mobile number, e.g., 9876543210 or +919876543210")


class SendOTPResponse(BaseModel):
    success: bool
    message: str
    phone: str
    cooldown_seconds: int
    expires_in_seconds: int


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., description="Mobile number used to request OTP")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP received via SMS")
    role: Optional[UserRole] = UserRole.FARMER
    full_name: Optional[str] = "Ramesh Kumar"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(req: SendOTPRequest):
    """
    Send OTP endpoint.
    Generates OTP on server ONLY, stores salted hash, and sends via SMS.
    STRICTLY DOES NOT RETURN OTP IN RESPONSE.
    """
    result = await otp_manager.send_otp(req.phone)
    return result


@router.post("/verify-otp", response_model=LoginResponse)
async def verify_otp(req: VerifyOTPRequest):
    """
    Verify OTP endpoint.
    Verifies 6-digit OTP against server-side salted hash.
    Generates JWT access token upon successful verification.
    """
    verified = await otp_manager.verify_otp(req.phone, req.otp)
    if not verified:
        raise HTTPException(status_code=400, detail="OTP verification failed.")

    user_id = f"user_{req.phone.replace('+', '')}"
    user_role = req.role or UserRole.FARMER

    # Generate JWT token
    access_token = auth_service.create_access_token(user_id=user_id, role=user_role)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "phone": req.phone,
            "role": user_role.value,
            "full_name": req.full_name or "BhumiSetu Citizen",
            "is_active": True
        }
    }


class PasswordLoginRequest(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    otp: Optional[str] = None
    role: Optional[UserRole] = None
    full_name: Optional[str] = None


@router.post("/login", response_model=LoginResponse)
async def login(req: PasswordLoginRequest):
    """
    Standard Username & Password Login endpoint.
    - Web Admin: Username 'Tahsildar1', Password '123456'
    - Normal App User: Username 'Rakesh', Password '1234567890'
    """
    # 1. Username & Password Login Flow
    if req.username:
        clean_user = req.username.strip().lower()
        password = req.password or ""

        if clean_user == "tahsildar1" and password == "123456":
            user_id = "USR-TEHSILDAR-01"
            user_role = UserRole.TEHSILDAR
            full_name = "Priya Sharma (Tahsildar)"
            phone = "9876543230"
        elif clean_user == "rakesh" and password == "1234567890":
            user_id = "USR-FARMER-01"
            user_role = UserRole.FARMER
            full_name = "Rakesh Kumar"
            phone = "9876543210"
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password. Please check your credentials.")

        access_token = auth_service.create_access_token(user_id=user_id, role=user_role)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "username": req.username,
                "phone": phone,
                "role": user_role.value,
                "full_name": full_name,
                "is_active": True
            }
        }

    # 2. Fallback / OTP Login Flow if phone & otp provided
    if req.phone and req.otp:
        verified = await otp_manager.verify_otp(req.phone, req.otp)
        if not verified:
            raise HTTPException(status_code=400, detail="OTP verification failed.")

        user_id = f"user_{req.phone.replace('+', '')}"
        user_role = req.role or UserRole.FARMER
        access_token = auth_service.create_access_token(user_id=user_id, role=user_role)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "phone": req.phone,
                "role": user_role.value,
                "full_name": req.full_name or "BhumiSetu User",
                "is_active": True
            }
        }

    raise HTTPException(status_code=400, detail="Username and password are required for login.")



@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    """Register a new user profile."""
    return {
        "id": f"user_{user.phone.replace('+', '')}",
        "phone": user.phone,
        "role": user.role,
        "is_active": True
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user():
    """Get current logged in user profile."""
    return {
        "id": "user_demo",
        "phone": "+919876543210",
        "role": UserRole.FARMER,
        "is_active": True
    }
