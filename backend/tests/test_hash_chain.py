import pytest
from backend.services.blockchain.hash_chain import HashChainAuditLedger

@pytest.fixture
def ledger():
    return HashChainAuditLedger()

def test_genesis_block(ledger):
    assert len(ledger._chain) == 1
    genesis = ledger._chain[0]
    assert genesis.action == "GENESIS"
    assert genesis.previous_hash == "0" * 64

def test_add_entries_and_verify(ledger):
    ledger.add_entry("CREATE", "LAND_RECORD", "LR-001", "USR-01", "FARMER", "hash1")
    ledger.add_entry("UPDATE", "LAND_RECORD", "LR-001", "USR-02", "PATWARI", "hash2")
    ledger.add_entry("VALIDATE", "LAND_RECORD", "LR-001", "SYS-01", "SYSTEM", "hash3")
    ledger.add_entry("APPROVE", "LAND_RECORD", "LR-001", "USR-03", "TEHSILDAR", "hash4")
    ledger.add_entry("MUTATION", "LAND_RECORD", "LR-001", "USR-02", "PATWARI", "hash5")
    
    assert len(ledger._chain) == 6 # 1 genesis + 5 entries
    is_valid, tampered = ledger.verify_chain()
    assert is_valid is True
    assert len(tampered) == 0

def test_tamper_data_hash(ledger):
    ledger.add_entry("CREATE", "LAND_RECORD", "LR-001", "USR-01", "FARMER", "hash1")
    ledger.add_entry("UPDATE", "LAND_RECORD", "LR-001", "USR-02", "PATWARI", "hash2")
    
    # Tamper data
    ledger._chain[1].data_hash = "TAMPERED"
    
    is_valid, tampered = ledger.verify_chain()
    assert is_valid is False
    assert 1 in tampered
    
    assert ledger.detect_tampering(1) is True

def test_tamper_entry_hash(ledger):
    ledger.add_entry("CREATE", "LAND_RECORD", "LR-001", "USR-01", "FARMER", "hash1")
    ledger.add_entry("UPDATE", "LAND_RECORD", "LR-001", "USR-02", "PATWARI", "hash2")
    
    # Tamper entry hash
    ledger._chain[1].entry_hash = "TAMPERED_ENTRY_HASH"
    
    is_valid, tampered = ledger.verify_chain()
    assert is_valid is False
    assert 1 in tampered

def test_get_record_history(ledger):
    ledger.add_entry("CREATE", "LAND_RECORD", "LR-111", "USR-01", "FARMER", "hash1")
    ledger.add_entry("CREATE", "LAND_RECORD", "LR-222", "USR-02", "FARMER", "hash2")
    ledger.add_entry("UPDATE", "LAND_RECORD", "LR-111", "USR-01", "FARMER", "hash3")
    
    history_111 = ledger.get_record_history("LR-111")
    assert len(history_111) == 2
    
    history_222 = ledger.get_record_history("LR-222")
    assert len(history_222) == 1
    assert history_222[0].resource_id == "LR-222"

def test_get_chain_stats(ledger):
    ledger.add_entry("CREATE", "LAND_RECORD", "LR-001", "USR-01", "FARMER", "h1")
    ledger.add_entry("UPDATE", "LAND_RECORD", "LR-001", "USR-02", "PATWARI", "h2")
    
    stats = ledger.get_chain_stats()
    assert stats["total_entries"] == 3 # 1 genesis + 2 entries
    assert stats["entries_by_action"]["CREATE"] == 1
    assert stats["entries_by_action"]["UPDATE"] == 1
    assert stats["entries_by_action"]["GENESIS"] == 1
    assert stats["entries_by_actor"]["USR-01"] == 1
    assert stats["entries_by_actor"]["USR-02"] == 1
    assert stats["is_chain_valid"] is True
