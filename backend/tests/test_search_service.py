import pytest
from app.utils.email_parser import parse_gmail_message, parse_outlook_message, parse_email_address

def test_email_address_parser():
    name, email = parse_email_address("Sarah Jenkins <sarah@boss.com>")
    assert name == "Sarah Jenkins"
    assert email == "sarah@boss.com"
    
    name2, email2 = parse_email_address("simple@gmail.com")
    assert name2 == "simple"
    assert email2 == "simple@gmail.com"

def test_gmail_parser():
    raw_gmail = {
        "id": "gmail-id-123",
        "threadId": "thread-123",
        "snippet": "Quick alert details",
        "internalDate": "1772390400000", # 2026 epoch millisecond
        "payload": {
            "mimeType": "text/plain",
            "headers": [
                {"name": "Subject", "value": "AWS Billing Invoice"},
                {"name": "From", "value": "Amazon Web Services <billing@amazon.com>"},
                {"name": "To", "value": "Developer <dev@inboxpilot.ai>"}
            ],
            "body": {
                "data": "RGVhciBDdXN0b21lciwgeW91ciBiaWxsIGlzIGR1ZS4=" # Base64 for: Dear Customer, your bill is due.
            }
        }
    }
    
    parsed = parse_gmail_message(raw_gmail)
    
    assert parsed["provider"] == "gmail"
    assert parsed["message_id"] == "gmail-id-123"
    assert parsed["subject"] == "AWS Billing Invoice"
    assert parsed["sender_email"] == "billing@amazon.com"
    assert parsed["body_plain"].strip() == "Dear Customer, your bill is due."
    assert parsed["recipients"][0]["email"] == "dev@inboxpilot.ai"

def test_outlook_parser():
    raw_outlook = {
        "id": "outlook-id-456",
        "conversationId": "conv-456",
        "subject": "Team Meeting Sync",
        "bodyPreview": "Standup details",
        "receivedDateTime": "2026-06-11T12:00:00Z",
        "isRead": False,
        "from": {
            "emailAddress": {
                "name": "Marcus Vance",
                "address": "marcus@work.com"
            }
        },
        "toRecipients": [
            {
                "emailAddress": {
                    "name": "Team",
                    "address": "team@work.com"
                }
            }
        ],
        "body": {
            "contentType": "html",
            "content": "<p>Meeting body content</p>"
        }
    }
    
    parsed = parse_outlook_message(raw_outlook)
    
    assert parsed["provider"] == "outlook"
    assert parsed["message_id"] == "outlook-id-456"
    assert parsed["sender_name"] == "Marcus Vance"
    assert parsed["body_html"] == "<p>Meeting body content</p>"
    assert parsed["recipients"][0]["email"] == "team@work.com"
