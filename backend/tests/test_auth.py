import pytest
from app.utils.token_crypto import token_crypto
from app.utils.security import create_access_token, verify_token

def test_token_crypto():
    """Verify Fernet encryption and decryption utilities."""
    secret = "secret-google-oauth-token-12345"
    encrypted = token_crypto.encrypt(secret)
    assert encrypted != secret
    
    decrypted = token_crypto.decrypt(encrypted)
    assert decrypted == secret

def test_token_crypto_empty():
    assert token_crypto.encrypt("") == ""
    assert token_crypto.decrypt("") == ""

def test_jwt_generation():
    """Verify JWT session creation and validation."""
    data = {"sub": "1234-abcd", "email": "test@example.com"}
    token = create_access_token(data)
    
    decoded = verify_token(token)
    assert decoded is not None
    assert decoded["sub"] == "1234-abcd"
    assert decoded["email"] == "test@example.com"

def test_jwt_invalid():
    assert verify_token("invalid.token.here") is None
