import asyncio
from typing import Dict
from dataclasses import dataclass

@dataclass
class TranscriptionResult:
    text: str
    language_detected: str
    confidence: float
    duration_seconds: float

class SpeechToTextService:
    def __init__(self):
        # 12 Indian Languages Mapping
        self.supported_languages: Dict[str, str] = {
            "hi": "Hindi",
            "mr": "Marathi",
            "bn": "Bengali",
            "te": "Telugu",
            "ta": "Tamil",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Punjabi",
            "or": "Odia",
            "as": "Assamese",
            "ur": "Urdu"
        }

    def _detect_language(self, audio_bytes: bytes) -> str:
        """Auto-detect spoken language from audio."""
        # Mock language detection based on byte length for demo
        if len(audio_bytes) % 3 == 0:
            return "mr"
        elif len(audio_bytes) % 2 == 0:
            return "hi"
        return "te"

    async def transcribe(self, audio_bytes: bytes, language: str = 'hi') -> TranscriptionResult:
        """Transcribe audio bytes to text using IndicWhisper (mocked)."""
        # In a real scenario, this would call a model like Whisper or Bhashini API
        await asyncio.sleep(0.5) # Simulate processing time
        
        # If auto-detect is requested
        if language == "auto":
            language = self._detect_language(audio_bytes)
            
        # Fallback to Hindi if unsupported
        if language not in self.supported_languages:
            language = "hi"
            
        # Mock transcription based on language
        mock_transcriptions = {
            "hi": "मेरा खसरा नंबर क्या है?",
            "mr": "माझा सातबारा उतारा दाखवा.",
            "te": "నా భూమి రికార్డులను చూపించండి."
        }
        
        text = mock_transcriptions.get(language, "Hello, show my land record.")
        
        return TranscriptionResult(
            text=text,
            language_detected=language,
            confidence=0.92,
            duration_seconds=len(audio_bytes) / 16000 # mock calculation assuming 16kHz 1-byte
        )

stt_service = SpeechToTextService()
