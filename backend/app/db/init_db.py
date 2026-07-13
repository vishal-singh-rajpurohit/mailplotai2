import asyncio
import logging
from sqlalchemy import text
from app.db.database import engine, Base
# Import models to register them on the Base.metadata
from app.models.user import User
from app.models.email import Email
from app.models.sync_job import SyncJob
from app.models.voice_command import VoiceCommand

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    """
    Enables pgvector and initializes all database tables.
    """
    logger.info("Initializing database connection...")
    try:
        async with engine.begin() as conn:
            # 1. Enable pgvector extension
            logger.info("Enabling pgvector extension...")
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            
            # 2. Create all tables
            logger.info("Creating database tables...")
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.exception("Error initializing database:")
        raise

if __name__ == "__main__":
    asyncio.run(init_db())
