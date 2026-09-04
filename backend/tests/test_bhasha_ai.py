import pytest
from backend.services.bhasha_ai.language_model import LanguageUnderstanding, Intent

@pytest.fixture
def language_model():
    return LanguageUnderstanding()

@pytest.mark.asyncio
async def test_understand_intent_hindi(language_model):
    res = await language_model.understand_intent("मेरा खसरा दिखाओ", "hi")
    assert res.intent == Intent.SHOW_RECORD

@pytest.mark.asyncio
async def test_understand_intent_english(language_model):
    res = await language_model.understand_intent("show my land record", "en")
    assert res.intent == Intent.SHOW_RECORD

@pytest.mark.asyncio
async def test_understand_intent_marathi(language_model):
    res = await language_model.understand_intent("सातबारा दाखवा", "mr")
    assert res.intent == Intent.SHOW_RECORD

@pytest.mark.asyncio
async def test_understand_intent_mutation(language_model):
    res = await language_model.understand_intent("i want to file a mutation", "en")
    assert res.intent == Intent.FILE_MUTATION

@pytest.mark.asyncio
async def test_entity_extraction(language_model):
    res = await language_model.understand_intent("my survey number is 4512", "en")
    assert "survey_number" in res.entities
    assert res.entities["survey_number"] == "4512"

@pytest.mark.asyncio
async def test_generate_response_hindi(language_model):
    response = await language_model.generate_response(Intent.SHOW_RECORD.value, {"found": True}, "hi")
    assert isinstance(response, str)
    assert len(response) > 0
