import asyncio
from typing import Optional, Dict, Any

class SubRegistrarConnector:
    """
    Connector for checking registered deeds, ECs, and stamp duty payments.
    """
    
    async def verify_registration(self, registration_no: str, sro_code: str) -> Optional[Dict[str, Any]]:
        """Verify a registered deed from Sub-Registrar Office."""
        await asyncio.sleep(0.4)
        if not registration_no:
            return None
            
        return {
            "registration_no": registration_no,
            "sro_code": sro_code,
            "deed_type": "SALE DEED",
            "execution_date": "2024-05-12",
            "consideration_amount": 5000000,
            "buyer": "Sita Devi",
            "seller": "Ram Singh",
            "status": "REGISTERED"
        }

    async def fetch_encumbrance_certificate(self, property_id: str) -> Dict[str, Any]:
        """Fetch EC details for a property to check for loans/mortgages."""
        await asyncio.sleep(0.5)
        return {
            "property_id": property_id,
            "has_encumbrance": True,
            "encumbrance_details": [
                {
                    "type": "MORTGAGE",
                    "bank_name": "State Bank of India",
                    "amount": 2500000,
                    "date": "2023-01-10",
                    "status": "ACTIVE"
                }
            ],
            "generated_on": "2026-09-04T10:00:00Z"
        }

    async def verify_stamp_duty(self, registration_no: str) -> Dict[str, Any]:
        """Verify the stamp duty paid for a registration."""
        await asyncio.sleep(0.2)
        return {
            "registration_no": registration_no,
            "stamp_duty_paid": 300000,
            "registration_fee": 50000,
            "receipt_no": "SD-998877",
            "status": "VERIFIED"
        }
