import pytest
from backend.security.encryption import EncryptionService
from backend.security.data_privacy import DataPrivacyService

@pytest.fixture
def encryption_service():
    return EncryptionService()

@pytest.fixture
def privacy_service():
    return DataPrivacyService()

def test_encryption_roundtrip(encryption_service):
    plaintext = "Sensitive Data 123"
    encrypted = encryption_service.encrypt_field(plaintext)
    assert encrypted != plaintext
    
    decrypted = encryption_service.decrypt_field(encrypted)
    assert decrypted == plaintext

def test_encryption_empty_string(encryption_service):
    plaintext = ""
    encrypted = encryption_service.encrypt_field(plaintext)
    decrypted = encryption_service.decrypt_field(encrypted)
    assert decrypted == plaintext

def test_encrypt_decrypt_file(encryption_service):
    raw_bytes = b"file content 12345"
    encrypted_bytes = encryption_service.encrypt_file(raw_bytes)
    assert encrypted_bytes != raw_bytes
    
    decrypted_bytes = encryption_service.decrypt_file(encrypted_bytes)
    assert decrypted_bytes == raw_bytes

def test_hash_data_determinism(encryption_service):
    data = "test data"
    hash1 = encryption_service.hash_data(data)
    hash2 = encryption_service.hash_data(data)
    assert hash1 == hash2

def test_generate_document_hash_determinism(encryption_service):
    data = {"owner": "Ramesh", "khasra": "45/12"}
    hash1 = encryption_service.generate_document_hash(data)
    hash2 = encryption_service.generate_document_hash(data)
    assert hash1 == hash2

def test_data_privacy_masking(privacy_service):
    masked_aadhaar = privacy_service.mask_aadhaar("123456789012")
    assert masked_aadhaar.endswith("9012")
    assert "X" in masked_aadhaar
    
    masked_phone = privacy_service.mask_phone("9876543210")
    assert masked_phone.endswith("3210")
    assert "X" in masked_phone
