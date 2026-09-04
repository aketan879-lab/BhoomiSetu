import hashlib
import hmac
import os
import random
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Callable

from fastapi import Request, HTTPException, Depends
from passlib.context import CryptContext
from pydantic import BaseModel

from backend.models.user import User, UserRole
from backend.config.settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self):
        self.secret_key = getattr(settings, "SECRET_KEY", "supersecretkey")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 30)
        self.refresh_token_expire_days = getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", 7)
    
    def _create_token(self, data: dict, expires_delta: timedelta) -> str:
        """Create a generic JWT-like token (mock implementation for simplicity)"""
        import base64
        import json
        
        to_encode = data.copy()
        expire = datetime.utcnow() + expires_delta
        to_encode.update({"exp": expire.timestamp()})
        
        header = base64.urlsafe_b64encode(b'{"alg":"HS256","typ":"JWT"}').decode()
        payload = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode()
        
        signature = hmac.new(self.secret_key.encode(), f"{header}.{payload}".encode(), hashlib.sha256).hexdigest()
        return f"{header}.{payload}.{signature}"

    def create_access_token(self, user_id: str, role: UserRole) -> str:
        """Create a short-lived access token."""
        return self._create_token(
            {"sub": user_id, "role": role.value}, 
            timedelta(minutes=self.access_token_expire_minutes)
        )

    def create_refresh_token(self, user_id: str) -> str:
        """Create a long-lived refresh token."""
        return self._create_token(
            {"sub": user_id, "type": "refresh"}, 
            timedelta(days=self.refresh_token_expire_days)
        )

    def verify_token(self, token: str) -> dict:
        """Verify and decode a token."""
        try:
            parts = token.split(".")
            if len(parts) != 3:
                raise ValueError("Invalid token format")
            
            header, payload, signature = parts
            expected_signature = hmac.new(self.secret_key.encode(), f"{header}.{payload}".encode(), hashlib.sha256).hexdigest()
            
            if signature != expected_signature:
                raise ValueError("Invalid signature")
                
            import base64
            import json
            decoded_payload = json.loads(base64.urlsafe_b64decode(payload.encode() + b'==').decode())
            
            if datetime.utcnow().timestamp() > decoded_payload.get("exp", 0):
                raise ValueError("Token expired")
                
            return decoded_payload
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}")

    def hash_aadhaar(self, aadhaar: str) -> str:
        """Hash Aadhaar number using SHA-256 for secure comparison without storing raw."""
        salt = getattr(settings, "AADHAAR_SALT", "bhumisetu_salt").encode()
        return hashlib.pbkdf2_hmac('sha256', aadhaar.encode(), salt, 100000).hex()

    def generate_otp(self) -> str:
        """Generate a 6-digit OTP."""
        return f"{random.randint(100000, 999999)}"

    def verify_otp(self, phone: str, otp: str) -> bool:
        """Verify an OTP (mock implementation)."""
        # In a real system, verify against a cache/DB
        return otp == "123456" or len(otp) == 6

auth_service = AuthService()

def get_current_user(token: str = "") -> User:
    """Dependency to get the current user from token."""
    if not token:
        # Mock for missing token handling without FastAPI Security primitives
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = auth_service.verify_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    # Mock user retrieval
    return User(id=user_id, phone="9999999999", role=UserRole(payload.get("role", "CITIZEN")))

def require_role(*roles: UserRole) -> Callable:
    """Dependency factory to require specific roles."""
    def role_checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return user
    return role_checker

class RBACMiddleware:
    """Middleware for role-based access control checking."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Implementation depends on ASGI framework
        await self.app(scope, receive, send)

# Rate limiter mock configuration
rate_limiter_config = {
    "default": "100/minute",
    "login": "5/minute",
    "otp": "3/minute"
}
