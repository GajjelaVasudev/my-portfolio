"""
Embedding generation service.
Uses OpenAI text-embedding-3-small by default, with support for custom base URLs
and a deterministic fallback generator when API keys are not yet configured.
"""

import hashlib
import logging
import math
from typing import List, Optional
from backend.config import settings

logger = logging.getLogger("rag_assistant.embeddings")


def _generate_mock_embedding(text: str, dimension: int = 1536) -> List[float]:
    """
    Generates a deterministic, unit-normalized float vector based on SHA-256 hash.
    Used for local testing and graceful fallback when OPENAI_API_KEY is not configured.
    """
    vector = [0.0] * dimension
    words = text.lower().split()
    
    for word in words:
        h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
        idx = h % dimension
        sign = 1.0 if ((h >> 4) % 2 == 0) else -1.0
        vector[idx] += sign

    # Unit-normalize vector
    norm = math.sqrt(sum(x * x for x in vector))
    if norm > 0:
        vector = [x / norm for x in vector]
    else:
        vector[0] = 1.0
        
    return vector


class EmbeddingService:
    def __init__(self) -> None:
        self.api_key: Optional[str] = settings.openai_api_key
        self.base_url: Optional[str] = settings.openai_base_url
        self.model: str = settings.embedding_model
        self.dimension: int = settings.embedding_dimension
        self._client = None

        if self.api_key and self.api_key != "your_openai_api_key_here":
            try:
                from openai import OpenAI
                kwargs = {"api_key": self.api_key}
                if self.base_url:
                    kwargs["base_url"] = self.base_url
                self._client = OpenAI(**kwargs)
                logger.info(f"OpenAI embedding client initialized with model '{self.model}'.")
            except Exception as exc:
                logger.warning(f"Could not initialize OpenAI client: {exc}. Falling back to mock generator.")
        else:
            logger.info("No valid OPENAI_API_KEY provided; using deterministic fallback embedding generator for testing.")

    def get_embedding(self, text: str) -> List[float]:
        """Generates embedding vector for a single string."""
        return self.get_embeddings_batch([text])[0]

    def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embedding vectors for a list of strings."""
        if not texts:
            return []

        # If client is available and active
        if self._client:
            try:
                response = self._client.embeddings.create(
                    model=self.model,
                    input=texts
                )
                return [item.embedding for item in response.data]
            except Exception as exc:
                logger.error(f"OpenAI embedding generation failed: {exc}. Falling back to mock generator.")

        # Fallback generator for tests or unconfigured keys
        return [_generate_mock_embedding(t, self.dimension) for t in texts]


# Global embedding service singleton
embedding_service = EmbeddingService()
