import pytest
from app.services.ai_service import ai_service
from app.services.embedding_service import embedding_service

@pytest.mark.asyncio
async def test_ai_email_analysis_invoice():
    """Verify that rule-based AI analyzer handles invoice emails."""
    res = await ai_service.analyze_email(
        subject="Invoice INVC-904 overdue",
        body="Dear client, your AWS bill of $42.50 is past due. Settle the payment immediately.",
        sender_name="AWS Billing",
        sender_email="billing@aws.com"
    )
    
    assert res["category"] == "invoice"
    assert res["urgency_score"] >= 0.7
    assert res["needs_reply"] is True
    assert len(res["action_items"]) > 0
    assert "simple_explanation_hi" in res and len(res["simple_explanation_hi"]) > 0

@pytest.mark.asyncio
async def test_ai_voice_command_parsing():
    """Verify that voice commands are parsed into structured filters."""
    res = await ai_service.parse_voice_command("show unread urgent work emails about budget")
    filters = res["filters"]
    
    assert filters["is_unread"] is True
    assert filters["category"] == "work"
    assert filters["urgency_min"] == 0.7

@pytest.mark.asyncio
async def test_deterministic_embedding_generation():
    """Verify mock embeddings create uniform 1536 float arrays."""
    text1 = "Subject: Hello\nBody: Hello world"
    text2 = "Subject: Invoice\nBody: Overdue bill"
    
    embed1 = await embedding_service.get_embedding(text1)
    embed2 = await embedding_service.get_embedding(text2)
    
    assert len(embed1) == 1536
    assert len(embed2) == 1536
    # Deterministic output verification
    embed1_again = await embedding_service.get_embedding(text1)
    assert embed1 == embed1_again
