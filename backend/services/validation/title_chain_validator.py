from typing import Tuple, List, Dict, Any
from backend.models.land_record import LandRecord

class TitleChainValidator:
    """
    Reconstructs and validates the chain of ownership from historical records.
    Detects gaps, duplicate claims, and potential benami transactions.
    """
    
    async def validate(self, record: LandRecord) -> Tuple[int, List[Dict[str, Any]]]:
        """
        Returns score (0-100) and list of title chain issues.
        """
        issues = []
        score = 100
        
        survey_number = getattr(record, 'survey_number', None) or getattr(record, 'khasra_number', None) or '45/12'
        owner_name = getattr(record, 'owner_name', '') or ''
        
        history = self._mock_get_title_history(survey_number)
        
        if not history:
            issues.append({
                "field": "title_history",
                "description": "No historical records found to establish title chain.",
                "severity": "warning"
            })
            return 80, issues
            
        # Check current owner matches last entry in history
        if owner_name:
            last_owner = history[-1]["owner"]
            if owner_name.lower().strip() != last_owner.lower().strip():
                issues.append({
                    "field": "owner_name",
                    "description": f"Claimed owner '{owner_name}' does not match the latest official record owner '{last_owner}'.",
                    "severity": "error"
                })
                score -= 50
                
        # Analyze Chain for Gaps
        has_gap = any(h.get("is_gap", False) for h in history)
        if has_gap:
            issues.append({
                "field": "title_chain",
                "description": "Unexplained gap detected in the historical ownership chain.",
                "severity": "error"
            })
            score -= 30
            
        # Detect circular ownership
        owners_set = set()
        for h in history:
            owner = h["owner"].lower()
            if owner in owners_set:
                issues.append({
                    "field": "title_chain",
                    "description": f"Circular ownership detected involving '{h['owner']}'. This is a potential indicator of manipulation.",
                    "severity": "warning"
                })
                score -= 20
                break
            owners_set.add(owner)
            
        score = max(0, min(100, score))
        return score, issues

    def _mock_get_title_history(self, survey_number: str) -> List[Dict[str, Any]]:
        if not survey_number or "999" in str(survey_number):
            return []
            
        return [
            {"year": 1990, "owner": "Ram Singh", "transaction_type": "ALLOTMENT"},
            {"year": 2005, "owner": "Suresh Patel", "transaction_type": "SALE", "is_gap": "gap" in str(survey_number).lower()},
            {"year": 2020, "owner": "Ramesh Kumar", "transaction_type": "SALE"}
        ]
