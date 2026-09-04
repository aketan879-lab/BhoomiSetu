import hashlib
import time
from enum import Enum
from typing import Dict, Any, Optional
from fastapi import Request

class ThreatLevel(Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IntrusionDetectionService:
    def __init__(self):
        # Simple in-memory state for demonstration
        self._rate_limits: Dict[str, list] = {}
        self._failed_logins: Dict[str, list] = {}
        self._locked_accounts: set = set()

    def check_rate_limit(self, user_id: str, endpoint: str) -> bool:
        """Check if user has exceeded rate limits for an endpoint."""
        now = time.time()
        key = f"{user_id}:{endpoint}"
        
        if key not in self._rate_limits:
            self._rate_limits[key] = []
            
        # Clean up old timestamps (older than 60 seconds)
        self._rate_limits[key] = [t for t in self._rate_limits[key] if now - t < 60]
        
        # Add current timestamp
        self._rate_limits[key].append(now)
        
        # Check limit (e.g., max 100 requests per minute per endpoint)
        limit = 100
        if endpoint == "/login":
            limit = 5
            
        return len(self._rate_limits[key]) <= limit

    def detect_anomaly(self, user_id: str, action: str, metadata: Dict[str, Any]) -> ThreatLevel:
        """Detect anomalous behavior based on action and metadata."""
        if user_id in self._locked_accounts:
            return ThreatLevel.CRITICAL
            
        threat_score = 0
        
        # 1. Unusual hours check (assuming IST timezone)
        hour = metadata.get("hour_of_day")
        if hour is not None and (hour < 5 or hour > 23):
            threat_score += 10
            
        # 2. Bulk download check
        if action == "bulk_download" and metadata.get("count", 0) > 50:
            threat_score += 30
            
        # 3. Failed login attempts
        if action == "login_failed":
            if user_id not in self._failed_logins:
                self._failed_logins[user_id] = []
            self._failed_logins[user_id].append(time.time())
            
            # Count failures in last 15 mins
            recent_failures = len([t for t in self._failed_logins[user_id] if time.time() - t < 900])
            if recent_failures >= 5:
                threat_score += 50
                
        # 4. Rapid actions check
        rapid_actions = metadata.get("actions_per_minute", 0)
        if rapid_actions > 60:
            threat_score += 20
            
        # Classify threat
        if threat_score >= 50:
            return ThreatLevel.HIGH
        elif threat_score >= 30:
            return ThreatLevel.MEDIUM
        elif threat_score >= 10:
            return ThreatLevel.LOW
            
        return ThreatLevel.NONE

    def check_geo_fence(self, user_id: str, lat: float, lng: float, expected_state: str) -> bool:
        """Verify user is within allowed geographic boundaries (e.g., for Patwaris)."""
        # Mock implementation. In reality, would use a geo-spatial query/polygon check
        # For demo, just check if lat/lng are non-zero and plausible for India
        if not lat or not lng:
            return False
            
        # Rough bounding box for India
        in_india = 8.4 <= lat <= 37.6 and 68.7 <= lng <= 97.2
        
        return in_india

    def get_device_fingerprint(self, request: Request) -> str:
        """Generate a device fingerprint from request headers."""
        user_agent = request.headers.get("user-agent", "")
        accept_language = request.headers.get("accept-language", "")
        client_ip = request.client.host if request.client else ""
        
        fingerprint_data = f"{user_agent}|{accept_language}|{client_ip}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()

    async def lock_account(self, user_id: str, reason: str) -> None:
        """Lock an account due to security violations."""
        self._locked_accounts.add(user_id)
        # In a real app, update DB and maybe notify admin
        await self.report_threat({
            "type": "account_lockout",
            "user_id": user_id,
            "reason": reason,
            "timestamp": time.time()
        })

    async def report_threat(self, threat_details: Dict[str, Any]) -> None:
        """Report detected threat to security monitoring system."""
        print(f"🚨 THREAT DETECTED: {threat_details}")
        # In reality, send to Splunk/Datadog/Security Dashboard

intrusion_detection_service = IntrusionDetectionService()
