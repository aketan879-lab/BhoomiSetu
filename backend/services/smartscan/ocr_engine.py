import numpy as np
from typing import Dict, Any, List, Tuple
import logging

logger = logging.getLogger(__name__)

class OCREngine:
    """
    Handles text extraction from processed land record images using PaddleOCR.
    """
    
    def __init__(self):
        # We would lazily initialize PaddleOCR instances here
        # import paddleocr
        self._models: Dict[str, Any] = {}
        self.supported_languages = {
            'en': 'en',
            'hi': 'hi',
            'mr': 'mr',  # Marathi
            'ta': 'ta',  # Tamil
            'te': 'te',  # Telugu
            'bn': 'bn',  # Bengali
            'gu': 'gu',  # Gujarati
            'kn': 'kn',  # Kannada
            'ml': 'ml',  # Malayalam
            'pa': 'pa',  # Punjabi
            'or': 'or'   # Odia
        }
        logger.info("OCREngine initialized.")

    def _select_model(self, language: str) -> Any:
        """
        Selects and caches the appropriate PaddleOCR model for the given language.
        """
        lang_code = self.supported_languages.get(language, 'en')
        if lang_code not in self._models:
            logger.info(f"Loading PaddleOCR model for language: {lang_code}")
            # Mocking PaddleOCR loading for the demo
            # from paddleocr import PaddleOCR
            # self._models[lang_code] = PaddleOCR(use_angle_cls=True, lang=lang_code)
            self._models[lang_code] = "MOCK_PADDLE_OCR_MODEL"
        return self._models[lang_code]

    def extract_text(self, image: np.ndarray, language: str = 'hi') -> Dict[str, Any]:
        """
        Extracts text from the image using the selected OCR model.
        Returns a dictionary with full text, bounding boxes, and confidence scores.
        """
        model = self._select_model(language)
        
        # Mocking OCR extraction
        # result = model.ocr(image, cls=True)
        # In a real scenario, we would parse the result from PaddleOCR
        
        # Mock result for demonstration purposes
        mock_text = [
            "Khasra No: 145/2",
            "Owner: Rajesh Kumar",
            "Area: 1.25 Hectares",
            "State: Uttar Pradesh",
            "District: Lucknow"
        ]
        
        boxes = [
            [[10, 10], [100, 10], [100, 30], [10, 30]],
            [[10, 40], [150, 40], [150, 60], [10, 60]],
            [[10, 70], [120, 70], [120, 90], [10, 90]],
            [[10, 100], [140, 100], [140, 120], [10, 120]],
            [[10, 130], [130, 130], [130, 150], [10, 150]]
        ]
        
        confidences = [0.95, 0.98, 0.92, 0.99, 0.97]
        
        return {
            "text": "\n".join(mock_text),
            "lines": mock_text,
            "bounding_boxes": boxes,
            "confidence_scores": confidences,
            "average_confidence": sum(confidences) / len(confidences) if confidences else 0.0
        }
