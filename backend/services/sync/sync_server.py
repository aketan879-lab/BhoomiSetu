import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import uuid

class SyncOperation(Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"

@dataclass
class SyncChange:
    record_id: str
    record_type: str
    operation: SyncOperation
    data: Dict[str, Any]
    timestamp: datetime
    device_id: str
    id: str = None
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())

@dataclass
class SyncStatus:
    last_sync_at: Optional[datetime]
    pending_changes: int
    connectivity_tier: str

@dataclass
class SyncResult:
    success: bool
    applied_changes: int
    conflicts: int
    errors: List[str]

class SyncService:
    def __init__(self):
        # Mock database for sync changes (Event Sourcing pattern)
        self._changes_db: List[SyncChange] = []
        # Mock device sync state
        self._device_state: Dict[str, datetime] = {}
        # Mock current state of records (Materialized view)
        self._records_db: Dict[str, Dict[str, Any]] = {}

    async def push_changes(self, device_id: str, changes: List[SyncChange]) -> SyncResult:
        """Process changes pushed from a client device (offline-first sync)."""
        if not changes:
            return SyncResult(True, 0, 0, [])
            
        # Sort by timestamp to apply in order
        sorted_changes = sorted(changes, key=lambda x: x.timestamp)
        
        # Prioritize ownership changes (business logic)
        ownership_changes = [c for c in sorted_changes if c.record_type == "ownership"]
        other_changes = [c for c in sorted_changes if c.record_type != "ownership"]
        
        prioritized_changes = ownership_changes + other_changes
        
        applied = 0
        conflicts = 0
        errors = []
        
        for change in prioritized_changes:
            try:
                # Store the change event
                self._changes_db.append(change)
                
                # Apply to materialized view
                record_key = f"{change.record_type}_{change.record_id}"
                
                if change.operation == SyncOperation.CREATE:
                    if record_key in self._records_db:
                        # Conflict: Record already exists
                        server_record = self._records_db[record_key]
                        resolved = await self.resolve_conflict(server_record, change.data)
                        self._records_db[record_key] = resolved
                        conflicts += 1
                    else:
                        self._records_db[record_key] = change.data
                        applied += 1
                        
                elif change.operation == SyncOperation.UPDATE:
                    if record_key in self._records_db:
                        server_record = self._records_db[record_key]
                        
                        # Delta sync: only apply provided fields
                        resolved = await self.resolve_conflict(server_record, change.data)
                        self._records_db[record_key] = resolved
                        applied += 1
                    else:
                        # Cannot update non-existent record
                        errors.append(f"Cannot update missing record {record_key}")
                        
                elif change.operation == SyncOperation.DELETE:
                    if record_key in self._records_db:
                        del self._records_db[record_key]
                        applied += 1
                        
            except Exception as e:
                errors.append(f"Failed to process change {change.id}: {str(e)}")
                
        # Update device last sync time
        self._device_state[device_id] = datetime.utcnow()
        
        return SyncResult(
            success=len(errors) == 0,
            applied_changes=applied,
            conflicts=conflicts,
            errors=errors
        )

    async def pull_changes(self, device_id: str, last_sync_at: Optional[datetime]) -> List[SyncChange]:
        """Provide changes to a client device that occurred after last_sync_at."""
        if not last_sync_at:
            # Full initial sync - provide all current state as CREATE events
            result = []
            for key, data in self._records_db.items():
                record_type, record_id = key.split('_', 1)
                result.append(SyncChange(
                    record_id=record_id,
                    record_type=record_type,
                    operation=SyncOperation.CREATE,
                    data=data,
                    timestamp=datetime.utcnow(),
                    device_id="server"
                ))
            
            self._device_state[device_id] = datetime.utcnow()
            return result
            
        # Delta sync: Return only events since last sync (excluding events from this device)
        changes = [
            c for c in self._changes_db 
            if c.timestamp > last_sync_at and c.device_id != device_id
        ]
        
        self._device_state[device_id] = datetime.utcnow()
        return changes

    async def resolve_conflict(self, server_record: Dict[str, Any], client_record: Dict[str, Any]) -> Dict[str, Any]:
        """Resolve conflict using Last-Write-Wins (LWW) with admin override."""
        # Simple Last-Write-Wins on a per-field basis
        resolved = server_record.copy()
        
        # Check for admin override flag
        is_admin_override = client_record.get("_admin_override", False)
        
        server_ts = server_record.get("_updated_at", datetime.min)
        client_ts = client_record.get("_updated_at", datetime.utcnow())
        
        if is_admin_override or client_ts >= server_ts:
            # Client wins (delta update)
            for k, v in client_record.items():
                if k not in ["_admin_override"]:
                    resolved[k] = v
                    
        return resolved

    async def get_sync_status(self, device_id: str) -> SyncStatus:
        """Get the current sync status for a device."""
        last_sync = self._device_state.get(device_id)
        
        pending = 0
        if last_sync:
            pending = len([
                c for c in self._changes_db 
                if c.timestamp > last_sync and c.device_id != device_id
            ])
            
        # Determine tier based on time since last sync
        tier = "ONLINE"
        if last_sync:
            hours_since = (datetime.utcnow() - last_sync).total_seconds() / 3600
            if hours_since > 24:
                tier = "OFFLINE_STALE"
            elif hours_since > 1:
                tier = "OFFLINE"
                
        return SyncStatus(
            last_sync_at=last_sync,
            pending_changes=pending,
            connectivity_tier=tier
        )

sync_service = SyncService()
