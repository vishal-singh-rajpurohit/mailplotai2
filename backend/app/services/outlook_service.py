import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.utils.token_crypto import token_crypto
from app.utils.email_parser import parse_outlook_message

logger = logging.getLogger(__name__)

class OutlookService:
    async def get_valid_token(self, db: AsyncSession, user) -> str:
        """
        Retrieves the user's Microsoft Graph access token, automatically refreshing it if it is expired.
        """
        # If no client secrets configured, treat as Demo Mode
        if not settings.MICROSOFT_CLIENT_ID or not settings.MICROSOFT_CLIENT_SECRET:
            return "demo_token"

        now = datetime.utcnow()
        # Refresh if token expires in less than 60 seconds
        if user.token_expires_at and user.token_expires_at <= now + timedelta(seconds=60):
            logger.info(f"Outlook access token for user {user.id} expired. Refreshing...")
            new_access_token, new_expires_at = await self.refresh_access_token(
                token_crypto.decrypt(user.refresh_token)
            )
            if new_access_token:
                user.access_token = token_crypto.encrypt(new_access_token)
                user.token_expires_at = new_expires_at
                await db.commit()
                logger.info(f"Outlook access token successfully refreshed for user {user.id}")

        return token_crypto.decrypt(user.access_token)

    async def refresh_access_token(self, refresh_token: str) -> Tuple[Optional[str], Optional[datetime]]:
        """
        Refreshes a Microsoft OAuth access token.
        """
        if not refresh_token:
            return None, None

        tenant_id = settings.MICROSOFT_TENANT_ID or "common"
        url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        
        # Scopes requested in Microsoft Graph API
        scopes = "openid email profile offline_access https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send"
        
        data = {
            "client_id": settings.MICROSOFT_CLIENT_ID,
            "client_secret": settings.MICROSOFT_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
            "scope": scopes
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
                    logger.error(f"Failed to refresh Microsoft token: {response.status_code} - {response.text}")
                    return None, None
            except Exception as e:
                logger.error(f"Error refreshing Microsoft token: {e}")
                return None, None

    async def fetch_emails(
        self,
        db: AsyncSession,
        user,
        top: int = 10,
        filter_query: Optional[str] = None,
        skip_token: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], Optional[str]]:
        """
        Fetches a list of normalized emails from Outlook (Microsoft Graph API).
        """
        # Demo Mode Fallback
        if not settings.MICROSOFT_CLIENT_ID or not settings.MICROSOFT_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            return self._get_mock_emails(), None

        access_token = await self.get_valid_token(db, user)
        headers = {"Authorization": f"Bearer {access_token}"}
        
        url = "https://graph.microsoft.com/v1.0/me/messages"
        
        params = {
            "$top": top,
            "$select": "id,subject,from,toRecipients,receivedDateTime,isRead,bodyPreview,body,categories"
        }
        if filter_query:
            params["$filter"] = filter_query
        if skip_token:
            params["$skiptoken"] = skip_token

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers, params=params)
                if response.status_code != 200:
                    logger.error(f"Failed to fetch Outlook message list: {response.text}")
                    return [], None
                
                res_data = response.json()
                messages = res_data.get("value", [])
                
                # Check for next link (skiptoken)
                next_link = res_data.get("@odata.nextLink", "")
                next_skip_token = None
                if next_link and "$skiptoken=" in next_link:
                    next_skip_token = next_link.split("$skiptoken=")[-1]
                
                normalized_emails = []
                for msg in messages:
                    normalized_emails.append(parse_outlook_message(msg))
                
                return normalized_emails, next_skip_token
            except Exception as e:
                logger.error(f"Error fetching Outlook emails: {e}")
                return [], None

    async def get_email(self, db: AsyncSession, user, message_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches and parses a single email from Outlook.
        """
        if not settings.MICROSOFT_CLIENT_ID or not settings.MICROSOFT_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            # Return matching mock email from mock list
            for mock_mail in self._get_mock_emails():
                if mock_mail["message_id"] == message_id:
                    return mock_mail
            return None

        access_token = await self.get_valid_token(db, user)
        headers = {"Authorization": f"Bearer {access_token}"}
        url = f"https://graph.microsoft.com/v1.0/me/messages/{message_id}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=headers)
                if response.status_code != 200:
                    logger.error(f"Failed to fetch Outlook message details for {message_id}: {response.text}")
                    return None
                
                msg_payload = response.json()
                return parse_outlook_message(msg_payload)
            except Exception as e:
                logger.error(f"Error fetching Outlook message details: {e}")
                return None

    async def mark_as_read(self, db: AsyncSession, user, message_id: str) -> bool:
        """
        Marks an email as read in Outlook.
        """
        if not settings.MICROSOFT_CLIENT_ID or not settings.MICROSOFT_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            return True

        access_token = await self.get_valid_token(db, user)
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        url = f"https://graph.microsoft.com/v1.0/me/messages/{message_id}"
        body = {"isRead": True}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.patch(url, headers=headers, json=body)
                return response.status_code == 200
            except Exception as e:
                logger.error(f"Error marking Outlook email as read: {e}")
                return False

    async def send_reply(self, db: AsyncSession, user, message_id: str, body: str) -> bool:
        """
        Sends a reply to an email in Outlook.
        Uses Graph API's reply action which populates thread properties automatically.
        """
        if not settings.MICROSOFT_CLIENT_ID or not settings.MICROSOFT_CLIENT_SECRET or user.provider == "demo" or user.email.startswith("demo_"):
            logger.info(f"[Mock Outlook Reply] ParentMsg: {message_id}, Body: {body}")
            return True

        access_token = await self.get_valid_token(db, user)
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        url = f"https://graph.microsoft.com/v1.0/me/messages/{message_id}/reply"
        payload = {
            "comment": body
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code not in (200, 202):
                    logger.error(f"Failed to send Outlook reply: {response.text}")
                    return False
                return True
            except Exception as e:
                logger.error(f"Error sending Outlook reply: {e}")
                return False

    def _get_mock_emails(self) -> List[Dict[str, Any]]:
        """
        Returns a list of realistic mock emails for local development/Demo Mode.
        """
        now = datetime.utcnow()
        return [
            {
                "provider": "outlook",
                "message_id": "mock-outlook-1",
                "thread_id": "thread-outlook-1",
                "subject": "Invoice Paid: Your Weekly Cloud Infrastructure Receipt",
                "sender_email": "billing@azure.com",
                "sender_name": "Microsoft Azure Billing",
                "recipients": [{"name": "Developer", "email": "dev@example.com"}],
                "snippet": "We have successfully processed your monthly recurring billing. Payment of $159.00 has been debited from your card ending 4242...",
                "body_plain": "Dear Customer,\n\nWe have successfully processed your monthly recurring billing. Payment of $159.00 has been debited from your card ending 4242.\n\nTransaction ID: AZ-4899120\nBilling Period: May 10 - June 10, 2026\n\nNo further action is required from your side.",
                "body_html": "<p>Dear Customer,</p><p>We have successfully processed your monthly recurring billing. Payment of <b>$159.00</b> has been debited from your card ending 4242.</p><p><b>Transaction ID:</b> AZ-4899120<br><b>Billing Period:</b> May 10 - June 10, 2026</p>",
                "received_at": now - timedelta(hours=2),
                "is_read": True,
                "is_starred": False,
                "labels": ["Finance"],
                "raw_payload": {}
            },
            {
                "provider": "outlook",
                "message_id": "mock-outlook-2",
                "thread_id": "thread-outlook-2",
                "subject": "Weekly Team Standup Meeting invite",
                "sender_email": "manager@workplace.com",
                "sender_name": "Marcus Vance (Manager)",
                "recipients": [{"name": "Team", "email": "dev@example.com"}],
                "snippet": "Hey team, this is a reminder for our weekly sync scheduled for tomorrow morning. Please prepare your updates on the project dashboard...",
                "body_plain": "Hey team,\n\nThis is a reminder for our weekly standup sync scheduled for tomorrow morning (June 12) at 10:00 AM EST.\n\nPlease update your tickets on the sprint board and prepare your slides. Let me know if you cannot make it.\n\nJoin link: https://teams.microsoft.com/l/meetup-join/19%3ameeting...",
                "body_html": "<p>Hey team,</p><p>This is a reminder for our weekly standup sync scheduled for tomorrow morning (June 12) at 10:00 AM EST.</p><p>Please update your tickets on the sprint board. <a href='https://teams.microsoft.com/'>Teams link</a></p>",
                "received_at": now - timedelta(hours=6),
                "is_read": False,
                "is_starred": False,
                "labels": ["Work"],
                "raw_payload": {}
            }
        ]

outlook_service = OutlookService()
