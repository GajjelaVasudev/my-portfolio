"""
Database engine, session management, schema initialization, and pgvector migration.
Supports Supabase / standard PostgreSQL with pgvector extension.
"""

import logging
from typing import Generator, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from backend.config import settings
from backend.models import Base

logger = logging.getLogger("rag_assistant.database")

def normalize_database_url(url: str) -> str:
    """Ensures psycopg v3 driver is used for standard PostgreSQL URLs."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


# Create engine
engine = create_engine(
    normalize_database_url(settings.database_url),
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_existing_vector_dimension(conn) -> Optional[int]:
    """
    Safely inspects the dimension of the embedding column in document_chunks if the table exists.
    Returns None if table or column doesn't exist or if database is not PostgreSQL.
    """
    try:
        if engine.dialect.name != "postgresql":
            return None
        dim_query = text("""
            SELECT atttypmod 
            FROM pg_attribute 
            WHERE attrelid = to_regclass('document_chunks') 
              AND attname = 'embedding' 
              AND NOT attisdropped;
        """)
        dim = conn.execute(dim_query).scalar()
        return int(dim) if dim is not None and dim > 0 else None
    except Exception as exc:
        logger.debug(f"Could not inspect vector column dimension: {exc}")
        return None


def init_db(force_recreate: bool = False) -> bool:
    """
    Initializes PostgreSQL / Supabase database, ensures pgvector extension exists,
    ensures required tables are created, handles vector dimension migrations,
    and builds the HNSW cosine similarity index.

    Initialization order:
    1. Ensure pgvector extension is enabled (for PostgreSQL / Supabase).
    2. Ensure required tables (file_index, document_chunks) exist by calling
       Base.metadata.create_all(bind=engine).
    3. If force_recreate is True or if vector dimension mismatch is detected
       (e.g. migrating from 1536 to 768):
       - Safely reset tables (or drop document_chunks and recreate with current dimension).
    4. Ensure HNSW index exists on document_chunks.embedding.
    """
    is_postgres = engine.dialect.name == "postgresql"

    try:
        with engine.connect() as conn:
            # 1. Enable pgvector extension if PostgreSQL
            if is_postgres:
                logger.info("Ensuring pgvector extension is enabled in PostgreSQL / Supabase...")
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
                conn.commit()

        # 2. Ensure required tables exist BEFORE attempting any table operations
        logger.info("Ensuring database tables (file_index, document_chunks) exist...")
        Base.metadata.create_all(bind=engine)

        with engine.connect() as conn:
            # 3. Handle dimension migration or forced recreation
            current_dim = get_existing_vector_dimension(conn) if is_postgres else None
            needs_dimension_migration = (
                current_dim is not None and current_dim != settings.embedding_dimension
            )

            if force_recreate or needs_dimension_migration:
                if needs_dimension_migration:
                    logger.warning(
                        f"Vector dimension mismatch detected ({current_dim} != {settings.embedding_dimension}). "
                        "Recreating document_chunks table with updated dimension and clearing file_index..."
                    )
                    conn.execute(text("DROP TABLE IF EXISTS document_chunks CASCADE;"))
                    if is_postgres:
                        conn.execute(text("TRUNCATE TABLE file_index RESTART IDENTITY;"))
                    else:
                        conn.execute(text("DELETE FROM file_index;"))
                    conn.commit()
                    # Recreate document_chunks with the updated settings.embedding_dimension
                    Base.metadata.create_all(bind=engine)

                elif force_recreate:
                    logger.info("Full re-index requested: clearing document_chunks and file_index...")
                    if is_postgres:
                        conn.execute(text("TRUNCATE TABLE document_chunks CASCADE;"))
                        conn.execute(text("TRUNCATE TABLE file_index RESTART IDENTITY;"))
                    else:
                        conn.execute(text("DELETE FROM document_chunks;"))
                        conn.execute(text("DELETE FROM file_index;"))
                    conn.commit()

            # 4. Ensure HNSW vector index exists for high-speed cosine similarity search
            if is_postgres:
                logger.info("Ensuring HNSW vector index on document_chunks...")
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding_hnsw
                    ON document_chunks
                    USING hnsw (embedding vector_cosine_ops);
                """))
                conn.commit()

        logger.info(
            f"Database schema and HNSW vector index initialized successfully (Dimension: {settings.embedding_dimension})."
        )
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
