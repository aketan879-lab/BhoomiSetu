import hmac
import hashlib
import re
import secrets
import time
import logging
from typing import Dict, Optional, Tuple
from fastapi import HTTPException

from backend.config.settings import settings
from backend.services.sms import get_sms_provider

logger = logging.getLogger(__name__)

# Pattern for Indian 10-digit mobile numbers
INDIAN_PHONE_REGEX = re.compile(r"^(\+91|0)?[6-9]\d{9}$")


class OTPSession:
    """Represents an active OTP session stored securely in memory."""
    def __init__(self, phone: str, otp_hash: str):
        self.phone = phone
        self.otp_hash = otp_hash
        self.created_at = time.time()
        self.last_sent_at = time.time()
        self.expires_at = time.time() + getattr(settings, "OTP_EXPIRE_SECONDS", 300)
        self.attempts_count = 0


class SecureOTPManager:
    """Production-grade secure OTP Manager handling hashing, rate limits, expiry, and SMS delivery."""

    def __init__(self):
        self._sessions: Dict[str, OTPSession] = {}
        self.salt = getattr(settings, "OTP_SALT", "bhumisetu_secure_otp_salt_2026")
        self.cooldown_seconds = getattr(settings, "OTP_COOLDOWN_SECONDS", 60)
        self.expire_seconds = getattr(settings, "OTP_EXPIRE_SECONDS", 300)
        self.max_attempts = getattr(settings, "OTP_MAX_ATTEMPTS", 5)

    def sanitize_and_validate_phone(self, raw_phone: str) -> str:
        """Validate and format phone number to standardized +91XXXXXXXXXX format."""
        if not raw_phone:
            raise HTTPException(status_code=400, detail="Mobile phone number is required.")

        cleaned = raw_phone.strip().replace(" ", "").replace("-", "")

        if not INDIAN_PHONE_REGEX.match(cleaned):
            raise HTTPException(
                status_code=400,
                detail="Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9."
            )

        # Standardize to +91XXXXXXXXXX
        if cleaned.startswith("+91"):
            standardized = cleaned
        elif cleaned.startswith("0"):
            standardized = f"+91{cleaned[1:]}"
        else:
            standardized = f"+91{cleaned}"

        return standardized

    def _hash_otp(self, phone: str, otp: str) -> str:
        """Generate a SHA-256 salted hash of the OTP code."""
        content = f"{phone}:{otp}:{self.salt}".encode("utf-8")
        return hashlib.sha256(content).hexdigest()

    def mask_phone(self, phone: str) -> str:
        """Mask phone number for safe non-sensitive UI display."""
        if len(phone) >= 13: # +919876543210
            return f"{phone[:6]} XXXXX{phone[-2:]}"
        elif len(phone) == 10:
            return f"{phone[:3]}XXXXX{phone[-2:]}"
        return phone

    async def send_otp(self, raw_phone: str) -> dict:
        """
        Generates OTP on server, hashes it, stores expiry session, and dispatches via SMS.
        Strictly DOES NOT expose OTP in return payload.
        """
        phone = self.sanitize_and_validate_phone(raw_phone)
        now = time.time()

        # Check Rate Limit & Cooldown (per phone number)
        existing_session = self._sessions.get(phone)
        if existing_session:
            elapsed = now - existing_session.last_sent_at
            if elapsed < self.cooldown_seconds:
                remaining = int(self.cooldown_seconds - elapsed)
                raise HTTPException(
                    status_code=429,
                    detail=f"OTP request rate limit exceeded. Please wait {remaining} seconds before requesting a new OTP."
                )

        # Generate cryptographically secure 6-digit OTP code on server ONLY
        raw_otp = str(secrets.randbelow(900000) + 100000)
        otp_hash = self._hash_otp(phone, raw_otp)

        # Invalidate previous OTP session and store new session
        new_session = OTPSession(phone=phone, otp_hash=otp_hash)
        self._sessions[phone] = new_session

        # Send via configured SMS Provider
        sms_provider = get_sms_provider()
        sms_success = await sms_provider.send_otp(phone, raw_otp)

        if not sms_success and getattr(settings, "SMS_PROVIDER", "mock").lower() != "mock":
            logger.error(f"[OTP ERROR] Failed to deliver SMS to {self.mask_phone(phone)}")

        return {
            "success": True,
            "message": f"OTP sent successfully via SMS to {self.mask_phone(phone)}",
            "phone": phone,
            "cooldown_seconds": self.cooldown_seconds,
            "expires_in_seconds": self.expire_seconds
        }

    async def verify_otp(self, raw_phone: str, submitted_otp: str) -> bool:
        """
        Verifies submitted OTP against salted hash.
        Enforces expiry and max 5 attempts limit.
        """
        phone = self.sanitize_and_validate_phone(raw_phone)
        now = time.time()

        session = self._sessions.get(phone)

        if not session:
            raise HTTPException(
                status_code=400,
                detail="No active OTP request found for this mobile number. Please request a new OTP."
            )

        # Check Expiry (5 minutes)
        if now > session.expires_at:
            del self._sessions[phone]
            raise HTTPException(
                status_code=400,
                detail="The OTP has expired. Please request a new OTP code."
            )

        # Check Max Attempts (5 attempts limit)
        if session.attempts_count >= self.max_attempts:
            del self._sessions[phone]
            raise HTTPException(
                status_code=429,
                detail="Maximum verification attempts exceeded for this OTP session. Please request a new OTP."
            )

        # Hash submitted OTP and perform constant-time comparison
        submitted_hash = self._hash_otp(phone, submitted_otp.strip())
        is_valid = hmac.compare_digest(session.otp_hash, submitted_hash)

        if not is_valid:
            session.attempts_count += 1
            remaining_attempts = self.max_attempts - session.attempts_count
            if remaining_attempts <= 0:
                del self._sessions[phone]
                raise HTTPException(
                    status_code=400,
                    detail="Invalid OTP code. Maximum attempts reached. Please request a new OTP."
                )
            raise HTTPException(
                status_code=400,
                detail=f"Invalid OTP code. {remaining_attempts} attempt(s) remaining."
            )

        # Successful Verification -> Invalidate single-use OTP session
        del self._sessions[phone]
        logger.info(f"[OTP VERIFIED] Mobile {self.mask_phone(phone)} successfully authenticated.")
        return True


otp_manager = SecureOTPManager()
