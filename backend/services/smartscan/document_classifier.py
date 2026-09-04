from typing import Tuple
from backend.models.land_record import RecordType

class DocumentClassifier:
    """
    Classifies land record documents based on OCR text contents.
    """
    
    def __init__(self):
        # Keywords indicative of specific document types
        self.type_keywords = {
            RecordType.KHASRA: ["khasra", "form b-i", "form p-ii", "ror", "record of rights"],
            RecordType.KHATAUNI: ["khatauni", "jamabandi"],
            RecordType.SEVEN_TWELVE: ["7/12", "satbara", "saatbaara", "village form vii", "village form xii", "gav namuna 7", "gat no"],
            RecordType.PATTA: ["patta", "tamil nadu"],
            RecordType.CHITTA: ["chitta", "adangal"],
            RecordType.SALE_DEED: ["sale deed", "deed of absolute sale", "purchaser", "vendor", "consideration amount", "stamp duty"],
            RecordType.RTC: ["rtc", "pahani", "karnataka"],
            RecordType.JAMABANDI: ["jamabandi", "rajasthan", "punjab"],
            RecordType.PROPERTY_CARD: ["property card", "cts", "urban"],
            RecordType.RERA_CERT: ["rera", "real estate regulatory authority"]
        }

    def classify(self, ocr_text: str) -> Tuple[RecordType, float]:
        """
        Classifies the document text into a RecordType.
        Returns the predicted RecordType and a confidence score (0.0 to 1.0).
        """
        text_lower = ocr_text.lower()
        
        scores = {rt: 0.0 for rt in RecordType}
        
        for record_type, keywords in self.type_keywords.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            if len(keywords) > 0:
                scores[record_type] = matches / len(keywords)
                
        # Find the type with the highest score
        best_match = max(scores.items(), key=lambda x: x[1])
        
        if best_match[1] > 0.05:
            # Normalize confidence
            confidence = min(best_match[1] * 2.0, 0.99)
            return best_match[0], confidence
            
        # Default fallback
        return RecordType.KHASRA, 0.1
