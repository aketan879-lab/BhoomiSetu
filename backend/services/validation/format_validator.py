from typing import Tuple, List, Dict, Any
from backend.models.land_record import LandRecord

class FormatValidator:
    """
    Validates the format and basic structural integrity of a land record.
    Checks for mandatory fields, valid value ranges, and state-specific format rules.
    """
    
    async def validate(self, record: LandRecord) -> Tuple[int, List[Dict[str, Any]]]:
        """
        Runs format validation on the given record.
        Returns a score (0-100) and a list of identified issues.
        """
        issues = []
        score = 100
        
        # 1. Mandatory Fields Check
        mandatory_fields = ['state_code', 'district', 'village', 'owner_name', 'record_type']
        for field in mandatory_fields:
            if not getattr(record, field, None):
                issues.append({
                    "field": field,
                    "description": f"Mandatory field '{field}' is missing or empty.",
                    "severity": "error"
                })
                score -= 15
                
        # 2. Survey Number Format Check based on State
        state_code = getattr(record, 'state_code', None)
        survey_number = getattr(record, 'survey_number', None) or getattr(record, 'khasra_number', None)
        
        if state_code and survey_number:
            state = state_code.upper()
            if state == "MH" and not self._is_valid_mh_gat(survey_number):
                issues.append({
                    "field": "survey_number",
                    "description": f"Survey/Gat number '{survey_number}' does not match standard Maharashtra format.",
                    "severity": "warning"
                })
                score -= 5
            elif state == "UP" and not self._is_valid_up_khasra(survey_number):
                issues.append({
                    "field": "survey_number",
                    "description": f"Khasra number '{survey_number}' does not match standard Uttar Pradesh format.",
                    "severity": "warning"
                })
                score -= 5

        # 3. Value Range Checks
        area_sqm = getattr(record, 'area_normalized_sqm', getattr(record, 'area_sqm', None))
        if area_sqm is not None:
            if area_sqm <= 0:
                issues.append({
                    "field": "area_sqm",
                    "description": "Area must be greater than zero.",
                    "severity": "error"
                })
                score -= 20
            elif area_sqm > 1000000: # 100 Hectares
                issues.append({
                    "field": "area_sqm",
                    "description": "Area is unusually large (>100 Hectares). Flagged for manual review.",
                    "severity": "warning"
                })
                score -= 5
                
        # Cap score between 0 and 100
        score = max(0, min(100, score))
        return score, issues

    def _is_valid_mh_gat(self, val: str) -> bool:
        import re
        return bool(re.match(r"^\d+(?:/[a-zA-Z0-9]+)?$", str(val)))

    def _is_valid_up_khasra(self, val: str) -> bool:
        import re
        return bool(re.match(r"^\d+(?:/[0-9]+)?[a-zA-Z]?$", str(val)))
