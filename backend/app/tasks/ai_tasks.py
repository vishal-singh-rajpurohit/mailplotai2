import asyncio
import logging
import uuid
from app.tasks.celery_app import celery_app
from app.db.database import SessionLocal
from app.models.email import Email
from app.services.ai_service import ai_service
from app.services.embedding_service import embedding_service
from sqlalchemy import select

logger = logging.getLogger(__name__)

def run_async(coro):
    """Utility helper to run async coroutines in synchronous Celery worker."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

@celery_app.task(name="ai_process_email_task")
def ai_process_email_task(email_id_str: str):
    """
    Background Celery task that enriches a single email with AI insights.
    Retrieves email content, calls LLM for summaries, classifications, translations,
    extracts action items, and generates search embeddings.
    """
    return run_async(async_process_email(email_id_str))

async def async_process_email(email_id_str: str):
    email_id = uuid.UUID(email_id_str)
    
    async with SessionLocal() as db:
        # 1. Load the email
        result = await db.execute(select(Email).where(Email.id == email_id))
        email = result.scalar_one_or_none()
        if not email:
            logger.error(f"Email {email_id_str} not found in database for AI processing")
            return {"status": "error", "message": "Email not found"}

        try:
            logger.info(f"Starting AI analysis for email {email_id_str}")
            
            # 2. Run LLM Text Analysis
            analysis = await ai_service.analyze_email(
                subject=email.subject,
                body=email.body_plain or email.snippet,
                sender_name=email.sender_name,
                sender_email=email.sender_email
            )
            
            # Populate LLM results
            email.category = analysis.get("category", "other")
            email.urgency_score = analysis.get("urgency_score", 0.0)
            email.importance_score = analysis.get("importance_score", 0.0)
            email.needs_reply = analysis.get("needs_reply", False)
            email.summary = analysis.get("summary", "")
            email.simple_explanation_en = analysis.get("simple_explanation_en", "")
            email.simple_explanation_hi = analysis.get("simple_explanation_hi", "")
            email.action_items = analysis.get("action_items", [])
            email.deadlines = analysis.get("deadlines", [])
            email.entities = analysis.get("entities", {})
            
            # 3. Generate embedding for semantic search
            # Combine header details and leading body text for vector representation
            text_to_embed = (
                f"Subject: {email.subject}\n"
                f"Sender: {email.sender_name} <{email.sender_email}>\n"
                f"Snippet: {email.snippet}\n"
                f"Body: {(email.body_plain or '')[:2000]}"
            )
            
            email.embedding = await embedding_service.get_embedding(text_to_embed)
            
            # 4. Save updates
            await db.commit()
            logger.info(f"AI enrichment successfully finished for email {email_id_str}")
            return {"status": "success"}
            
        except Exception as e:
            logger.exception(f"Exception during AI email processing for {email_id_str}")
            return {"status": "failed", "error": str(e)}
