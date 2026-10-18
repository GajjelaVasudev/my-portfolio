"""
SQLAlchemy database models for RAG file tracking and vector storage.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Index
)
from sqlalchemy.orm import declarative_base
from pgvector.sqlalchemy import Vector
from backend.config import settings

Base = declarative_base()


class FileIndex(Base):
    """
    Tracks file-level state and SHA-256 hashes for incremental indexing.
    """
    __tablename__ = "file_index"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_path = Column(String(512), unique=True, nullable=False, index=True)
    file_name = Column(String(256), nullable=False)
    file_hash = Column(String(64), nullable=False)
    chunk_count = Column(Integer, default=0, nullable=False)
    last_modified = Column(DateTime, nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self) -> str:
        return f"<FileIndex(path={self.file_path}, hash={self.file_hash[:8]}..., chunks={self.chunk_count})>"


class DocumentChunk(Base):
    """
    Stores individual textual passages and their corresponding embedding vectors.
    """
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_path = Column(String(512), nullable=False, index=True)
    file_name = Column(String(256), nullable=False)
    section_title = Column(String(256), nullable=False, default="")
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    content_hash = Column(String(64), nullable=False)
    embedding = Column(Vector(settings.embedding_dimension), nullable=True)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        Index("idx_doc_chunk_lookup", "file_path", "chunk_index"),
    )

    def __repr__(self) -> str:
        return f"<DocumentChunk(file={self.file_name}, section='{self.section_title}', idx={self.chunk_index})>"
