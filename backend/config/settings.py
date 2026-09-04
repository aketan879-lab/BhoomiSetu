from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables or .env file."""

    PROJECT_NAME: str = "BhumiSetu API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database — defaults to SQLite for demo (no PostgreSQL needed)
    DATABASE_URL: str = "sqlite+aiosqlite:///./bhumisetu_demo.db"

    # Redis — optional for demo
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str = "bhumisetu-dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Cloud Storage — optional for demo
    CLOUD_STORAGE_ENDPOINT: str = "http://localhost:9000"
    CLOUD_STORAGE_ACCESS_KEY: str = "minioadmin"
    CLOUD_STORAGE_SECRET_KEY: str = "minioadminpassword"
    CLOUD_STORAGE_BUCKET: str = "bhumisetu-docs"

    # Encryption
    ENCRYPTION_KEY: str = "bhumisetu-dev-encryption-key-32b"

    # Supported regional languages
    SUPPORTED_LANGUAGES: List[str] = [
        "en", "hi", "mr", "ta", "te", "bn",
        "gu", "kn", "ml", "pa", "or", "as", "ur",
    ]

    # Demo mode — uses mock data, SQLite, no external services
    DEMO_MODE: bool = True

    # SMS & OTP Provider Configuration
    SMS_PROVIDER: str = "mock"  # Options: "fast2sms", "msg91", "2factor", "twilio", "mock"
    SMS_API_KEY: str = ""
    SMS_SENDER_ID: str = "BHUMIS"
    SMS_TEMPLATE_ID: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_PHONE: str = ""

    # OTP Security Parameters
    OTP_EXPIRE_SECONDS: int = 300       # 5 minutes expiry
    OTP_COOLDOWN_SECONDS: int = 60      # 60-second resend cooldown
    OTP_MAX_ATTEMPTS: int = 5           # Max 5 failed attempts allowed
    OTP_SALT: str = "bhumisetu_secure_otp_salt_2026"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
