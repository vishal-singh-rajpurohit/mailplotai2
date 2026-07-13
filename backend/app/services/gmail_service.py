import base64
import logging
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import Dict, Any, List, Optional, Tuple
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.utils.token_crypto import token_crypto
from app.utils.email_parser import parse_gmail_message

logger = logging.getLogger(__name__)

class GmailService:
    async def get_valid_token(self, db: AsyncSession, user) -> str:
        """
        Retrieves the user's access token, automatically refreshing it if it is expired.
        """
        # If no client secrets configured, treat as Demo Mode
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
            return "demo_token"

        now = datetime.utcnow()
        # Refresh if token expires in less than 60 seconds
        if user.token_expires_at and user.token_expires_at <= now + timedelta(seconds=60):
            logger.info(f"Gmail access token for user {user.id} expired. Refreshing...")
            new_access_token, new_expires_at = await self.refresh_access_token(
                token_crypto.decrypt(user.refresh_token)
            )
            if new_access_token:
                user.access_token = token_crypto.encrypt(new_access_token)
                user.token_expires_at = new_expires_at
                await db.commit()
                logger.info(f"Gmail access token successfully refreshed for user {user.id}")

        return token_crypto.decrypt(user.access_token)

    async def refresh_access_token(self, refresh_token: str) -> Tuple[Optional[str], Optional[datetime]]:
        """
        Refreshes a Google OAuth access token.
        """
        if not refresh_token:
            return None, None

        url = "https://oauth2.googleapis.com/token"
        data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token"
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, data=data)
                if response.status_code == 200:
                    res_data = response.json()
                    expires_in = res_data.get("expires_in", 3600)
                    new_token = res_data.get("access_token")
                    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                    return new_token, expires_at
                else:
                    logger.error(f"Failed to refresh Google token: {response.status_code} - {response.text}")
                    return None, None
            except Exception as e:
                logger.error(f"Error refreshing Google token: {e}")
                return None, None

    async def fetch_emails(
        self,
        db: AsyncSession,
        user,
        max_results: int = 10,
        query: Optional[str] = None,
        page_token: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        """
        Fetches a list of normalized emails from Gmail.
        """
        # Demo Mode Fallback
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            return self._get_mock_emails(), None

        access_token = await self.get_valid_token(db, user)
        headers = {"Authorization": f"Bearer {access_token}"}
        params = {
            "maxResults": max_results,
            "q": query or "label:INBOX",
        }
        if page_token:
            params["pageToken"] = page_token

        url = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, params=params)
                if response.status_code != 200:
                    logger.error(f"Failed to fetch Gmail message list: {response.text}")
                    return [], None
                
                res_data = response.json()
                messages = res_data.get("messages", [])
                next_page_token = res_data.get("nextPageToken")
                
                normalized_emails = []
                for msg in messages:
                    email_details = await self.get_email(db, user, msg["id"])
                    if email_details:
                        normalized_emails.append(email_details)
                
                return normalized_emails, next_page_token
            except Exception as e:
                logger.error(f"Error fetching Gmail emails: {e}")
                return [], None

    async def get_email(self, db: AsyncSession, user, message_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches and parses a single email from Gmail.
        """
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            # Return matching mock email from mock list
            for mock_mail in self._get_mock_emails():
                if mock_mail["message_id"] == message_id:
                    return mock_mail
            return None

        access_token = await self.get_valid_token(db, user)
        headers = {"Authorization": f"Bearer {access_token}"}
        url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, params={"format": "full"})
                if response.status_code != 200:
                    logger.error(f"Failed to fetch Gmail message details for {message_id}: {response.text}")
                    return None
                
                msg_payload = response.json()
                return parse_gmail_message(msg_payload)
            except Exception as e:
                logger.error(f"Error fetching Gmail message details: {e}")
                return None

    async def mark_as_read(self, db: AsyncSession, user, message_id: str) -> bool:
        """
        Marks an email as read by removing the UNREAD label in Gmail.
        """
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            return True

        access_token = await self.get_valid_token(db, user)
        headers = {"Authorization": f"Bearer {access_token}"}
        url = f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}/modify"
        body = {"removeLabelIds": ["UNREAD"]}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=body)
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Error marking Gmail email as read: {e}")
                return False

    async def send_reply(self, db: AsyncSession, user, thread_id: str, to: str, subject: str, body: str) -> bool:
        """
        Sends a reply to a thread in Gmail.
        """
        if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            logger.info(f"[Mock Send Reply] To: {to}, Subject: {subject}, Body: {body}")
            return True

        access_token = await self.get_valid_token(db, user)
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        # Build MIME Message
        mime_msg = MIMEText(body)
        mime_msg["To"] = to
        mime_msg["From"] = user.email
        mime_msg["Subject"] = subject if subject.lower().startswith("re:") else f"Re: {subject}"
        
        # Convert MIME to raw base64url string
        raw_bytes = mime_msg.as_bytes()
        raw_b64 = base64.urlsafe_b64encode(raw_bytes).decode("utf-8")
        
        payload = {
            "raw": raw_b64,
            "threadId": thread_id
        }
        
        url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code != 200:
                    logger.error(f"Failed to send Gmail reply: {response.text}")
                    return False
                return True
            except Exception as e:
                logger.error(f"Error sending Gmail reply: {e}")
                return False

    def _get_mock_emails(self) -> List[Dict[str, Any]]:
        """
        Returns a list of realistic mock emails for local development/Demo Mode.
        """
        now = datetime.utcnow()
        return [
            {
                "provider": "gmail",
                "message_id": "mock-gmail-1",
                "thread_id": "thread-gmail-1",
                "subject": "URGENT: Review Q2 Project Deliverables and Budget Sign-off",
                "sender_email": "boss@inboxpilot.ai",
                "sender_name": "Sarah Jenkins (Director)",
                "recipients": [{"name": "Developer", "email": "dev@example.com"}],
                "snippet": "Hi Team, we need to review the Q2 project budget plan and finalize our resource list by 5 PM today. Please check the attached document...",
                "body_plain": "Hi Team,\n\nWe need to review the Q2 project budget plan and finalize our resource list by 5 PM today. Please check the attached document and send me your final sign-off. It is critical we submit this to the finance team before their deadline.\n\nThanks,\nSarah Jenkins\nDirector of Operations",
                "body_html": "<p>Hi Team,</p><p>We need to review the Q2 project budget plan and finalize our resource list by 5 PM today. Please check the attached document and send me your final sign-off. It is critical we submit this to the finance team before their deadline.</p><p>Thanks,<br>Sarah Jenkins<br>Director of Operations</p>",
                "received_at": now - timedelta(hours=1),
                "is_read": False,
                "is_starred": True,
                "labels": ["INBOX", "UNREAD", "IMPORTANT"],
                "raw_payload": {}
            },
            {
                "provider": "gmail",
                "message_id": "mock-gmail-2",
                "thread_id": "thread-gmail-2",
                "subject": "Action Required: College Midterm Exam Registration Schedule",
                "sender_email": "registrar@university.edu",
                "sender_name": "University Registrar Office",
                "recipients": [{"name": "Student", "email": "dev@example.com"}],
                "snippet": "Dear Student, registration for the upcoming Spring Midterm Exams is now open. The deadline to complete your registration is June 15 at 11:59 PM...",
                "body_plain": "Dear Student,\n\nRegistration for the upcoming Spring Midterm Exams is now open. The deadline to complete your course registration is June 15, 2026 at 11:59 PM. Late registrations will not be accepted under any circumstances. Please login to the portal and select your courses.\n\nSincerely,\nRegistrar Office",
                "body_html": "<p>Dear Student,</p><p>Registration for the upcoming Spring Midterm Exams is now open. The deadline to complete your course registration is June 15, 2026 at 11:59 PM. Late registrations will not be accepted under any circumstances. Please login to the portal and select your courses.</p><p>Sincerely,<br>Registrar Office</p>",
                "received_at": now - timedelta(hours=4),
                "is_read": False,
                "is_starred": False,
                "labels": ["INBOX", "UNREAD"],
                "raw_payload": {}
            },
            {
                "provider": "gmail",
                "message_id": "mock-gmail-3",
                "thread_id": "thread-gmail-3",
                "subject": "Security Alert: New Sign-in Detected from Chrome on Linux",
                "sender_email": "security@google.com",
                "sender_name": "Google Accounts Security",
                "recipients": [{"name": "User", "email": "dev@example.com"}],
                "snippet": "Your Google Account was just signed in to from a new Linux device. If this was you, no action is needed. If this wasn't you, please secure your account...",
                "body_plain": "Your Google Account was just signed in to from a new Linux device.\n\nDevice: Chrome on Linux\nIP Address: 198.51.100.42\nLocation: Paris, France\n\nIf this was you, you can safely ignore this email. If this wasn't you, please go to your account security dashboard and reset your password immediately.",
                "body_html": "<p>Your Google Account was just signed in to from a new Linux device.</p><p><b>Device:</b> Chrome on Linux<br><b>IP:</b> 198.51.100.42<br><b>Location:</b> Paris, France</p><p>If this was you, you can safely ignore this email. If this wasn't you, please reset your password immediately.</p>",
                "received_at": now - timedelta(hours=12),
                "is_read": True,
                "is_starred": False,
                "labels": ["INBOX"],
                "raw_payload": {}
            },
            {
                "provider": "gmail",
                "message_id": "mock-gmail-4",
                "thread_id": "thread-gmail-4",
                "subject": "Invoice INVC-98441 for AWS Services - Overdue",
                "sender_email": "billing@amazon.com",
                "sender_name": "Amazon Web Services Billing",
                "recipients": [{"name": "Finance", "email": "dev@example.com"}],
                "snippet": "AWS Billing department: Invoice INVC-98441 for $42.50 is past due. Please settle this payment immediately to prevent service suspension...",
                "body_plain": "AWS Billing department:\n\nYour AWS invoice INVC-98441 for $42.50 is past due. The original payment date was June 5. Please update your credit card details and settle this payment immediately to prevent service suspension.",
                "body_html": "<p>AWS Billing department:</p><p>Your AWS invoice INVC-98441 for <b>$42.50</b> is past due. The original payment date was June 5. Please update your credit card details and settle this payment immediately to prevent service suspension.</p>",
                "received_at": now - timedelta(days=1),
                "is_read": False,
                "is_starred": False,
                "labels": ["INBOX", "UNREAD"],
                "raw_payload": {}
            },
            {
                "provider": "gmail",
                "message_id": "mock-gmail-5",
                "thread_id": "thread-gmail-5",
                "subject": "Upcoming Coffee catch-up / Sync",
                "sender_email": "friend@gmail.com",
                "sender_name": "Alex Mercer",
                "recipients": [{"name": "Alex", "email": "dev@example.com"}],
                "snippet": "Hey, are you free for a coffee sync sometime this week? Let me know what days work best for you. Cheers!",
                "body_plain": "Hey,\n\nAre you free for a coffee sync sometime this week? Let me know what days work best for you. It's been a while since we caught up.\n\nCheers,\nAlex",
                "body_html": "<p>Hey,</p><p>Are you free for a coffee sync sometime this week? Let me know what days work best for you. It's been a while since we caught up.</p><p>Cheers,<br>Alex</p>",
                "received_at": now - timedelta(days=2),
                "is_read": True,
                "is_starred": False,
                "labels": ["INBOX"],
                "raw_payload": {}
            }
        ]

gmail_service = GmailService()
