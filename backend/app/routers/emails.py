import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.user import User
from app.models.email import Email
from app.models.sync_job import SyncJob
from app.schemas.email import EmailResponse, SyncRequest, ReplyRequest
from app.services.search_service import search_service
from app.services.gmail_service import gmail_service
from app.services.outlook_service import outlook_service
from app.tasks.email_tasks import sync_emails_task
from app.dependencies import get_current_user

router = APIRouter(prefix="/emails", tags=["emails"])

@router.get("", response_model=List[EmailResponse])
async def list_emails(
    category: Optional[str] = None,
    is_read: Optional[bool] = None,
    is_urgent: Optional[bool] = None,
    needs_reply: Optional[bool] = None,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists and filters emails for the authenticated user based on status, 
    category, deadlines, and urgency scores.
    """
    filters = {
        "category": category,
        "is_read": is_read,
        "is_urgent": is_urgent,
        "needs_reply": needs_reply,
        "date_range": {
            "start": date_from,
            "end": date_to
        }
    }
    
    emails = await search_service.search_emails(
        db=db,
        user_id=current_user.id,
        query=None,
        filters=filters,
        use_semantic=False,
        limit=limit,
        offset=offset
    )
    return emails

@router.post("/sync", status_code=status.HTTP_202_ACCEPTED)
async def sync_mailbox(
    payload: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers a background Celery task to synchronize emails from Gmail or Outlook.
    Creates a SyncJob record and returns the job ID immediately.
    """
    # A demo account uses Gmail-shaped mock data.  It is intentionally kept
    # separate from a real Google account in the user profile.
    raw_provider = payload.provider.lower()
    if raw_provider == "google":
        provider = "gmail"
    elif raw_provider in {"microsoft", "microsoft-entra-id"}:
        provider = "outlook"
    else:
        provider = raw_provider

    if current_user.provider == "demo" or payload.provider == "demo":
        provider = "gmail"

    if provider not in {"gmail", "outlook"}:
        raise HTTPException(status_code=400, detail="Unsupported email provider")

    # 1. Create a SyncJob record in database first.
    job = SyncJob(
        user_id=current_user.id,
        provider=provider,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    # 2. Trigger Celery task asynchronously. Pass the created job ID so the
    # client polls the job the worker actually updates.
    sync_emails_task.delay(str(current_user.id), provider, payload.full_sync, str(job.id))
    
    # We return the job ID for the client to poll status
    return {
        "job_id": str(job.id),
        "status": "pending",
        "provider": provider
    }

@router.get("/sync/status/{job_id}")
async def get_sync_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the progress/status of a specific background sync job.
    """
    try:
        job_uuid = uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid job ID format")

    stmt = select(SyncJob).where(SyncJob.id == job_uuid, SyncJob.user_id == current_user.id)
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()
    
    if not job:
        # If job is not found, fallback to checking if any running job exists
        fallback_stmt = select(SyncJob).where(SyncJob.user_id == current_user.id).order_by(SyncJob.created_at.desc())
        fallback_res = await db.execute(fallback_stmt)
        job = fallback_res.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Sync job not found")

    return {
        "job_id": str(job.id),
        "status": job.status,
        "provider": job.provider,
        "total_emails": job.total_emails,
        "processed_emails": job.processed_emails,
        "error_message": job.error_message,
        "started_at": job.started_at,
        "completed_at": job.completed_at
    }

@router.get("/search", response_model=List[EmailResponse])
async def search_emails(
    q: str = Query(..., min_length=1),
    semantic: bool = Query(default=True),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Performs keyword or pgvector semantic search on emails.
    """
    emails = await search_service.search_emails(
        db=db,
        user_id=current_user.id,
        query=q,
        use_semantic=semantic,
        limit=limit,
        offset=offset
    )
    return emails

@router.get("/{email_id}", response_model=EmailResponse)
async def get_email_details(
    email_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns full details for a single email. Marks it as read on the backend database.
    """
    try:
        email_uuid = uuid.UUID(email_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid email ID format")

    stmt = select(Email).where(Email.id == email_uuid, Email.user_id == current_user.id)
    result = await db.execute(stmt)
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    # Mark as read locally
    if not email.is_read:
        email.is_read = True
        await db.commit()
        await db.refresh(email)
        
        # Mark as read on provider in background (non-blocking)
        if email.provider == "gmail":
            await gmail_service.mark_as_read(db, current_user, email.message_id)
        elif email.provider == "outlook":
            await outlook_service.mark_as_read(db, current_user, email.message_id)

    return email

@router.post("/{email_id}/reply")
async def reply_to_email(
    email_id: str,
    payload: ReplyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Sends an email reply. Invokes Gmail or Outlook API depending on provider.
    """
    try:
        email_uuid = uuid.UUID(email_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid email ID format")

    stmt = select(Email).where(Email.id == email_uuid, Email.user_id == current_user.id)
    result = await db.execute(stmt)
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    success = False
    if email.provider == "gmail":
        # Gmail reply requires ThreadId, recipient, Subject and body
        success = await gmail_service.send_reply(
            db=db,
            user=current_user,
            thread_id=email.thread_id or email.message_id,
            to=email.sender_email,
            subject=email.subject,
            body=payload.body
        )
    elif email.provider == "outlook":
        # Outlook reply handles thread parameters via MessageId and comment
        success = await outlook_service.send_reply(
            db=db,
            user=current_user,
            message_id=email.message_id,
            body=payload.body
        )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to send reply via mail server")

    return {"status": "success", "message": "Reply sent successfully"}
