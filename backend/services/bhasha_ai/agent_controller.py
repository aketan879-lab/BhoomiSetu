import asyncio
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

from backend.services.bhasha_ai.speech_to_text import stt_service, TranscriptionResult
from backend.services.bhasha_ai.language_model import language_model, Intent, IntentResult
from backend.services.bhasha_ai.text_to_speech import tts_service

class UIActionType(Enum):
    NAVIGATE = "NAVIGATE"
    FILL_FORM = "FILL_FORM"
    HIGHLIGHT = "HIGHLIGHT"
    SHOW_RECORD = "SHOW_RECORD"

@dataclass
class UIAction:
    action_type: UIActionType
    target: str
    data: Optional[Dict[str, Any]] = None

@dataclass
class AgentResponse:
    text_response: str
    audio_response: bytes
    ui_actions: List[UIAction]
    language: str

class AgentController:
    def __init__(self):
        # In-memory session store (in production, use Redis)
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def _get_session(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self._sessions:
            self._sessions[user_id] = {"history": [], "language": "auto"}
        return self._sessions[user_id]

    async def process_voice_command(self, audio_bytes: bytes, user_id: str) -> AgentResponse:
        """Process a voice command end-to-end."""
        session = self._get_session(user_id)
        
        # 1. Speech to Text
        stt_result = await stt_service.transcribe(audio_bytes, language=session.get("language", "auto"))
        session["language"] = stt_result.language_detected
        
        # 2. Intent Recognition
        intent_result = await language_model.understand_intent(stt_result.text, stt_result.language_detected)
        
        # 3. Action Execution & UI mapping
        ui_actions = self._determine_actions(intent_result)
        
        # Mock Context based on intent
        context = {"found": True} if intent_result.intent == Intent.SHOW_RECORD else {}
        
        # 4. Generate Text Response
        text_response = await language_model.generate_response(
            intent_result.intent.value, 
            context, 
            stt_result.language_detected
        )
        
        # 5. Text to Speech
        audio_response = await tts_service.synthesize(text_response, language=stt_result.language_detected)
        
        # Update history
        session["history"].append({
            "user_text": stt_result.text,
            "intent": intent_result.intent.value,
            "agent_text": text_response
        })
        
        return AgentResponse(
            text_response=text_response,
            audio_response=audio_response,
            ui_actions=ui_actions,
            language=stt_result.language_detected
        )

    def _determine_actions(self, intent_result: IntentResult) -> List[UIAction]:
        """Map recognized intent to UI actions."""
        actions = []
        
        if intent_result.intent == Intent.SHOW_RECORD:
            survey_no = intent_result.entities.get("survey_number")
            if survey_no:
                actions.append(UIAction(
                    action_type=UIActionType.SHOW_RECORD,
                    target="land_record_view",
                    data={"survey_number": survey_no}
                ))
            else:
                actions.append(UIAction(
                    action_type=UIActionType.NAVIGATE,
                    target="/records/search"
                ))
                
        elif intent_result.intent == Intent.FILE_MUTATION:
            actions.append(UIAction(
                action_type=UIActionType.NAVIGATE,
                target="/mutations/new"
            ))
            
        return actions

agent_controller = AgentController()
