from cryptography.fernet import Fernet
from app.config import settings

class TokenCrypto:
    def __init__(self, key: str = settings.ENCRYPTION_KEY):
        # The key must be a 32-byte URL-safe base64-encoded string
        # Ensure it fits the requirement. If it doesn't, we will fall back safely.
        try:
            self.fernet = Fernet(key.encode())
        except Exception:
            # Fallback for dev environment if key is invalid
            # Let's generate a valid fallback key to prevent app crash
            import base64
            import hashlib
            hashed_key = base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest())
            self.fernet = Fernet(hashed_key)

    def encrypt(self, token: str) -> str:
        if not token:
            return ""
        return self.fernet.encrypt(token.encode()).decode()

    def decrypt(self, encrypted_token: str) -> str:
        if not encrypted_token:
            return ""
        try:
            return self.fernet.decrypt(encrypted_token.encode()).decode()
        except Exception:
            return ""

token_crypto = TokenCrypto()
