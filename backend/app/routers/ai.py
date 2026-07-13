import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.db.database import get_db
from app.models.user import User
from app.models.email import Email
from app.services.ai_service import ai_service
from app.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["ai"])

class SuggestReplyRequest(BaseModel):
    email_id: str
    language: str = "en"

class SuggestReplyResponse(BaseModel):
    suggestions: List[str]

@router.post("/reply-suggestions", response_model=SuggestReplyResponse)
async def generate_reply_suggestions(
    payload: SuggestReplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Dynamically generates 3 AI-suggested replies for a specific email.
    """
    try:
        email_uuid = uuid.UUID(payload.email_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid email ID format")

    stmt = select(Email).where(Email.id == email_uuid, Email.user_id == current_user.id)
    result = await db.execute(stmt)
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    try:
        suggestions = await ai_service.suggest_reply(
            subject=email.subject,
            body=email.body_plain or email.snippet,
            sender_name=email.sender_name,
            language=payload.language
        )
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
