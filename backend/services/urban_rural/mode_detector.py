from typing import Literal, List, Dict
from backend.models.land_record import RecordType, AreaUnit

class ModeDetector:
    """
    Detects whether a land parcel falls under URBAN or RURAL classification.
    """
    
    def detect_mode(self, lat: float, lng: float) -> Literal['urban', 'rural']:
        """Detect mode based on coordinates (Mock implementation)."""
        # Mock logic: Assume even integer part of lat is urban, odd is rural
        if int(lat) % 2 == 0:
            return 'urban'
        return 'rural'
        
    def detect_from_district(self, state_code: str, district: str) -> Literal['urban', 'rural']:
        """Detect primary mode of a district (Mock implementation)."""
        urban_hubs = ['MUMBAI', 'DELHI', 'BANGALORE', 'PUNE', 'HYDERABAD', 'CHENNAI']
        if district.upper() in urban_hubs:
            return 'urban'
        return 'rural'

    def get_applicable_record_types(self, mode: str) -> List[RecordType]:
        """Get record types applicable to the region mode."""
        if mode == 'urban':
            return [RecordType.PROPERTY_CARD, RecordType.SALE_DEED, RecordType.CONVEYANCE_DEED]
        return [RecordType.KHASRA, RecordType.KHATAUNI, RecordType.RTC, RecordType.MUTATION_REGISTER]

    def get_applicable_validators(self, mode: str) -> List[str]:
        """Get list of validator class names to run based on mode."""
        if mode == 'urban':
            return ["RERAValidator", "FSIValidator", "MunicipalTaxValidator"]
        return ["CropSurveyValidator", "ForestEncroachmentValidator", "CeilingLimitValidator"]

    def get_area_units(self, mode: str) -> List[AreaUnit]:
        """Get standard area units used in the region."""
        if mode == 'urban':
            return [AreaUnit.SQ_FT, AreaUnit.SQ_MT, AreaUnit.ACRE]
        return [AreaUnit.HECTARE, AreaUnit.ACRE, AreaUnit.GUNTHA, AreaUnit.BIGHA]
