import pytest
from backend.services.validation.validation_pipeline import ValidationPipeline
from backend.services.validation.format_validator import FormatValidator
from backend.services.validation.cross_db_validator import CrossDatabaseValidator
from backend.services.validation.spatial_validator import SpatialValidator
from backend.services.validation.title_chain_validator import TitleChainValidator
from backend.services.validation.anomaly_detector import AnomalyDetector
from backend.models.validation_report import AnomalyRiskLevel

class MockLandRecord:
    def __init__(self, **kwargs):
        self.id = kwargs.get("id", "LR-TEST-001")
        for k, v in kwargs.items():
            setattr(self, k, v)

@pytest.mark.asyncio
async def test_format_validator():
    validator = FormatValidator()
    
    valid_record = MockLandRecord(
        owner_name="Ramesh Kumar", state_code="UP", district="Lucknow",
        khasra_number="45/12", area_value=2.5, area_unit="BIGHA",
        land_type="AGRICULTURAL", survey_number="45"
    )
    score, issues = await validator.validate(valid_record)
    assert isinstance(score, (int, float))
    assert isinstance(issues, list)
    
    invalid_record = MockLandRecord(
        owner_name="", state_code="", district="",
        khasra_number="", area_value=-1, area_unit="INVALID",
        land_type="INVALID"
    )
    score, issues = await validator.validate(invalid_record)
    assert score < 100
    assert len(issues) > 0

@pytest.mark.asyncio
async def test_cross_database_validator():
    validator = CrossDatabaseValidator()
    record = MockLandRecord(owner_name="Ramesh Kumar", state_code="UP", district="Lucknow")
    score, issues = await validator.validate(record)
    assert isinstance(score, (int, float))
    assert isinstance(issues, list)

@pytest.mark.asyncio
async def test_spatial_validator():
    validator = SpatialValidator()
    record = MockLandRecord(boundaries_json={"north": "Road"})
    score, issues = await validator.validate(record)
    assert isinstance(score, (int, float))
    assert isinstance(issues, list)

@pytest.mark.asyncio
async def test_title_chain_validator():
    validator = TitleChainValidator()
    record = MockLandRecord(id="LR-123")
    score, issues = await validator.validate(record)
    assert isinstance(score, (int, float))
    assert isinstance(issues, list)

@pytest.mark.asyncio
async def test_anomaly_detector():
    detector = AnomalyDetector()
    record = MockLandRecord(survey_number="fraud_123")
    risk_level, issues = await detector.validate(record)
    assert isinstance(risk_level, AnomalyRiskLevel)
    assert isinstance(issues, list)
    assert risk_level in [AnomalyRiskLevel.LOW, AnomalyRiskLevel.MEDIUM, AnomalyRiskLevel.HIGH, AnomalyRiskLevel.CRITICAL]

@pytest.mark.asyncio
async def test_validation_pipeline_full():
    pipeline = ValidationPipeline()
    valid_record = MockLandRecord(
        owner_name="Ramesh Kumar", state_code="UP", district="Lucknow",
        khasra_number="45/12", area_value=2.5, area_unit="BIGHA",
        land_type="AGRICULTURAL", survey_number="45", id="LR-123",
        boundaries_json={"north": "Road"}
    )
    
    report = await pipeline.validate(valid_record)
    assert hasattr(report, "format_score")
    assert hasattr(report, "cross_db_score")
    assert hasattr(report, "spatial_score")
    assert hasattr(report, "title_chain_score")
    assert hasattr(report, "overall_status")

@pytest.mark.asyncio
async def test_validation_pipeline_incomplete():
    pipeline = ValidationPipeline()
    incomplete_record = MockLandRecord(
        owner_name="", state_code="UP"
    )
    report = await pipeline.validate(incomplete_record)
    assert report.format_score < 100
