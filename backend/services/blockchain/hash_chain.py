import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple


class AuditEntry:
    """Single entry in the hash chain."""
    
    def __init__(
        self,
        index: int,
        timestamp: str,
        action: str,
        resource_type: str,
        resource_id: str,
        actor_id: str,
        actor_role: str,
        data_hash: str,
        previous_hash: str,
        metadata: Optional[Dict] = None
    ):
        self.index = index
        self.timestamp = timestamp
        self.action = action
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.actor_id = actor_id
        self.actor_role = actor_role
        self.data_hash = data_hash
        self.previous_hash = previous_hash
        self.metadata = metadata or {}
        self.entry_hash = self._compute_entry_hash()

    def _compute_entry_hash(self) -> str:
        """Compute the hash of this entry."""
        data_str = (
            f"{self.index}{self.timestamp}{self.action}{self.resource_type}"
            f"{self.resource_id}{self.actor_id}{self.actor_role}{self.data_hash}"
            f"{self.previous_hash}{json.dumps(self.metadata, sort_keys=True)}"
        )
        return hashlib.sha256(data_str.encode('utf-8')).hexdigest()
        
    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "actor_id": self.actor_id,
            "actor_role": self.actor_role,
            "data_hash": self.data_hash,
            "previous_hash": self.previous_hash,
            "entry_hash": self.entry_hash,
            "metadata": self.metadata
        }


class HashChainAuditLedger:
    def __init__(self):
        self._chain: List[AuditEntry] = []
        self._create_genesis_block()
    
    def _create_genesis_block(self):
        """Create the first block with previous_hash = '0' * 64."""
        genesis_entry = AuditEntry(
            index=0,
            timestamp=datetime.utcnow().isoformat(),
            action="GENESIS",
            resource_type="SYSTEM",
            resource_id="SYS-000",
            actor_id="SYSTEM",
            actor_role="SYSTEM",
            data_hash="0" * 64,
            previous_hash="0" * 64,
            metadata={"description": "Genesis Block"}
        )
        self._chain.append(genesis_entry)

    def add_entry(
        self,
        action: str,
        resource_type: str,
        resource_id: str,
        actor_id: str,
        actor_role: str,
        data_hash: str,
        metadata: Optional[Dict] = None
    ) -> AuditEntry:
        """Add a new entry to the chain. Returns the entry with computed hashes."""
        last_entry = self._chain[-1]
        new_entry = AuditEntry(
            index=len(self._chain),
            timestamp=datetime.utcnow().isoformat(),
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            actor_id=actor_id,
            actor_role=actor_role,
            data_hash=data_hash,
            previous_hash=last_entry.entry_hash,
            metadata=metadata
        )
        self._chain.append(new_entry)
        return new_entry
    
    def verify_chain(self) -> Tuple[bool, List[int]]:
        """Verify the entire chain integrity. Returns (is_valid, list of tampered indices)."""
        tampered_indices = []
        
        for i in range(1, len(self._chain)):
            current_entry = self._chain[i]
            previous_entry = self._chain[i - 1]
            
            # Check previous hash matches
            if current_entry.previous_hash != previous_entry.entry_hash:
                tampered_indices.append(i)
                continue
                
            # Recompute entry hash and check
            recomputed_hash = current_entry._compute_entry_hash()
            if current_entry.entry_hash != recomputed_hash:
                tampered_indices.append(i)
                
        return len(tampered_indices) == 0, tampered_indices
    
    def get_record_history(self, resource_id: str) -> List[AuditEntry]:
        """Get full audit trail for a specific record."""
        return [entry for entry in self._chain if entry.resource_id == resource_id]
    
    def detect_tampering(self, index: int) -> bool:
        """Check if a specific entry has been tampered with."""
        if index < 0 or index >= len(self._chain):
            raise ValueError("Index out of bounds")
            
        entry = self._chain[index]
        recomputed_hash = entry._compute_entry_hash()
        
        if entry.entry_hash != recomputed_hash:
            return True
            
        if index > 0:
            previous_entry = self._chain[index - 1]
            if entry.previous_hash != previous_entry.entry_hash:
                return True
                
        return False
    
    def export_chain(self) -> List[dict]:
        """Export full chain as JSON-serializable list."""
        return [entry.to_dict() for entry in self._chain]
    
    def get_chain_stats(self) -> dict:
        """Return stats: total entries, entries by action type, entries by actor, chain valid."""
        actions = {}
        actors = {}
        
        for entry in self._chain:
            actions[entry.action] = actions.get(entry.action, 0) + 1
            actors[entry.actor_id] = actors.get(entry.actor_id, 0) + 1
            
        is_valid, _ = self.verify_chain()
        
        return {
            "total_entries": len(self._chain),
            "entries_by_action": actions,
            "entries_by_actor": actors,
            "is_chain_valid": is_valid
        }
    
    @staticmethod
    def _compute_hash(data: str) -> str:
        """SHA-256 hash."""
        return hashlib.sha256(data.encode('utf-8')).hexdigest()

if __name__ == "__main__":
    # Demo: create ledger, add entries, verify, tamper with one, detect tampering
    ledger = HashChainAuditLedger()
    ledger.add_entry("CREATE", "LAND_RECORD", "LR-001", "USR-PATWARI-01", "PATWARI", "abc123hash")
    ledger.add_entry("VALIDATE", "LAND_RECORD", "LR-001", "SYSTEM", "SYSTEM", "abc123hash")
    ledger.add_entry("APPROVE", "LAND_RECORD", "LR-001", "USR-TEHSILDAR-01", "TEHSILDAR", "abc123hash")
    
    print("Chain valid:", ledger.verify_chain())
    
    # Simulate tampering
    ledger._chain[1].data_hash = "TAMPERED_HASH"
    valid, tampered = ledger.verify_chain()
    print(f"After tampering - Valid: {valid}, Tampered indices: {tampered}")
