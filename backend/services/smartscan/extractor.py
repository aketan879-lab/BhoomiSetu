import re
from datetime import datetime
from typing import Dict, Any, Tuple, List, Optional
from backend.models.land_record import RecordType, AreaUnit

class FieldExtractor:
    """
    Extracts structured fields from raw OCR text using regex and heuristics.
    Handles state-specific formats for Indian land records.
    """
    
    def extract_fields(self, ocr_text: str, record_type: RecordType, state_code: str) -> Dict[str, Any]:
        """
        Extracts all relevant fields based on the document type and state rules.
        """
        extracted = {}
        
        extracted["owner_name"] = self._extract_owner_name(ocr_text)
        extracted["survey_number"] = self._extract_survey_number(ocr_text, state_code)
        
        area_val, area_unit = self._extract_area(ocr_text)
        if area_val is not None:
            extracted["area_original"] = area_val
            extracted["area_unit_original"] = area_unit
            extracted["area_sqm"] = self.normalize_area(area_val, area_unit, AreaUnit.SQMETER)
            
        extracted["boundaries"] = self._extract_boundaries(ocr_text)
        extracted["dates"] = self._extract_dates(ocr_text)
        
        return extracted

    def normalize_area(self, value: float, from_unit: AreaUnit, to_unit: AreaUnit = AreaUnit.SQMETER) -> float:
        """
        Normalizes area from regional units to a standard unit (Sq. Meters by default).
        """
        # Conversion rates to Sq. Meters
        conversion_rates = {
            AreaUnit.SQMETER: 1.0,
            AreaUnit.HECTARE: 10000.0,
            AreaUnit.ACRE: 4046.86,
            AreaUnit.BIGHACACHHA: 843.0, # Varies by region, approximate
            AreaUnit.BIGHAPUCCA: 2529.0, # Varies by region, approximate
            AreaUnit.BISWA: 126.5,
            AreaUnit.GUNTHA: 101.17,
            AreaUnit.ARE: 100.0,
            AreaUnit.CENT: 40.47
        }
        
        # Get rate to Sq. Meters
        rate_to_sqm = conversion_rates.get(from_unit, 1.0)
        value_in_sqm = value * rate_to_sqm
        
        # Convert from Sq. Meters to target unit
        rate_from_sqm = conversion_rates.get(to_unit, 1.0)
        return value_in_sqm / rate_from_sqm

    def _extract_owner_name(self, text: str) -> Optional[str]:
        """
        Extracts owner name using keywords like 'Owner', 'Name', 'Khatedar'.
        """
        patterns = [
            r"(?i)(?:Owner|Name|Khatedar|Name of the occupant)[:\-\s]+([A-Za-z\s]+)(?:\n|$)",
            r"(?i)shri\.?\s+([A-Za-z\s]+)",
            r"(?i)smt\.?\s+([A-Za-z\s]+)"
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1).strip()
        return None

    def _extract_survey_number(self, text: str, state_code: str) -> Optional[str]:
        """
        Extracts Survey No. / Khasra No. / Gat No. based on state.
        """
        if state_code.upper() in ["UP", "MP", "RJ"]:
            # Khasra Number
            match = re.search(r"(?i)(?:Khasra\s*No\.?|Khasra|Plot\s*No\.?)[\s\:\-]+([0-9a-zA-Z\/\-]+)", text)
        elif state_code.upper() == "MH":
            # Gat Number / Survey Number
            match = re.search(r"(?i)(?:Gat\s*No\.?|Survey\s*No\.?)[\s\:\-]+([0-9a-zA-Z\/\-]+)", text)
        else:
            match = re.search(r"(?i)(?:Survey\s*No\.?|Khasra\s*No\.?)[\s\:\-]+([0-9a-zA-Z\/\-]+)", text)
            
        return match.group(1).strip() if match else None

    def _extract_area(self, text: str) -> Tuple[Optional[float], Optional[AreaUnit]]:
        """
        Extracts area value and its unit.
        """
        pattern = r"(?i)(?:Area|Extent)[\s\:\-]+([0-9\.]+)\s*(Hectares?|Acres?|Sq\.?Meters?|Bigha|Biswa|Guntha|Are|Cent)"
        match = re.search(pattern, text)
        if match:
            value = float(match.group(1))
            unit_str = match.group(2).lower()
            
            unit = AreaUnit.SQMETER # Default
            if 'hectare' in unit_str: unit = AreaUnit.HECTARE
            elif 'acre' in unit_str: unit = AreaUnit.ACRE
            elif 'bigha' in unit_str: unit = AreaUnit.BIGHAPUCCA # Simplification
            elif 'biswa' in unit_str: unit = AreaUnit.BISWA
            elif 'guntha' in unit_str: unit = AreaUnit.GUNTHA
            elif 'are' in unit_str: unit = AreaUnit.ARE
            elif 'cent' in unit_str: unit = AreaUnit.CENT
                
            return value, unit
        return None, None

    def _extract_boundaries(self, text: str) -> Dict[str, str]:
        """
        Extracts boundary information (North, South, East, West).
        """
        boundaries = {}
        directions = ['North', 'South', 'East', 'West']
        for direction in directions:
            pattern = fr"(?i){direction}[\s\:\-]+([A-Za-z0-9\s\,]+)(?:\n|$)"
            match = re.search(pattern, text)
            if match:
                boundaries[direction.lower()] = match.group(1).strip()
        return boundaries

    def _extract_dates(self, text: str) -> List[datetime]:
        """
        Extracts all dates found in the document.
        """
        dates = []
        # Matches dd/mm/yyyy, dd-mm-yyyy, yyyy/mm/dd, yyyy-mm-dd
        patterns = [
            r"\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b",
            r"\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b"
        ]
        
        for pattern in patterns:
            for match in re.finditer(pattern, text):
                try:
                    if len(match.group(3)) == 4: # dd/mm/yyyy
                        d = datetime(int(match.group(3)), int(match.group(2)), int(match.group(1)))
                    else: # yyyy/mm/dd
                        d = datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
                    dates.append(d)
                except ValueError:
                    continue
        return dates
