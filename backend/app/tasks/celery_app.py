from celery import Celery
from app.config import settings

celery_app = Celery(
    "inboxpilot_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    imports=(
        "app.tasks.email_tasks",
        "app.tasks.ai_tasks",
    )
)
