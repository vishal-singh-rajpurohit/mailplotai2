from typing import List, Dict, Any
from pydantic import BaseModel

class TopSender(BaseModel):
    email: str
    name: str
    count: int

class DailyInsightsResponse(BaseModel):
    unread_count: int
    urgent_count: int
    needs_reply_count: int
    categories: Dict[str, int]
    top_senders: List[TopSender] = []
    deadlines_today: List[Dict[str, Any]] = []
    daily_summary: str
