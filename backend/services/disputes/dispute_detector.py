import asyncio
from typing import List
from backend.models.land_record import LandRecord
from backend.models.validation_report import ValidationReport, RiskLevel
from backend.models.dispute import Dispute, DisputeType, DisputeStatus
import uuid
from datetime import datetime, timezone

class DisputeDetector:
    """
    Automatically detects potential disputes based on validation reports.
    """
    
    async def detect_disputes(self, record: LandRecord, report: ValidationReport) -> List[Dispute]:
        """Map validation issues to formalized dispute cases."""
        disputes = []
        
        for issue in report.issues:
            # Map rule IDs or types to DisputeTypes
            dispute_type = self._map_issue_to_type(issue.get("type", ""))
            
            if dispute_type:
                priority = "HIGH" if report.risk_level == RiskLevel.HIGH else "MEDIUM"
                
                dispute = Dispute(
                    id=str(uuid.uuid4()),
                    record_id=record.id,
                    type=dispute_type,
                    status=DisputeStatus.OPEN,
                    title=f"Auto-detected: {issue.get('title', 'Validation Issue')}",
                    description=issue.get("description", "Detected during automated validation."),
                    priority=priority,
                    reported_by="SYSTEM",
                    reported_at=datetime.now(timezone.utc)
                )
                disputes.append(dispute)
                
        return disputes

    def _map_issue_to_type(self, issue_type: str) -> DisputeType:
        """Heuristic mapping from validation issue to dispute category."""
        mapping = {
            "OWNERSHIP_MISMATCH": DisputeType.TITLE,
            "BOUNDARY_OVERLAP": DisputeType.BOUNDARY,
            "AREA_MISMATCH": DisputeType.AREA,
            "ENCUMBRANCE_FOUND": DisputeType.ENCUMBRANCE,
            "FOREST_ENCROACHMENT": DisputeType.ENCROACHMENT
        }
        return mapping.get(issue_type, None)
