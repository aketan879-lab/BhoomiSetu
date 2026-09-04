import os
import hashlib
import hmac
import base64
from typing import Dict, Any
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag

from backend.config.settings import settings

class EncryptionService:
    def __init__(self):
        # Initialize with current key, and keep previous keys for rotation
        self.current_key_id = "v1"
        self._keys = {
            "v1": getattr(settings, "ENCRYPTION_KEY", os.urandom(32))
        }
        
        # Ensure keys are 32 bytes for AES-256
        for kid, key in self._keys.items():
            if isinstance(key, str):
                key = key.encode()
            if len(key) < 32:
                key = hashlib.sha256(key).digest()
            elif len(key) > 32:
                key = key[:32]
            self._keys[kid] = key

    def encrypt_field(self, plaintext: str) -> str:
        """Encrypt sensitive fields using AES-256-GCM."""
        if not plaintext:
            return plaintext
            
        aesgcm = AESGCM(self._keys[self.current_key_id])
        nonce = os.urandom(12)
        
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)
        
        # Format: key_id:nonce:ciphertext
        encoded_nonce = base64.b64encode(nonce).decode()
        encoded_cipher = base64.b64encode(ciphertext).decode()
        
        return f"{self.current_key_id}:{encoded_nonce}:{encoded_cipher}"

    def decrypt_field(self, ciphertext: str) -> str:
        """Decrypt sensitive fields supporting key rotation."""
        if not ciphertext or ':' not in ciphertext:
            return ciphertext # Not encrypted or invalid format
            
        try:
            parts = ciphertext.split(':', 2)
            if len(parts) != 3:
                return ciphertext
                
            key_id, encoded_nonce, encoded_cipher = parts
            
            if key_id not in self._keys:
                raise ValueError(f"Unknown encryption key ID: {key_id}")
                
            nonce = base64.b64decode(encoded_nonce)
            cipher_bytes = base64.b64decode(encoded_cipher)
            
            aesgcm = AESGCM(self._keys[key_id])
            plaintext = aesgcm.decrypt(nonce, cipher_bytes, None)
            
            return plaintext.decode()
        except (InvalidTag, ValueError, Exception) as e:
            # In a real app, log error. For now, raise
            raise ValueError(f"Decryption failed: {str(e)}")

    def encrypt_file(self, file_bytes: bytes) -> bytes:
        """Encrypt full file/document bytes."""
        aesgcm = AESGCM(self._keys[self.current_key_id])
        nonce = os.urandom(12)
        
        ciphertext = aesgcm.encrypt(nonce, file_bytes, None)
        
        # Prepend key_id (length 2) + nonce (12 bytes) + ciphertext
        key_id_bytes = self.current_key_id.encode().ljust(2, b'\0')
        return key_id_bytes + nonce + ciphertext

    def decrypt_file(self, encrypted_bytes: bytes) -> bytes:
        """Decrypt full file/document bytes."""
        if len(encrypted_bytes) < 14:
            raise ValueError("Invalid encrypted file data")
            
        key_id = encrypted_bytes[:2].decode().rstrip('\0')
        nonce = encrypted_bytes[2:14]
        ciphertext = encrypted_bytes[14:]
        
        if key_id not in self._keys:
            raise ValueError(f"Unknown encryption key ID: {key_id}")
            
        aesgcm = AESGCM(self._keys[key_id])
        return aesgcm.decrypt(nonce, ciphertext, None)

    def hash_data(self, data: str) -> str:
        """Generate SHA-256 hash for integrity checks."""
        return hashlib.sha256(data.encode()).hexdigest()

    def generate_document_hash(self, record_data: Dict[str, Any]) -> str:
        """Generate a deterministic hash of a document for blockchain verification."""
        import json
        # Sort keys to ensure deterministic serialization
        serialized = json.dumps(record_data, sort_keys=True, separators=(',', ':'))
        return self.hash_data(serialized)

encryption_service = EncryptionService()
