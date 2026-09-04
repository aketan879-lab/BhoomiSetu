from typing import Dict, Any, List
from datetime import datetime
from backend.models.land_record import LandRecord
from backend.models.validation_report import ValidationReport, AnomalyRiskLevel, OverallStatus

class ReportGenerator:
    """
    Compiles results from all validation layers into a final comprehensive report.
    """
    
    def generate_report(
        self, 
        record: LandRecord, 
        format_result: tuple, 
        cross_db_result: tuple, 
        spatial_result: tuple, 
        title_result: tuple, 
        anomaly_result: tuple
    ) -> ValidationReport:
        
        f_score, f_issues = format_result
        cdb_score, cdb_issues = cross_db_result
        sp_score, sp_issues = spatial_result
        tc_score, tc_issues = title_result
        risk_level, an_issues = anomaly_result
        
        # Calculate aggregate score (weighted average)
        agg_score = (f_score * 0.1) + (cdb_score * 0.4) + (sp_score * 0.25) + (tc_score * 0.25)
        confidence_score = round(agg_score, 2)
        
        # Combine all issues
        all_issues = []
        for issues_list in [f_issues, cdb_issues, sp_issues, tc_issues, an_issues]:
            all_issues.extend(issues_list)
            
        # Determine Overall Status
        overall_status = OverallStatus.AUTO_APPROVED
        if risk_level in [AnomalyRiskLevel.HIGH, AnomalyRiskLevel.CRITICAL] or confidence_score < 50:
            overall_status = OverallStatus.ESCALATED
        elif risk_level == AnomalyRiskLevel.MEDIUM or confidence_score < 80:
            overall_status = OverallStatus.REQUIRES_REVIEW
            
        report = ValidationReport(
            land_record_id=getattr(record, 'id', 'draft_record'),
            format_score=float(f_score),
            cross_db_score=float(cdb_score),
            spatial_score=float(sp_score),
            title_chain_score=float(tc_score),
            anomaly_risk_level=risk_level if isinstance(risk_level, AnomalyRiskLevel) else AnomalyRiskLevel.LOW,
            overall_status=overall_status,
            issues_json=all_issues,
            created_at=datetime.utcnow()
        )
        
        return report

    def generate_text_summary(self, report: ValidationReport, language: str = 'en') -> str:
        """
        Generates a human-readable summary of the report.
        """
        summary = f"Validation Status: {report.overall_status.value}\n"
        summary += f"Format Score: {report.format_score}/100\n"
        summary += f"Cross-DB Score: {report.cross_db_score}/100\n"
        summary += f"Spatial Score: {report.spatial_score}/100\n"
        summary += f"Title Chain Score: {report.title_chain_score}/100\n"
        summary += f"Risk Level: {report.anomaly_risk_level.value}\n\n"
        
        if report.issues_json:
            summary += "Key Findings:\n"
            for issue in report.issues_json:
                sev = issue.get("severity", "info").upper()
                summary += f"- [{sev}] {issue.get('description')}\n"
        else:
            summary += "No issues detected. Record appears clean.\n"
            
        return summary
