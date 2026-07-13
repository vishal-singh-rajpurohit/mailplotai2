import os
import uuid
import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.user import User
from app.models.voice_command import VoiceCommand
from app.schemas.voice import VoiceCommandRequest, VoiceCommandResponse
from app.services.ai_service import ai_service
from app.dependencies import get_current_user
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts raw multipart audio upload. Transcribes it using OpenAI Whisper API
    or falls back to mock transcript if OpenAI credentials are missing.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty file upload")

    # If OpenAI API is available, perform real transcription
    if settings.OPENAI_API_KEY:
        # Save temp file
        temp_file_path = f"temp_{uuid.uuid4()}_{file.filename}"
        try:
            with open(temp_file_path, "wb") as f:
                content = await file.read()
                f.write(content)
            
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            with open(temp_file_path, "rb") as audio:
                transcript_res = await client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio
                )
            
            transcript_text = transcript_res.text
            return {"transcript": transcript_text}
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}")
            raise HTTPException(status_code=500, detail=f"Whisper service error: {str(e)}")
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
    else:
        # Mock transcription fallback for sandbox/Demo Mode
        logger.info("OpenAI API key missing. Returning mock transcription.")
        return {"transcript": "show important emails from today"}

@router.post("/command", response_model=VoiceCommandResponse)
async def process_voice_command(
    payload: VoiceCommandRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives a voice transcript, parses it into structured search filters using the AI service,
    records the request history, and returns the query intent.
    """
    try:
        # 1. Parse intent
        parsed_intent = await ai_service.parse_voice_command(payload.transcript)
        
        # 2. Record voice command in history
        command = VoiceCommand(
            user_id=current_user.id,
            transcript=payload.transcript,
            parsed_intent=parsed_intent
        )
        db.add(command)
        await db.commit()
        await db.refresh(command)
        
        return command
    except Exception as e:
        logger.exception("Failed to process voice command")
        raise HTTPException(status_code=500, detail=str(e))
