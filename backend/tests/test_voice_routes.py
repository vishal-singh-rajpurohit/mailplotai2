from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_voice_transcribe_unauthorized():
    """Verify that voice transcription requires token authentication."""
    response = client.post("/api/v1/voice/transcribe")
    assert response.status_code == 401

def test_voice_command_unauthorized():
    """Verify that voice commands require token authentication."""
    response = client.post("/api/v1/voice/command", json={"transcript": "show work emails"})
    assert response.status_code == 401
