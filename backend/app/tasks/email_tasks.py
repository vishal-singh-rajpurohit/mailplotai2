import asyncio
import logging
import uuid
from datetime import datetime
from app.tasks.celery_app import celery_app
from app.db.database import SessionLocal
from app.models.user import User
from app.models.email import Email
from app.models.sync_job import SyncJob
from app.services.gmail_service import gmail_service
from app.services.outlook_service import outlook_service
from app.tasks.ai_tasks import ai_process_email_task
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

@celery_app.task(name="sync_emails_task")
def sync_emails_task(user_id_str: str, provider: str, full_sync: bool = False, job_id_str: str | None = None):
    """
    Background Celery task that coordinates loading a user, fetching emails 
    from Gmail/Outlook, inserting them, and queuing AI processing jobs.
    """
    return run_async(async_sync_emails(user_id_str, provider, full_sync, job_id_str))

async def async_sync_emails(user_id_str: str, provider: str, full_sync: bool, job_id_str: str | None = None):
    user_id = uuid.UUID(user_id_str)
    
    async with SessionLocal() as db:
        # 1. Fetch the user
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            logger.error(f"User {user_id_str} not found for sync task")
            return {"status": "error", "message": "User not found"}

        # 2. Update the job created by the API.  Retain the fallback for
        # workers invoked by older queued messages.
        job = None
        if job_id_str:
            try:
                job_id = uuid.UUID(job_id_str)
                job_result = await db.execute(
                    select(SyncJob).where(SyncJob.id == job_id, SyncJob.user_id == user_id)
                )
                job = job_result.scalar_one_or_none()
            except ValueError:
                logger.warning("Ignoring malformed sync job ID: %s", job_id_str)

        if not job:
            job = SyncJob(user_id=user_id, provider=provider, status="pending")
            db.add(job)

        job.status = "running"
        job.started_at = datetime.utcnow()
        await db.commit()
        await db.refresh(job)

        try:
            # 3. Fetch emails from appropriate provider service
            raw_emails = []
            if provider == "gmail":
                max_results = 50 if full_sync else 15
                raw_emails, _ = await gmail_service.fetch_emails(db, user, max_results=max_results)
            elif provider == "outlook":
                top_results = 50 if full_sync else 15
                raw_emails, _ = await outlook_service.fetch_emails(db, user, top=top_results)
            else:
                raise ValueError(f"Unknown email provider: {provider}")

            job.total_emails = len(raw_emails)
            await db.commit()
            
            processed_count = 0
            
            # 4. Save new emails and dispatch AI jobs
            for raw_mail in raw_emails:
                # Check if email message_id already exists for this user/provider
                check_stmt = select(Email).where(
                    Email.user_id == user_id,
                    Email.provider == provider,
                    Email.message_id == raw_mail["message_id"]
                )
                check_res = await db.execute(check_stmt)
                existing_email = check_res.scalar_one_or_none()
                
                if not existing_email:
                    # Construct and add new Email record
                    new_email = Email(
                        user_id=user_id,
                        provider=provider,
                        message_id=raw_mail["message_id"],
                        thread_id=raw_mail.get("thread_id"),
                        subject=raw_mail.get("subject", ""),
                        sender_email=raw_mail.get("sender_email", ""),
                        sender_name=raw_mail.get("sender_name", ""),
                        recipients=raw_mail.get("recipients", []),
                        snippet=raw_mail.get("snippet", ""),
                        body_plain=raw_mail.get("body_plain", ""),
                        body_html=raw_mail.get("body_html", ""),
                        received_at=raw_mail.get("received_at", datetime.utcnow()),
                        is_read=raw_mail.get("is_read", False),
                        is_starred=raw_mail.get("is_starred", False),
                        labels=raw_mail.get("labels", []),
                        raw_payload=raw_mail.get("raw_payload", {})
                    )
                    db.add(new_email)
                    await db.commit()
                    await db.refresh(new_email)
                    
                    # Queue the AI processor job for this specific email
                    ai_process_email_task.delay(str(new_email.id))
                else:
                    # Update simple read status if it changed on provider
                    if existing_email.is_read != raw_mail.get("is_read", False):
                        existing_email.is_read = raw_mail.get("is_read", False)
                        await db.commit()
                
                processed_count += 1
                job.processed_emails = processed_count
                await db.commit()

            # 5. Mark sync job successful
            job.status = "success"
            job.completed_at = datetime.utcnow()
            await db.commit()
            
            logger.info(f"Sync successfully completed for user {user.id}. Total {processed_count} processed.")
            return {"status": "success", "processed": processed_count}

        except Exception as e:
            logger.exception(f"Exception occurred in sync task for user {user.id}")
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            await db.commit()
            return {"status": "failed", "error": str(e)}
