import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class EmailRecipient(BaseModel):
    name: str
    email: str

class EmailDeadline(BaseModel):
    task: str
    deadline: Optional[str] = None

class EmailEntities(BaseModel):
    people: List[str] = []
    companies: List[str] = []
    dates: List[str] = []
    amounts: List[str] = []

class EmailResponse(BaseModel):
    id: uuid.UUID
    provider: str
    message_id: str
    thread_id: Optional[str] = None
    subject: str
    sender_email: str
    sender_name: str
    recipients: List[EmailRecipient] = []
    snippet: str
    body_plain: str
    body_html: str
    received_at: datetime
    is_read: bool
    is_starred: bool
    labels: List[str] = []
    category: str
    urgency_score: float
    importance_score: float
    summary: Optional[str] = None
    simple_explanation_en: Optional[str] = None
    simple_explanation_hi: Optional[str] = None
    action_items: Optional[List[str]] = None
    deadlines: Optional[List[EmailDeadline]] = None
    entities: Optional[EmailEntities] = None
    needs_reply: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SyncRequest(BaseModel):
    provider: str  # gmail, outlook
    full_sync: bool = False

class ReplyRequest(BaseModel):
    body: str
    language: str = "en"
