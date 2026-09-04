from backend.models.land_record import LandRecord
from backend.models.validation_report import ValidationReport
from .format_validator import FormatValidator
from .cross_db_validator import CrossDatabaseValidator
from .spatial_validator import SpatialValidator
from .title_chain_validator import TitleChainValidator
from .anomaly_detector import AnomalyDetector
from .validation_report import ReportGenerator

class ValidationPipeline:
    """
    Orchestrates the 5-Layer Validation process for Land Records.
    """
    
    def __init__(self):
        self.format_validator = FormatValidator()
        self.cross_db_validator = CrossDatabaseValidator()
        self.spatial_validator = SpatialValidator()
        self.title_validator = TitleChainValidator()
        self.anomaly_detector = AnomalyDetector()
        self.report_generator = ReportGenerator()

    async def validate(self, record: LandRecord) -> ValidationReport:
        """
        Runs the full 5-layer validation sequentially and aggregates the result.
        """
        # Layer 1: Format and Syntax
        format_res = await self.format_validator.validate(record)
        
        # Layer 2: Cross-Database Verification
        cdb_res = await self.cross_db_validator.validate(record)
        
        # Layer 3: Spatial and Geometric Analysis
        spatial_res = await self.spatial_validator.validate(record)
        
        # Layer 4: Historical Title Chain Re-construction
        title_res = await self.title_validator.validate(record)
        
        # Layer 5: AI-Driven Fraud and Anomaly Detection
        anomaly_res = await self.anomaly_detector.validate(record)
        
        # Generate Final Report
        report = self.report_generator.generate_report(
            record=record,
            format_result=format_res,
            cross_db_result=cdb_res,
            spatial_result=spatial_res,
            title_result=title_res,
            anomaly_result=anomaly_res
        )
        
        return report
