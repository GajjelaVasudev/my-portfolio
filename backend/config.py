"""
Application configuration using Pydantic Settings.
Loads values from environment variables or a backend/.env file.
Supports multi-provider AI fallback (Gemini primary, OpenAI fallback 1, Groq fallback 2).
"""

from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
DEFAULT_KNOWLEDGE_BASE_DIR = PROJECT_ROOT / "knowledge-base"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    environment: str = "development"
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/portfolio_rag",
        description="PostgreSQL connection string with pgvector extension"
    )

    # Provider 1 (Primary): Google Gemini
    gemini_api_key: Optional[str] = Field(default=None, description="Google Gemini API key")
    google_api_key: Optional[str] = Field(default=None, description="Google API key alias")
    gemini_generation_model: str = Field(default="gemini-flash-lite-latest", description="Gemini generation model (e.g. gemini-flash-lite-latest or gemini-3.5-flash-lite)")
    gemini_embedding_model: str = Field(default="gemini-embedding-001", description="Gemini embedding model (gemini-embedding-001)")
    gemini_temperature: float = Field(default=0.2, description="Temperature for grounded generation")
    embedding_dimension: int = Field(default=768, description="Vector dimension for gemini-embedding-001 (768)")
    embedding_mock_mode: bool = Field(default=False, description="Enable explicit mock embeddings for development or unit tests only")

    # Provider 2 (Fallback 1): OpenAI
    openai_api_key: Optional[str] = Field(default=None, description="OpenAI API key")
    openai_model: str = Field(default="gpt-4o-mini", description="OpenAI chat model")

    # Provider 3 (Fallback 2): Groq
    groq_api_key: Optional[str] = Field(default=None, description="Groq API key")
    groq_model: str = Field(default="llama-3.3-70b-versatile", description="Groq chat model")

    # Bounded Provider Execution
    provider_timeout_seconds: float = Field(default=12.0, description="Per-provider bounded timeout in seconds")

    # Retrieval
    knowledge_base_dir: Path = DEFAULT_KNOWLEDGE_BASE_DIR
    top_k_chunks: int = 6
    similarity_threshold: float = 0.30

    # Rate Limiting & Security
    rate_limit_per_minute: int = 20
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://portfolio-rag-backend-vkq8.onrender.com"

    @property
    def effective_gemini_api_key(self) -> Optional[str]:
        """Resolves either GOOGLE_API_KEY or GEMINI_API_KEY with whitespace stripped."""
        val = self.google_api_key or self.gemini_api_key
        return val.strip() if val and val.strip() else None

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# Global settings singleton
settings = Settings()
