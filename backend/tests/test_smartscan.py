import pytest
from backend.services.smartscan.extractor import FieldExtractor
from backend.services.smartscan.document_classifier import DocumentClassifier
from backend.models.land_record import RecordType, AreaUnit

def test_field_extractor():
    extractor = FieldExtractor()
    sample_text = """
    Owner: Shri Ramesh Kumar
    Khasra No: 45/12
    Area: 2.5 Hectares
    North: Suresh plot
    South: Road
    East: Mahesh plot  
    West: River
    Date: 15/06/2024
    """
    fields = extractor.extract_fields(sample_text, RecordType.KHASRA, "UP")
    
    assert "Ramesh Kumar" in fields.get("owner_name", "")
    assert fields.get("survey_number") == "45/12"
    assert fields.get("area_original") == 2.5
    assert fields.get("area_sqm") == 25000.0

def test_normalize_area():
    extractor = FieldExtractor()
    sqm = extractor.normalize_area(1.0, AreaUnit.ACRE)
    assert round(sqm, 2) == 4046.86

def test_document_classifier():
    classifier = DocumentClassifier()
    khasra_text = "This is a Khasra document for state UP"
    rec_type, confidence = classifier.classify(khasra_text)
    assert rec_type == RecordType.KHASRA
    assert confidence > 0.0

    mh_text = "Survey No 123 Gat No 45 Village Form VII 7/12"
    rec_type_mh, confidence_mh = classifier.classify(mh_text)
    assert rec_type_mh == RecordType.SEVEN_TWELVE
    assert confidence_mh > 0.0
