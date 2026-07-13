from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.db.database import get_db
from app.models.user import User
from app.models.email import Email
from app.schemas.insights import DailyInsightsResponse, TopSender
from app.services.ai_service import ai_service
from app.dependencies import get_current_user
from datetime import datetime, time

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("/dashboard", response_model=DailyInsightsResponse)
async def get_daily_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Computes email statistics (counts, categories, top senders) for the authenticated user
    and generates an executive daily AI summary.
    """
    user_id = current_user.id

    try:
        # 1. Query Unread count
        unread_stmt = select(func.count(Email.id)).where(Email.user_id == user_id, Email.is_read == False)
        unread_res = await db.execute(unread_stmt)
        unread_count = unread_res.scalar() or 0

        # 2. Query Urgent count
        urgent_stmt = select(func.count(Email.id)).where(Email.user_id == user_id, Email.urgency_score >= 0.7)
        urgent_res = await db.execute(urgent_stmt)
        urgent_count = urgent_res.scalar() or 0

        # 3. Query Needs Reply count
        reply_stmt = select(func.count(Email.id)).where(Email.user_id == user_id, Email.needs_reply == True)
        reply_res = await db.execute(reply_stmt)
        needs_reply_count = reply_res.scalar() or 0

        # 4. Query Total count
        total_stmt = select(func.count(Email.id)).where(Email.user_id == user_id)
        total_res = await db.execute(total_stmt)
        total_count = total_res.scalar() or 0

        # 5. Query Category distribution
        cat_stmt = select(Email.category, func.count(Email.id)).where(Email.user_id == user_id).group_by(Email.category)
        cat_res = await db.execute(cat_stmt)
        categories = {row[0]: row[1] for row in cat_res.all()}

        # 6. Query Top senders
        sender_stmt = (
            select(Email.sender_email, Email.sender_name, func.count(Email.id))
            .where(Email.user_id == user_id)
            .group_by(Email.sender_email, Email.sender_name)
            .order_by(desc(func.count(Email.id)))
            .limit(5)
        )
        sender_res = await db.execute(sender_stmt)
        top_senders = [
            TopSender(email=row[0], name=row[1] or row[0].split("@")[0], count=row[2])
            for row in sender_res.all()
        ]

        # 7. Query Deadlines today
        # We look for emails with deadlines
        deadline_stmt = select(Email.deadlines, Email.subject, Email.id).where(
            Email.user_id == user_id,
            Email.deadlines.isnot(None)
        )
        deadline_res = await db.execute(deadline_stmt)
        deadlines_today = []
        
        for row in deadline_res.all():
            deadlines_list = row[0]
            if deadlines_list:
                for item in deadlines_list:
                    deadlines_today.append({
                        "task": item.get("task", "Unknown Task"),
                        "deadline": item.get("deadline"),
                        "email_id": str(row[2]),
                        "email_subject": row[1]
                    })

        # 8. Generate Daily AI Summary
        stats_summary = {
            "total_count": total_count,
            "unread_count": unread_count,
            "urgent_count": urgent_count,
            "needs_reply_count": needs_reply_count,
            "categories": categories
        }
        
        daily_summary = await ai_service.generate_daily_insights(stats_summary)

        return DailyInsightsResponse(
            unread_count=unread_count,
            urgent_count=urgent_count,
            needs_reply_count=needs_reply_count,
            categories=categories,
            top_senders=top_senders,
            deadlines_today=deadlines_today,
            daily_summary=daily_summary
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dashboard insights: {str(e)}")
