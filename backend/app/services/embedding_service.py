import hashlib
import random
import logging
from typing import List
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
            logger.warning("OPENAI_API_KEY not configured. Running in Mock Embedding fallback mode.")

    async def get_embedding(self, text: str) -> List[float]:
        """
        Generates a 1536-dimensional embedding using OpenAI or a deterministic fallback mock.
        """
        if not text:
            return [0.0] * 1536

        if not self.client:
            return self._mock_embedding(text)

        try:
            # Clean and truncate input text to avoid token limit errors
            clean_text = text.replace("\n", " ")[:8000]
            response = await self.client.embeddings.create(
                model=settings.OPENAI_EMBEDDING_MODEL,
                input=clean_text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error calling OpenAI embedding API: {e}")
            return self._mock_embedding(text)

    def _mock_embedding(self, text: str) -> List[float]:
        """
        Generates a deterministic 1536-dim normalized vector based on MD5 hash of text.
        This provides basic functional testing for vector queries locally without the API.
        """
        hash_val = int(hashlib.md5(text.encode("utf-8", errors="ignore")).hexdigest(), 16)
        rng = random.Random(hash_val)
        
        # Generate 1536 random values
        vec = [rng.gauss(0, 1) for _ in range(1536)]
        
        # Normalize the vector to unit length
        norm = sum(x*x for x in vec) ** 0.5
        if norm > 0:
            vec = [x / norm for x in vec]
            
        return vec

embedding_service = EmbeddingService()
