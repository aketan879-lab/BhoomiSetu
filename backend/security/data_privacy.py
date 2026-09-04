from typing import Dict, Any, List
from backend.models.user import UserRole
import json

class DataPrivacyService:
    """Service to handle DPDP Act compliance and PII masking."""
    
    def mask_aadhaar(self, aadhaar: str) -> str:
        """Mask Aadhaar number (e.g. XXXX-XXXX-1234)."""
        if not aadhaar or len(aadhaar.replace("-", "").replace(" ", "")) != 12:
            return aadhaar
            
        clean_aadhaar = aadhaar.replace("-", "").replace(" ", "")
        return f"XXXX-XXXX-{clean_aadhaar[-4:]}"

    def mask_phone(self, phone: str) -> str:
        """Mask phone number (e.g. XXXXXX7890)."""
        if not phone or len(phone) < 10:
            return phone
            
        return f"{'X' * (len(phone) - 4)}{phone[-4:]}"

    def mask_name(self, name: str) -> str:
        """Mask name partially (e.g. R***h K***r)."""
        if not name:
            return name
            
        parts = name.split()
        masked_parts = []
        
        for part in parts:
            if len(part) <= 2:
                masked_parts.append(part)
            else:
                masked_parts.append(f"{part[0]}{'*' * (len(part) - 2)}{part[-1]}")
                
        return " ".join(masked_parts)

    def apply_role_masking(self, record: Dict[str, Any], user_role: UserRole) -> Dict[str, Any]:
        """Apply data masking based on the user's role."""
        masked_record = record.copy()
        
        # System admins and authorized officials see full data
        if user_role in [UserRole.SYSTEM_ADMIN, UserRole.DISTRICT_COLLECTOR]:
            return masked_record
            
        # Apply masking rules for standard users/citizens
        if "owner_aadhaar" in masked_record:
            masked_record["owner_aadhaar"] = self.mask_aadhaar(masked_record["owner_aadhaar"])
            
        if "owner_phone" in masked_record:
            masked_record["owner_phone"] = self.mask_phone(masked_record["owner_phone"])
            
        # Only heavily mask names for non-authenticated public views
        if user_role == UserRole.CITIZEN and not masked_record.get("is_owner", False):
            if "owner_name" in masked_record:
                masked_record["owner_name"] = self.mask_name(masked_record["owner_name"])
                
        return masked_record

    def export_user_data(self, user_id: str) -> Dict[str, Any]:
        """DPDP Act: Right to Access - Export all user data."""
        # Mock fetching all user data from DB
        return {
            "user_profile": {
                "id": user_id,
                "name": "Rajesh Kumar",
                "phone": "9876543210",
                "created_at": "2023-01-15T10:00:00Z"
            },
            "consents": [
                {"purpose": "land_record_linking", "granted": True, "date": "2023-01-15T10:05:00Z"},
                {"purpose": "sms_notifications", "granted": True, "date": "2023-01-15T10:05:00Z"}
            ],
            "activity_log": [
                {"action": "VIEW_RECORD", "timestamp": "2024-02-10T14:30:00Z"}
            ]
        }

    def delete_user_data(self, user_id: str) -> bool:
        """DPDP Act: Right to Erasure - Delete or anonymize user data."""
        # Mock deletion process
        # In reality, this would anonymize PII but preserve transaction history for legal reasons
        print(f"Initiating data erasure for user {user_id} in compliance with DPDP Act")
        return True

    def log_consent(self, user_id: str, purpose: str, granted: bool) -> None:
        """Log user consent for specific data usage purposes."""
        # Mock storing consent
        print(f"Consent logged: User={user_id}, Purpose={purpose}, Granted={granted}")

data_privacy_service = DataPrivacyService()
