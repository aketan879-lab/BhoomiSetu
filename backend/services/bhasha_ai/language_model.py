import asyncio
import re
from enum import Enum
from typing import Dict, Any, List
from dataclasses import dataclass

class Intent(Enum):
    SHOW_RECORD = "SHOW_RECORD"
    FILE_MUTATION = "FILE_MUTATION"
    CHECK_STATUS = "CHECK_STATUS"
    EXPLAIN_DOCUMENT = "EXPLAIN_DOCUMENT"
    SCAN_DOCUMENT = "SCAN_DOCUMENT"
    HELP = "HELP"
    UNKNOWN = "UNKNOWN"

@dataclass
class IntentResult:
    intent: Intent
    entities: Dict[str, Any]
    confidence: float

class LanguageUnderstanding:
    def __init__(self):
        # Keyword mapping for intent recognition across languages
        self._intent_keywords = {
            "hi": {
                Intent.SHOW_RECORD: ["दिखाओ", "खसरा", "रिकॉर्ड", "जमीन"],
                Intent.FILE_MUTATION: ["दाखिल", "खारिज", "नामंत्रण", "म्यूटेशन"],
                Intent.CHECK_STATUS: ["स्थिति", "स्टेटस", "क्या हुआ"],
                Intent.HELP: ["मदद", "सहायता"]
            },
            "mr": {
                Intent.SHOW_RECORD: ["दाखवा", "सातबारा", "उतारा", "जमीन"],
                Intent.FILE_MUTATION: ["फेरफार", "नोंद"],
                Intent.CHECK_STATUS: ["स्थिती", "स्टेटस"],
                Intent.HELP: ["मदत"]
            },
            "en": {
                Intent.SHOW_RECORD: ["show", "record", "land", "document"],
                Intent.FILE_MUTATION: ["mutation", "file", "transfer"],
                Intent.CHECK_STATUS: ["status", "check"],
                Intent.HELP: ["help", "support"]
            }
        }

    def _extract_entities(self, text: str, language: str) -> Dict[str, Any]:
        """Extract entities like names, numbers, dates in regional formats."""
        entities = {}
        
        # Simple regex for numbers (Khasra/Survey numbers)
        # Works for standard digits; in reality, would handle Indic numerals
        numbers = re.findall(r'\d+', text)
        if numbers:
            entities["survey_number"] = numbers[0]
            
        return entities

    async def understand_intent(self, text: str, language: str) -> IntentResult:
        """Understand user intent from text."""
        await asyncio.sleep(0.1) # Simulate NLU processing
        
        # Fallback to English if language not mapped
        lang_map = self._intent_keywords.get(language, self._intent_keywords["en"])
        
        text_lower = text.lower()
        detected_intent = Intent.UNKNOWN
        max_matches = 0
        
        for intent, keywords in lang_map.items():
            matches = sum(1 for kw in keywords if kw in text_lower)
            if matches > max_matches:
                max_matches = matches
                detected_intent = intent
                
        confidence = 0.5 + (0.1 * max_matches) if max_matches > 0 else 0.1
        if confidence > 0.95:
            confidence = 0.95
            
        # Default to SHOW_RECORD if we found numbers but no clear intent
        entities = self._extract_entities(text, language)
        if detected_intent == Intent.UNKNOWN and "survey_number" in entities:
            detected_intent = Intent.SHOW_RECORD
            confidence = 0.6
            
        return IntentResult(
            intent=detected_intent,
            entities=entities,
            confidence=confidence
        )

    async def generate_response(self, intent: str, context: Dict[str, Any], language: str) -> str:
        """Generate a response in the user's language based on context."""
        await asyncio.sleep(0.2) # Simulate generation
        
        # Mock responses
        responses = {
            "hi": {
                "SHOW_RECORD_SUCCESS": "आपका खसरा रिकॉर्ड यहाँ है।",
                "SHOW_RECORD_NOT_FOUND": "माफ़ करें, यह रिकॉर्ड नहीं मिला।",
                "MUTATION_START": "दाखिल खारिज प्रक्रिया शुरू हो रही है।",
                "DEFAULT": "मैं आपकी कैसे सहायता कर सकता हूँ?"
            },
            "mr": {
                "SHOW_RECORD_SUCCESS": "तुमचा सातबारा उतारा येथे आहे.",
                "SHOW_RECORD_NOT_FOUND": "क्षमस्व, हा रेकॉर्ड आढळला नाही.",
                "MUTATION_START": "फेरफार प्रक्रिया सुरू होत आहे.",
                "DEFAULT": "मी तुमची कशी मदत करू शकतो?"
            }
        }
        
        lang_res = responses.get(language, responses.get("hi"))
        
        # Determine specific response key based on intent and context
        if intent == Intent.SHOW_RECORD.value:
            if context.get("found"):
                return lang_res["SHOW_RECORD_SUCCESS"]
            return lang_res["SHOW_RECORD_NOT_FOUND"]
        elif intent == Intent.FILE_MUTATION.value:
            return lang_res["MUTATION_START"]
            
        return lang_res["DEFAULT"]

language_model = LanguageUnderstanding()
