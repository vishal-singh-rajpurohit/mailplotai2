import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class OAuthLoginRequest(BaseModel):
    email: EmailStr
    name: str
    image: Optional[str] = None
    provider: str  # google, microsoft
    provider_account_id: str
    access_token: str
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None

class UserPreferencesUpdate(BaseModel):
    preferred_language: str  # en, hi

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    image: Optional[str] = None
    provider: str
    preferred_language: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
