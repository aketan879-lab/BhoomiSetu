import asyncio
from typing import List, Dict, Any
from backend.models.land_record import LandRecord

class UrbanValidator:
    """
    Runs specific validations for urban land records.
    """
    
    async def validate(self, record: LandRecord) -> List[Dict[str, Any]]:
        """Run all urban-specific checks on the record."""
        issues = []
        
        # 1. RERA Compliance
        rera_status = await self._check_rera_compliance(record)
        if not rera_status.get("is_compliant"):
            issues.append({
                "check": "RERA Registration",
                "status": "CRITICAL",
                "message": f"RERA verification failed: {rera_status.get('reason')}"
            })
            
        # 2. Municipal Tax Check
        tax_due = await self._check_municipal_tax(record)
        if tax_due > 0:
            issues.append({
                "check": "Municipal Tax",
                "status": "WARNING",
                "message": f"Pending property tax dues: ₹{tax_due}"
            })
            
        # 3. FSI/FAR limits
        if not await self._check_fsi_limits(record):
            issues.append({
                "check": "FSI/FAR Limit",
                "status": "WARNING",
                "message": "Constructed area exceeds permitted Floor Space Index."
            })
            
        return issues

    async def _check_rera_compliance(self, record: LandRecord) -> Dict[str, Any]:
        await asyncio.sleep(0.2)
        # Mock logic
        return {"is_compliant": True, "reason": ""}

    async def _check_municipal_tax(self, record: LandRecord) -> float:
        await asyncio.sleep(0.2)
        # Mock logic: random dues based on ID
        if "MOCK" in str(record.id):
            return 15000.0
        return 0.0

    async def _check_fsi_limits(self, record: LandRecord) -> bool:
        await asyncio.sleep(0.1)
        return True
