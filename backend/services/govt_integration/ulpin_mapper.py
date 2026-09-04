import asyncio
import uuid
from typing import Optional
from backend.models.land_record import LandRecord

class ULPINMapper:
    """
    Service to map land records to ULPIN (Unique Land Parcel Identification Number).
    """
    
    async def get_ulpin(self, state: str, district: str, survey_no: str) -> Optional[str]:
        """Fetch existing ULPIN for a land parcel."""
        await asyncio.sleep(0.1)
        # Mock database lookup
        if survey_no == "000":
            return None
        return f"14-{state.upper()[:2]}-{district.upper()[:3]}-{survey_no.zfill(4)}"

    async def map_record_to_ulpin(self, record: LandRecord) -> str:
        """Map a digitized record to ULPIN, generating a new one if it doesn't exist."""
        # Simple mock logic
        existing = await self.get_ulpin(record.state, record.district, record.survey_number)
        if existing:
            return existing
        return self.generate_ulpin(record.state, record.district, record.survey_number)

    def generate_ulpin(self, state_code: str, district_code: str, plot_id: str) -> str:
        """Generate a new ULPIN (Format: XX-XX-XXXX-XXXXX)."""
        # A pseudo-standard mock format
        s_code = state_code[:2].upper().zfill(2)
        d_code = district_code[:2].upper().zfill(2)
        p_code = str(uuid.uuid4().int)[:4]
        uniq = str(uuid.uuid4().int)[:5]
        return f"{s_code}-{d_code}-{p_code}-{uniq}"
