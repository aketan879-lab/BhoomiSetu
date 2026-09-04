import httpx
import asyncio
from typing import Optional, Dict, Any
from backend.models.land_record import LandRecord

class DILRMPConnector:
    """
    Connector for Digital India Land Record Modernization Programme (DILRMP).
    Mocks the API interactions for demo purposes.
    """
    def __init__(self, base_url: str = "https://mock-dilrmp.gov.in/api"):
        self.base_url = base_url

    async def fetch_record(self, state_code: str, district: str, survey_number: str) -> Optional[Dict[str, Any]]:
        """Fetch land record from DILRMP based on state, district, and survey number."""
        # Mocking an async HTTP call
        await asyncio.sleep(0.5)
        
        # Mock data
        if survey_number == "INVALID":
            return None
            
        return {
            "ulpin": f"10-{state_code}-{district}-{survey_number}",
            "state": state_code,
            "district": district,
            "survey_no": survey_number,
            "area_sqm": 1500.50,
            "land_type": "AGRICULTURAL",
            "owner_details": [
                {"name": "Ramesh Kumar", "share": 100.0}
            ],
            "last_updated": "2025-01-15T10:00:00Z"
        }

    async def push_digitized_record(self, record: LandRecord) -> bool:
        """Push digitized and validated record back to DILRMP database."""
        await asyncio.sleep(0.5)
        # Mock success response
        return True

    async def check_mutation_status(self, mutation_id: str) -> str:
        """Check the status of a pending mutation request."""
        await asyncio.sleep(0.2)
        # Mocking random status based on length of mutation_id
        if len(mutation_id) % 2 == 0:
            return "APPROVED"
        return "PENDING"
