from typing import Tuple, List, Dict, Any
from backend.models.land_record import LandRecord

class CrossDatabaseValidator:
    """
    Validates the land record by cross-referencing with external government databases.
    (Mocked for demonstration purposes).
    """
    
    async def validate(self, record: LandRecord) -> Tuple[int, List[Dict[str, Any]]]:
        """
        Queries mock Bhulekh/Sub-Registrar databases to verify data.
        Returns a confidence-weighted match score (0-100) and list of issues.
        """
        issues = []
        score = 100
        
        state_code = getattr(record, 'state_code', '') or ''
        district = getattr(record, 'district', '') or ''
        survey_number = getattr(record, 'survey_number', None) or getattr(record, 'khasra_number', None) or '45/12'
        owner_name = getattr(record, 'owner_name', '') or ''
        area_sqm = getattr(record, 'area_normalized_sqm', getattr(record, 'area_sqm', None))
        
        # Simulate API call to state database
        db_record = self._mock_query_state_db(state_code, district, survey_number)
        
        if not db_record:
            issues.append({
                "field": "survey_number",
                "description": f"Survey number '{survey_number}' not found in the official state database.",
                "severity": "error"
            })
            return 0, issues # Total failure if record doesn't exist
            
        # Compare Owner Name
        if owner_name and db_record.get("owner_name"):
            claim_owner = owner_name.lower().strip()
            db_owner = db_record["owner_name"].lower().strip()
            
            if claim_owner != db_owner:
                if claim_owner in db_owner or db_owner in claim_owner:
                    issues.append({
                        "field": "owner_name",
                        "description": f"Partial match for owner name. Claimed: '{owner_name}', Official: '{db_record['owner_name']}'",
                        "severity": "warning"
                    })
                    score -= 10
                else:
                    issues.append({
                        "field": "owner_name",
                        "description": f"Owner name mismatch. Claimed: '{owner_name}', Official: '{db_record['owner_name']}'",
                        "severity": "error"
                    })
                    score -= 40
                    
        # Compare Area
        if area_sqm and db_record.get("area_sqm"):
            area_diff = abs(area_sqm - db_record["area_sqm"])
            margin = db_record["area_sqm"] * 0.05 # 5% tolerance
            if area_diff > margin:
                issues.append({
                    "field": "area_sqm",
                    "description": f"Area discrepancy. Claimed: {area_sqm} sqm, Official: {db_record['area_sqm']} sqm",
                    "severity": "error"
                })
                score -= 30
                
        # Check Encumbrances
        if db_record.get("has_encumbrance"):
            issues.append({
                "field": "general",
                "description": "Active encumbrance (e.g., bank loan) found against this property in official records.",
                "severity": "info"
            })
                
        score = max(0, min(100, score))
        return score, issues

    def _mock_query_state_db(self, state: str, district: str, survey_number: str) -> Dict[str, Any]:
        if not survey_number:
            return {}
            
        if "999" in str(survey_number):
            return {}
            
        return {
            "owner_name": "Ramesh Kumar",
            "area_sqm": 2500.0,
            "has_encumbrance": "loan" in str(survey_number).lower()
        }
