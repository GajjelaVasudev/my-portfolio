"""
Application configuration using Pydantic Settings.
Loads values from environment variables or a backend/.env file.
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

    # LLM & Embeddings
    openai_api_key: Optional[str] = Field(default=None, description="OpenAI API key")
    openai_base_url: Optional[str] = Field(default=None, description="Custom base URL for OpenAI-compatible providers")
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.2

    # Retrieval
    knowledge_base_dir: Path = DEFAULT_KNOWLEDGE_BASE_DIR
    top_k_chunks: int = 4
    similarity_threshold: float = 0.35

    # Rate Limiting & Security
    rate_limit_per_minute: int = 20
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


# Global settings singleton
settings = Settings()
