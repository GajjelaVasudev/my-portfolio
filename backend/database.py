"""
Database engine, session management, and schema initialization.
Supports PostgreSQL with pgvector extension.
"""

import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from backend.config import settings
from backend.models import Base

logger = logging.getLogger("rag_assistant.database")

# Create engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> bool:
    """
    Initializes PostgreSQL database, ensures pgvector extension exists,
    and creates required tables.
    Returns True if successful, False otherwise.
    """
    try:
        with engine.connect() as conn:
            # Enable pgvector extension if not already enabled
            logger.info("Verifying pgvector extension in PostgreSQL...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
            conn.commit()

        # Create tables
        logger.info("Creating database tables if not exist...")
        Base.metadata.create_all(bind=engine)

        # Create HNSW vector index for high-speed cosine similarity search
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding_hnsw
                ON document_chunks
                USING hnsw (embedding vector_cosine_ops);
            """))
            conn.commit()

        logger.info("Database schema and vector index initialized successfully.")
        return True
    except Exception as exc:
        logger.error(f"Failed to initialize database: {exc}")
        return False


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
