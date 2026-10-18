"""
Google Gemini embedding generation service using official Google GenAI Python SDK.
Uses gemini-embedding-001 (768 dimensions via output_dimensionality=768) by default.
Enforces strict error handling in production—never silently falls back to mock embeddings.
"""

import hashlib
import logging
import math
from typing import List, Optional
from backend.config import settings

logger = logging.getLogger("rag_assistant.embeddings")


class GeminiEmbeddingError(RuntimeError):
    """Raised when real Gemini embedding generation fails in live/production mode."""
    pass


def _generate_mock_embedding(text: str, dimension: int = 768) -> List[float]:
    """
    Generates a deterministic, unit-normalized float vector based on MD5/SHA-256 hash.
    Used ONLY when explicit mock mode is active for unit tests or offline development.
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


def is_mock_vector(vector: List[float], zero_ratio_threshold: float = 0.4) -> bool:
    """
    Determines whether a vector is a sparse synthetic/mock vector.
    Real dense Gemini embeddings (gemini-embedding-001) have essentially 0% exact zeros,
    while synthetic mock embeddings have > 85% exact zero values.
    """
    if not vector:
        return False
    zero_count = sum(1 for x in vector if abs(x) < 1e-9)
    return (zero_count / len(vector)) >= zero_ratio_threshold


class EmbeddingService:
    def __init__(self, mock_mode: Optional[bool] = None) -> None:
        self.api_key: Optional[str] = settings.gemini_api_key
        self.model: str = settings.gemini_embedding_model
        self.dimension: int = settings.embedding_dimension
        self.mock_mode: bool = settings.embedding_mock_mode if mock_mode is None else mock_mode
        self._client = None
        self._initialize_client()

    def _initialize_client(self) -> None:
        """Initializes Google GenAI client if in live mode."""
        if self.mock_mode:
            logger.info("EmbeddingService: Explicit development/test mock mode is ENABLED.")
            return

        if not self.api_key or self.api_key in ("your_gemini_api_key_here", "your_openai_api_key_here"):
            logger.warning(
                "EmbeddingService: GEMINI_API_KEY is not configured. "
                "Real embedding requests will raise GeminiEmbeddingError."
            )
            return

        try:
            from google import genai
            self._client = genai.Client(api_key=self.api_key)
            logger.info(f"Google GenAI embedding client initialized with model '{self.model}' (dim={self.dimension}).")
        except Exception as exc:
            logger.error(f"Failed to initialize Google GenAI embedding client: {exc}")

    def get_embedding(self, text: str) -> List[float]:
        """Generates embedding vector for a single string."""
        return self.get_embeddings_batch([text])[0]

    def get_embeddings_batch(self, texts: List[str], batch_size: int = 50) -> List[List[float]]:
        """
        Generates embedding vectors for a list of strings in batches.
        In live mode (mock_mode=False):
          - Calls Google Gemini API via official google-genai SDK.
          - Never silently falls back to mock vectors on failure.
          - Raises GeminiEmbeddingError on any client, API, network, or dimension error.
        In mock mode (mock_mode=True):
          - Produces deterministic test vectors offline.
        """
        if not texts:
            return []

        # Explicit Mock Mode (Unit tests & offline development only)
        if self.mock_mode:
            return [_generate_mock_embedding(t, self.dimension) for t in texts]

        # Production / Live Mode: Strict Real Gemini Embeddings
        if self._client is None:
            # Re-check settings in case api_key or mock_mode was updated dynamically
            if settings.embedding_mock_mode:
                return [_generate_mock_embedding(t, self.dimension) for t in texts]

            self.api_key = settings.gemini_api_key
            self.model = settings.gemini_embedding_model
            self.dimension = settings.embedding_dimension
            if not self.api_key or self.api_key in ("your_gemini_api_key_here", "your_openai_api_key_here"):
                raise GeminiEmbeddingError(
                    "GEMINI_API_KEY is not configured in backend/.env. "
                    "Production ingestion and retrieval require a valid Gemini API key. "
                    "For offline tests, set EMBEDDING_MOCK_MODE=true or pass mock_mode=True."
                )
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as exc:
                raise GeminiEmbeddingError(f"Could not initialize Google GenAI client: {exc}") from exc

        try:
            from google.genai import types
            all_embeddings: List[List[float]] = []

            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                batched_contents = [types.Content(parts=[types.Part(text=t)]) for t in batch]

                response = self._client.models.embed_content(
                    model=self.model,
                    contents=batched_contents,
                    config=types.EmbedContentConfig(
                        output_dimensionality=self.dimension
                    )
                )

                if not response.embeddings or len(response.embeddings) != len(batch):
                    received = len(response.embeddings) if response.embeddings else 0
                    raise GeminiEmbeddingError(
                        f"Expected {len(batch)} embeddings from Gemini model '{self.model}', but received {received}."
                    )

                for emb in response.embeddings:
                    values = list(emb.values)
                    if len(values) != self.dimension:
                        raise GeminiEmbeddingError(
                            f"Dimension mismatch from '{self.model}': expected {self.dimension}, got {len(values)}."
                        )
                    all_embeddings.append(values)

            return all_embeddings

        except Exception as exc:
            if isinstance(exc, GeminiEmbeddingError):
                raise
            logger.error(f"Google Gemini embedding API failure for model '{self.model}': {exc}")
            raise GeminiEmbeddingError(
                f"Google Gemini embedding API failure for model '{self.model}': {exc}. "
                "Halting operation to prevent storing invalid or mock embeddings in database."
            ) from exc


# Global embedding service singleton
embedding_service = EmbeddingService()
