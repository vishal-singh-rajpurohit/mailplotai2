import uuid
from typing import Dict, Any
from pydantic import BaseModel

class VoiceCommandRequest(BaseModel):
    transcript: str

class VoiceCommandResponse(BaseModel):
    id: uuid.UUID
    transcript: str
    parsed_intent: Dict[str, Any]

    class Config:
        from_attributes = True
