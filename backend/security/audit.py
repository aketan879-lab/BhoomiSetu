import hashlib
import json
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import Request

from backend.models.audit_log import AuditLog, AuditAction

class AuditService:
    def __init__(self):
        self._audit_store: List[AuditLog] = []
        self._blockchain_mocks: Dict[str, str] = {}

    async def log_action(
        self, 
        user_id: str, 
        action: AuditAction, 
        resource_type: str, 
        resource_id: str, 
        details: Dict[str, Any], 
        request: Optional[Request] = None
    ) -> AuditLog:
        """Log an action with automatic capture of IP, GPS, and device info."""
        
        ip_address = "unknown"
        user_agent = "unknown"
        gps_location = None
        
        if request:
            ip_address = request.client.host if request.client else "unknown"
            user_agent = request.headers.get("user-agent", "unknown")
            gps_location = request.headers.get("x-gps-location")

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            gps_location=gps_location
        )
        
        # In a real app, save to DB
        self._audit_store.append(audit_entry)
        
        # For critical actions, store hash on blockchain
        if action in [AuditAction.UPDATE, AuditAction.DELETE, AuditAction.APPROVE]:
            entry_hash = self.generate_blockchain_hash(audit_entry)
            tx_hash = await self.store_on_blockchain(entry_hash)
            audit_entry.blockchain_tx_hash = tx_hash
            
        return audit_entry

    async def get_audit_trail(self, resource_type: str, resource_id: str) -> List[AuditLog]:
        """Get the audit trail for a specific resource."""
        return [
            log for log in self._audit_store 
            if log.resource_type == resource_type and log.resource_id == resource_id
        ]

    async def get_user_activity(self, user_id: str, start_date: datetime, end_date: datetime) -> List[AuditLog]:
        """Get activity log for a specific user within a date range."""
        return [
            log for log in self._audit_store 
            if log.user_id == user_id and start_date <= log.timestamp <= end_date
        ]

    def generate_blockchain_hash(self, audit_entry: AuditLog) -> str:
        """Generate a SHA-256 hash of the audit entry for immutable ledger."""
        data = {
            "id": audit_entry.id,
            "timestamp": audit_entry.timestamp.isoformat(),
            "user_id": audit_entry.user_id,
            "action": audit_entry.action.value,
            "resource_type": audit_entry.resource_type,
            "resource_id": audit_entry.resource_id,
        }
        serialized = json.dumps(data, sort_keys=True)
        return hashlib.sha256(serialized.encode()).hexdigest()

    async def store_on_blockchain(self, audit_hash: str) -> str:
        """Mock storing hash on a blockchain network."""
        import asyncio
        await asyncio.sleep(0.1) # Simulate network call
        tx_hash = f"0x{hashlib.sha256((audit_hash + str(datetime.utcnow())).encode()).hexdigest()}"
        self._blockchain_mocks[tx_hash] = audit_hash
        return tx_hash

class AuditMiddleware:
    """Middleware to automatically log all API requests."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Implementation depends on ASGI framework
        # Would intercept requests, extract user, and log the action
        await self.app(scope, receive, send)

audit_service = AuditService()
