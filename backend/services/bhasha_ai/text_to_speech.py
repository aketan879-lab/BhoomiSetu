import asyncio
from typing import List
from dataclasses import dataclass

@dataclass
class VoiceOption:
    id: str
    name: str
    gender: str
    language: str

class TextToSpeechService:
    def __init__(self):
        self._voices = [
            VoiceOption("hi-M1", "Amit", "Male", "hi"),
            VoiceOption("hi-F1", "Swati", "Female", "hi"),
            VoiceOption("mr-M1", "Ramesh", "Male", "mr"),
            VoiceOption("mr-F1", "Anjali", "Female", "mr"),
            VoiceOption("te-M1", "Raju", "Male", "te"),
        ]

    def get_supported_voices(self, language: str) -> List[VoiceOption]:
        """Get available voices for a specific language."""
        return [v for v in self._voices if v.language == language]

    async def synthesize(self, text: str, language: str = 'hi', voice_id: str = None) -> bytes:
        """Synthesize text to speech audio bytes using IndicTTS (mocked)."""
        await asyncio.sleep(0.3) # Simulate TTS synthesis
        
        if not text:
            return b""
            
        # In a real implementation, this would call Bhashini TTS or Google Cloud TTS
        # Returning a mock byte string representing a WAV/MP3 file
        
        header = b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00"
        # Mock audio content based on text length
        mock_audio_data = b"\x00\x80" * (len(text) * 100)
        
        return header + mock_audio_data

tts_service = TextToSpeechService()
