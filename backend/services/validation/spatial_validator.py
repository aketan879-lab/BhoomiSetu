from typing import Tuple, List, Dict, Any
from backend.models.land_record import LandRecord, LandType

class SpatialValidator:
    """
    Validates spatial aspects: area measurement, boundary overlaps, and land type.
    Uses mock PostGIS queries for demo purposes.
    """
    
    async def validate(self, record: LandRecord) -> Tuple[int, List[Dict[str, Any]]]:
        """
        Compares claimed data vs GIS/satellite data.
        Returns score (0-100) and list of issues.
        """
        issues = []
        score = 100
        
        survey_number = getattr(record, 'survey_number', None) or getattr(record, 'khasra_number', None) or '45/12'
        area_sqm = getattr(record, 'area_normalized_sqm', getattr(record, 'area_sqm', None))
        land_type = getattr(record, 'land_type', None)
        
        # Mock GIS data retrieval
        gis_data = self._mock_gis_query(survey_number)
        
        if not gis_data:
            issues.append({
                "field": "geometry",
                "description": "Spatial geometry not found for this survey number. Unable to verify boundaries.",
                "severity": "info"
            })
            return 80, issues
            
        # 1. Area Verification
        if area_sqm:
            measured_area = gis_data["measured_area_sqm"]
            diff = abs(area_sqm - measured_area)
            tolerance = measured_area * 0.05
            
            if diff > tolerance:
                issues.append({
                    "field": "area_sqm",
                    "description": f"Claimed area ({area_sqm} sqm) differs from GIS measured area ({measured_area} sqm) beyond 5% tolerance.",
                    "severity": "error" if diff > measured_area * 0.1 else "warning"
                })
                score -= 30 if diff > measured_area * 0.1 else 15
                
        # 2. Boundary Overlap Check
        if gis_data["overlap_detected"]:
            issues.append({
                "field": "boundaries",
                "description": f"Boundary overlaps detected with neighboring plot: {gis_data['overlapping_plot_id']}.",
                "severity": "error"
            })
            score -= 40
            
        # 3. Land Type Mismatch
        if land_type and gis_data["satellite_land_type"]:
            if land_type == LandType.AGRICULTURAL and gis_data["satellite_land_type"] == "BUILT_UP":
                issues.append({
                    "field": "land_type",
                    "description": "Land is registered as Agricultural, but satellite imagery detects Built-up structures (possible illegal construction).",
                    "severity": "warning"
                })
                score -= 20

        score = max(0, min(100, score))
        return score, issues

    def _mock_gis_query(self, survey_number: str) -> Dict[str, Any]:
        if not survey_number or "999" in str(survey_number):
            return {}
            
        is_overlap = "overlap" in str(survey_number).lower()
        is_built = "built" in str(survey_number).lower()
        
        return {
            "measured_area_sqm": 2500.0,
            "overlap_detected": is_overlap,
            "overlapping_plot_id": "145/3" if is_overlap else None,
            "satellite_land_type": "BUILT_UP" if is_built else "AGRICULTURAL"
        }
