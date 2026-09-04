from typing import Tuple, List, Dict, Any
from backend.models.land_record import LandRecord
from backend.models.validation_report import AnomalyRiskLevel

class AnomalyDetector:
    """
    Detects complex anomalies and fraudulent patterns using heuristic rules.
    """
    
    async def validate(self, record: LandRecord) -> Tuple[AnomalyRiskLevel, List[Dict[str, Any]]]:
        """
        Evaluates record for anomalies. Returns the determined AnomalyRiskLevel and a list of issues.
        """
        issues = []
        risk_score = 0 # Higher means higher risk
        
        survey_no = getattr(record, 'survey_number', '') or ''
        mock_meta = self._mock_get_metadata(str(survey_no))
        
        # 1. Rapid Ownership Changes
        if mock_meta["transfers_last_5_years"] > 2:
            issues.append({
                "field": "fraud_pattern",
                "description": f"High frequency of ownership changes ({mock_meta['transfers_last_5_years']} times in 5 years).",
                "severity": "warning"
            })
            risk_score += 40
            
        # 2. Undervalued Stamp Duty
        if mock_meta["stamp_duty_paid"] and mock_meta["estimated_market_duty"]:
            if mock_meta["stamp_duty_paid"] < mock_meta["estimated_market_duty"] * 0.7:
                issues.append({
                    "field": "financial",
                    "description": "Stamp duty paid is significantly lower than the estimated market rate.",
                    "severity": "warning"
                })
                risk_score += 30
                
        # 3. Bulk Modifications by Same Official
        if mock_meta["modified_by_flagged_official"]:
            issues.append({
                "field": "audit",
                "description": "Record was recently modified by an official currently flagged for suspicious bulk edits.",
                "severity": "error"
            })
            risk_score += 60

        # Determine Risk Level
        if risk_score >= 80:
            level = AnomalyRiskLevel.HIGH
        elif risk_score >= 40:
            level = AnomalyRiskLevel.MEDIUM
        else:
            level = AnomalyRiskLevel.LOW
            
        return level, issues

    def _mock_get_metadata(self, survey_number: str) -> Dict[str, Any]:
        is_suspicious = "fraud" in str(survey_number).lower()
        return {
            "transfers_last_5_years": 3 if is_suspicious else 1,
            "stamp_duty_paid": 50000 if is_suspicious else 150000,
            "estimated_market_duty": 150000,
            "modified_by_flagged_official": is_suspicious
        }
