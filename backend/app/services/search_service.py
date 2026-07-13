import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.email import Email
from app.services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

class SearchService:
    async def search_emails(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        query: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
        use_semantic: bool = False,
        limit: int = 20,
        offset: int = 0
    ) -> List[Email]:
        """
        Executes a hybrid search query on emails, combining SQL filtering, 
        keyword search, and pgvector cosine-distance semantic search.
        """
        filters = filters or {}
        stmt = select(Email).where(Email.user_id == user_id)
        
        # 1. Apply Metadata Filters
        if "category" in filters and filters["category"]:
            stmt = stmt.where(Email.category == filters["category"])
            
        if "is_read" in filters and filters["is_read"] is not None:
            stmt = stmt.where(Email.is_read == filters["is_read"])
            
        if "is_unread" in filters and filters["is_unread"] is not None:
            stmt = stmt.where(Email.is_read == (not filters["is_unread"]))

        if "is_urgent" in filters and filters["is_urgent"] is not None:
            if filters["is_urgent"]:
                stmt = stmt.where(Email.urgency_score >= 0.7)
            else:
                stmt = stmt.where(Email.urgency_score < 0.7)

        if "needs_reply" in filters and filters["needs_reply"] is not None:
            stmt = stmt.where(Email.needs_reply == filters["needs_reply"])

        if "from_sender" in filters and filters["from_sender"]:
            sender_query = f"%{filters['from_sender']}%"
            stmt = stmt.where(
                or_(
                    Email.sender_name.ilike(sender_query),
                    Email.sender_email.ilike(sender_query)
                )
            )

        # Handle Date Range
        date_range = filters.get("date_range") or {}
        if "start" in date_range and date_range["start"]:
            try:
                start_dt = datetime.fromisoformat(date_range["start"].replace("Z", "+00:00")).replace(tzinfo=None)
                stmt = stmt.where(Email.received_at >= start_dt)
            except Exception as e:
                logger.error(f"Error parsing date_range start: {e}")
                
        if "end" in date_range and date_range["end"]:
            try:
                end_dt = datetime.fromisoformat(date_range["end"].replace("Z", "+00:00")).replace(tzinfo=None)
                stmt = stmt.where(Email.received_at <= end_dt)
            except Exception as e:
                logger.error(f"Error parsing date_range end: {e}")

        # Urgency threshold
        if "urgency_min" in filters and filters["urgency_min"] is not None:
            stmt = stmt.where(Email.urgency_score >= filters["urgency_min"])

        # 2. Apply Text Query / Semantic Search
        if query and query.strip():
            if use_semantic:
                try:
                    # Generate search query embedding
                    query_embedding = await embedding_service.get_embedding(query)
                    # Compute cosine distance
                    distance = Email.embedding.cosine_distance(query_embedding)
                    stmt = stmt.where(Email.embedding.isnot(None))
                    stmt = stmt.order_by(distance)
                except Exception as e:
                    logger.error(f"Semantic search failed, falling back to keyword search: {e}")
                    # Fallback to keyword
                    kw = f"%{query}%"
                    stmt = stmt.where(
                        or_(
                            Email.subject.ilike(kw),
                            Email.body_plain.ilike(kw),
                            Email.sender_name.ilike(kw)
                        )
                    ).order_by(desc(Email.received_at))
            else:
                # Traditional keyword search
                kw = f"%{query}%"
                stmt = stmt.where(
                    or_(
                        Email.subject.ilike(kw),
                        Email.body_plain.ilike(kw),
                        Email.sender_name.ilike(kw)
                    )
                ).order_by(desc(Email.received_at))
        else:
            # If no query is provided, default to chronologically newest emails
            stmt = stmt.order_by(desc(Email.received_at))

        # 3. Apply Pagination limits
        stmt = stmt.offset(offset).limit(limit)

        result = await db.execute(stmt)
        return list(result.scalars().all())

search_service = SearchService()
