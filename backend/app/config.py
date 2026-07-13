import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str = Field(default="dev_secret_key_change_me_in_production_123456")
    # Base64 encoded 32-byte key for Fernet token encryption
    ENCRYPTION_KEY: str = Field(default="t-NzY25jRlpGdzY2bzdhRjhkZmxmaDk3d3NmNjg5MWE=")
    ALLOWED_ORIGINS: str = Field(default="http://localhost:3000")

    DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres:password@localhost:5432/inboxpilot")
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    OPENAI_API_KEY: str = Field(default="")
    OPENAI_CHAT_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"

    GOOGLE_CLIENT_ID: str = Field(default="")
    GOOGLE_CLIENT_SECRET: str = Field(default="")

    MICROSOFT_CLIENT_ID: str = Field(default="")
    MICROSOFT_CLIENT_SECRET: str = Field(default="")
    MICROSOFT_TENANT_ID: str = "common"

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
