"""
Vector similarity retriever querying PostgreSQL + pgvector.
Retrieves the most semantically relevant document chunks for a given query.
"""

import logging
from dataclasses import dataclass
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.config import settings
from backend.embeddings import embedding_service
from backend.models import DocumentChunk

logger = logging.getLogger("rag_assistant.retriever")


@dataclass
class RetrievedChunk:
    id: int
    file_path: str
    file_name: str
    section_title: str
    chunk_index: int
    content: str
    similarity_score: float


def retrieve_relevant_chunks(
    db: Session,
    query: str,
    top_k: int = 4,
    threshold: float = 0.25
) -> List[RetrievedChunk]:
    """
    Performs vector cosine similarity search against indexed document chunks.
    Filters out chunks with similarity below threshold.
    """
    query_clean = query.strip()
    if not query_clean:
        return []

    query_embedding = embedding_service.get_embedding(query_clean)
    embedding_str = "[" + ",".join(f"{x:.6f}" for x in query_embedding) + "]"

    try:
        # PostgreSQL pgvector cosine distance operator: <=>
        # Cosine similarity = 1 - cosine_distance
        sql = text("""
            SELECT 
                id,
                file_path,
                file_name,
                section_title,
                chunk_index,
                content,
                1 - (embedding <=> CAST(:query_embedding AS vector)) AS similarity
            FROM document_chunks
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:query_embedding AS vector) ASC
            LIMIT :top_k;
        """)

        results = db.execute(
            sql,
            {"query_embedding": embedding_str, "top_k": top_k}
        ).fetchall()

        retrieved: List[RetrievedChunk] = []
        for row in results:
            sim = float(row.similarity) if row.similarity is not None else 0.0
            if sim >= threshold:
                retrieved.append(RetrievedChunk(
                    id=row.id,
                    file_path=row.file_path,
                    file_name=row.file_name,
                    section_title=row.section_title,
                    chunk_index=row.chunk_index,
                    content=row.content,
                    similarity_score=round(sim, 4)
                ))

        logger.info(f"Retrieved {len(retrieved)} chunks for query: '{query_clean[:40]}...'")
        return retrieved

    except Exception as exc:
        logger.error(f"Vector search failed: {exc}. Attempting fallback text search.")
        # Graceful fallback: text ILIKE query if pgvector isn't accessible
        try:
            chunks = db.query(DocumentChunk).filter(
                DocumentChunk.content.ilike(f"%{query_clean[:30]}%")
            ).limit(top_k).all()

            return [
                RetrievedChunk(
                    id=c.id,
                    file_path=c.file_path,
                    file_name=c.file_name,
                    section_title=c.section_title,
                    chunk_index=c.chunk_index,
                    content=c.content,
                    similarity_score=0.5
                ) for c in chunks
            ]
        except Exception as inner_exc:
            logger.error(f"Fallback search also failed: {inner_exc}")
            return []
