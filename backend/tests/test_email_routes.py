from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify that backend health check works correctly."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.0.0"}

def test_emails_unauthorized():
    """Verify that email listing requires Authorization headers."""
    response = client.get("/api/v1/emails")
    assert response.status_code == 401
    assert "detail" in response.json()
