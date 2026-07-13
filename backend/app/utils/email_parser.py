import base64
from datetime import datetime
from email.utils import parseaddr
from typing import Dict, Any, List, Tuple, Optional

def parse_email_address(address_str: str) -> Tuple[str, str]:
    """
    Parses a string like "John Doe <john@example.com>" or "john@example.com"
    into (name, email)
    """
    if not address_str:
        return "", ""
    name, email = parseaddr(address_str)
    return name or email.split("@")[0] or "", email.lower().strip()

def decode_gmail_body(payload: Dict[str, Any]) -> Tuple[str, str]:
    """
    Traverses the Gmail parts hierarchy recursively to find plain text and HTML bodies.
    Returns (body_plain, body_html)
    """
    body_plain = ""
    body_html = ""

    mime_type = payload.get("mimeType", "")
    body_data = payload.get("body", {}).get("data", "")

    if body_data:
        try:
            # Gmail uses url-safe base64 encoding
            decoded = base64.urlsafe_b64decode(body_data).decode("utf-8", errors="ignore")
            if mime_type == "text/plain":
                body_plain = decoded
            elif mime_type == "text/html":
                body_html = decoded
        except Exception:
            pass

    parts = payload.get("parts", [])
    for part in parts:
        part_plain, part_html = decode_gmail_body(part)
        if part_plain:
            body_plain += "\n" + part_plain
        if part_html:
            body_html += "\n" + part_html

    return body_plain.strip(), body_html.strip()

def parse_gmail_headers(headers: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Extracts key headers (Subject, From, To, Date) from Gmail message headers list.
    """
    header_map = {h["name"].lower(): h["value"] for h in headers}
    
    subject = header_map.get("subject", "")
    
    from_raw = header_map.get("from", "")
    sender_name, sender_email = parse_email_address(from_raw)
    
    to_raw = header_map.get("to", "")
    recipients = []
    if to_raw:
        # Split by comma to support multiple recipients
        for addr in to_raw.split(","):
            name, email = parse_email_address(addr.strip())
            if email:
                recipients.append({"name": name, "email": email})
                
    return {
        "subject": subject,
        "sender_name": sender_name,
        "sender_email": sender_email,
        "recipients": recipients,
        "date_str": header_map.get("date", "")
    }

def parse_gmail_message(msg: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes a Gmail API full message payload into the internal schema structure.
    """
    payload = msg.get("payload", {})
    headers_data = parse_gmail_headers(payload.get("headers", []))
    body_plain, body_html = decode_gmail_body(payload)

    # If body_plain is empty, use snippet
    if not body_plain:
        body_plain = msg.get("snippet", "")
        
    # Convert internal date (epoch milliseconds)
    internal_date_ms = msg.get("internalDate")
    if internal_date_ms:
        try:
            received_at = datetime.utcfromtimestamp(int(internal_date_ms) / 1000.0)
        except Exception:
            received_at = datetime.utcnow()
    else:
        # Parse from date header as fallback
        date_str = headers_data["date_str"]
        try:
            # Attempt to parse common email date formats
            import email.utils
            parsed_date = email.utils.parsedate_to_datetime(date_str)
            received_at = parsed_date.replace(tzinfo=None)
        except Exception:
            received_at = datetime.utcnow()

    # Labels
    label_ids = msg.get("labelIds", [])
    is_read = "UNREAD" not in label_ids
    is_starred = "STARRED" in label_ids

    return {
        "provider": "gmail",
        "message_id": msg.get("id"),
        "thread_id": msg.get("threadId"),
        "subject": headers_data["subject"],
        "sender_email": headers_data["sender_email"],
        "sender_name": headers_data["sender_name"],
        "recipients": headers_data["recipients"],
        "snippet": msg.get("snippet", ""),
        "body_plain": body_plain,
        "body_html": body_html,
        "received_at": received_at,
        "is_read": is_read,
        "is_starred": is_starred,
        "labels": label_ids,
        "raw_payload": msg
    }

def parse_outlook_message(msg: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalizes a Microsoft Graph API Message resource into the internal schema structure.
    """
    subject = msg.get("subject", "") or ""
    
    from_data = msg.get("from", {}).get("emailAddress", {})
    sender_name = from_data.get("name", "") or ""
    sender_email = (from_data.get("address", "") or "").lower().strip()
    
    # Recipients
    recipients = []
    to_recipients = msg.get("toRecipients", [])
    for rec in to_recipients:
        addr = rec.get("emailAddress", {})
        name = addr.get("name", "") or ""
        email = (addr.get("address", "") or "").lower().strip()
        if email:
            recipients.append({"name": name, "email": email})
            
    # Body Plain & HTML
    body_data = msg.get("body", {})
    body_content = body_data.get("content", "") or ""
    body_type = body_data.get("contentType", "text")
    
    body_plain = ""
    body_html = ""
    if body_type.lower() == "html":
        body_html = body_content
        # Basic strip tag helper if needed, otherwise fallback
        # In a real app we might convert HTML to plain text, for now store HTML
        # and let summary/FTS work. Strip simple scripts.
    else:
        body_plain = body_content

    snippet = msg.get("bodyPreview", "") or ""
    if not body_plain and snippet:
        body_plain = snippet
        
    # Received DateTime parsing e.g. "2026-06-11T12:00:00Z"
    received_time_str = msg.get("receivedDateTime")
    if received_time_str:
        try:
            # Handle Z or offset suffix
            t_str = received_time_str.rstrip("Z")
            if "." in t_str:
                t_str = t_str.split(".")[0]
            received_at = datetime.strptime(t_str, "%Y-%m-%dT%H:%M:%S")
        except Exception:
            received_at = datetime.utcnow()
    else:
        received_at = datetime.utcnow()

    is_read = msg.get("isRead", False)
    
    # Categories can act as labels
    categories = msg.get("categories", [])

    return {
        "provider": "outlook",
        "message_id": msg.get("id"),
        "thread_id": msg.get("conversationId"),
        "subject": subject,
        "sender_email": sender_email,
        "sender_name": sender_name,
        "recipients": recipients,
        "snippet": snippet,
        "body_plain": body_plain,
        "body_html": body_html,
        "received_at": received_at,
        "is_read": is_read,
        "is_starred": False,  # outlook uses flag: flaggedStatus
        "labels": categories,
        "raw_payload": msg
    }
