import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import String, DateTime, Text, Float, Boolean, ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from app.db.database import Base

class Email(Base):
    __tablename__ = "emails"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # gmail, outlook
    message_id: Mapped[str] = mapped_column(String(255), nullable=False)
    thread_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    subject: Mapped[str] = mapped_column(Text, default="", nullable=False)
    sender_email: Mapped[str] = mapped_column(String(255), nullable=False)
    sender_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    recipients: Mapped[List[Dict[str, str]]] = mapped_column(JSONB, default=list, nullable=False)  # [{"email": "...", "name": "..."}]
    snippet: Mapped[str] = mapped_column(Text, default="", nullable=False)
    body_plain: Mapped[str] = mapped_column(Text, default="", nullable=False)
    body_html: Mapped[str] = mapped_column(Text, default="", nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_starred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    labels: Mapped[List[str]] = mapped_column(JSONB, default=list, nullable=False)
    category: Mapped[str] = mapped_column(
        String(50), 
        default="other", 
        nullable=False
    )  # important, work, personal, finance, education, social, promotions, security, invoice, meeting, spam, other
    urgency_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    importance_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    simple_explanation_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    simple_explanation_hi: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    action_items: Mapped[Optional[List[str]]] = mapped_column(JSONB, nullable=True)
    deadlines: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSONB, nullable=True)  # [{"deadline": "...", "task": "..."}]
    entities: Mapped[Optional[Dict[str, List[str]]]] = mapped_column(JSONB, nullable=True)  # {"people": [], "companies": [], "dates": [], "amounts": []}
    needs_reply: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    embedding: Mapped[Optional[Any]] = mapped_column(Vector(1536), nullable=True)
    raw_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="emails")

    __table_args__ = (
        UniqueConstraint("user_id", "provider", "message_id", name="uq_user_provider_message"),
        Index("ix_emails_user_received", "user_id", "received_at"),
        Index("ix_emails_user_category", "user_id", "category"),
        Index("ix_emails_user_urgency", "user_id", "urgency_score"),
        Index("ix_emails_user_is_read", "user_id", "is_read"),
    )
