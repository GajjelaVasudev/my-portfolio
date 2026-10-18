"""
Incremental Document Ingestion and Indexing Pipeline.
Scans knowledge-base/ recursively, tracks SHA-256 hashes,
indexes new or modified files, deletes chunks for removed files,
and skips unchanged content.
"""

import sys
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Set

# Ensure backend package can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.config import settings
from backend.database import SessionLocal, init_db
from backend.models import FileIndex, DocumentChunk
from backend.loader import scan_knowledge_base, LoadedDocument
from backend.chunker import chunk_document
from backend.embeddings import embedding_service

# Configure console logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rag_assistant.ingest")


def run_ingestion(base_dir: Path = None) -> Dict[str, any]:
    """
    Executes the incremental indexing pipeline.
    Returns a dictionary summarizing the actions taken.
    """
    if base_dir is None:
        base_dir = settings.knowledge_base_dir

    print("=" * 60)
    print(" RAG KNOWLEDGE BASE — INCREMENTAL INDEXING")
    print(f" Target Directory: {base_dir}")
    print("=" * 60)

    # 1. Ensure database schema and pgvector extension exist
    db_ready = init_db()
    if not db_ready:
        print("[!] Warning: Could not initialize PostgreSQL. Check DATABASE_URL in backend/.env.")
        return {"success": False, "error": "Database initialization failed"}

    db = SessionLocal()

    try:
        # 2. Scan knowledge-base folder
        loaded_docs: List[LoadedDocument] = scan_knowledge_base(base_dir)
        loaded_map: Dict[str, LoadedDocument] = {doc.file_path: doc for doc in loaded_docs}

        # 3. Fetch existing file index from database
        existing_indices: List[FileIndex] = db.query(FileIndex).all()
        index_map: Dict[str, FileIndex] = {idx.file_path: idx for idx in existing_indices}

        added_files: List[str] = []
        updated_files: List[str] = []
        skipped_files: List[str] = []
        removed_files: List[str] = []

        total_chunks_added = 0
        total_chunks_updated = 0

        # 4. Detect Added, Updated, and Skipped files
        for file_path, doc in loaded_map.items():
            if file_path not in index_map:
                # NEW FILE -> Index
                added_files.append(file_path)
                chunks = chunk_document(doc)
                chunk_texts = [c.content for c in chunks]
                embeddings = embedding_service.get_embeddings_batch(chunk_texts)

                for chunk, emb in zip(chunks, embeddings):
                    doc_chunk = DocumentChunk(
                        file_path=chunk.file_path,
                        file_name=chunk.file_name,
                        section_title=chunk.section_title,
                        chunk_index=chunk.chunk_index,
                        content=chunk.content,
                        content_hash=chunk.content_hash,
                        embedding=emb
                    )
                    db.add(doc_chunk)

                new_index = FileIndex(
                    file_path=doc.file_path,
                    file_name=doc.file_name,
                    file_hash=doc.file_hash,
                    chunk_count=len(chunks),
                    last_modified=doc.last_modified
                )
                db.add(new_index)
                total_chunks_added += len(chunks)
                print(f"[+] Added:   {file_path} ({len(chunks)} chunks)")

            elif index_map[file_path].file_hash != doc.file_hash:
                # MODIFIED FILE -> Re-index
                updated_files.append(file_path)

                # Remove old chunks
                db.query(DocumentChunk).filter(DocumentChunk.file_path == file_path).delete()

                # Chunk and embed new version
                chunks = chunk_document(doc)
                chunk_texts = [c.content for c in chunks]
                embeddings = embedding_service.get_embeddings_batch(chunk_texts)

                for chunk, emb in zip(chunks, embeddings):
                    doc_chunk = DocumentChunk(
                        file_path=chunk.file_path,
                        file_name=chunk.file_name,
                        section_title=chunk.section_title,
                        chunk_index=chunk.chunk_index,
                        content=chunk.content,
                        content_hash=chunk.content_hash,
                        embedding=emb
                    )
                    db.add(doc_chunk)

                # Update index entry
                idx_entry = index_map[file_path]
                idx_entry.file_hash = doc.file_hash
                idx_entry.chunk_count = len(chunks)
                idx_entry.last_modified = doc.last_modified
                idx_entry.updated_at = datetime.now(timezone.utc)
                total_chunks_updated += len(chunks)
                print(f"[~] Updated: {file_path} ({len(chunks)} chunks)")

            else:
                # UNCHANGED FILE -> Skip
                skipped_files.append(file_path)
                print(f"[-] Skipped: {file_path} (unchanged)")

        # 5. Detect and purge Deleted files
        active_paths: Set[str] = set(loaded_map.keys())
        for file_path, idx_entry in index_map.items():
            if file_path not in active_paths:
                removed_files.append(file_path)
                # Purge chunks
                db.query(DocumentChunk).filter(DocumentChunk.file_path == file_path).delete()
                # Purge file index
                db.delete(idx_entry)
                print(f"[x] Removed: {file_path} (purged chunks)")

        db.commit()

        # 6. Print Summary Report
        print("-" * 60)
        print(" INGESTION SUMMARY REPORT")
        print(f" Added:   {len(added_files)} files ({total_chunks_added} chunks)")
        print(f" Updated: {len(updated_files)} files ({total_chunks_updated} chunks)")
        print(f" Skipped: {len(skipped_files)} files (unchanged)")
        print(f" Removed: {len(removed_files)} files")
        print("=" * 60)
        print("✓ Vector database is up-to-date with knowledge base.\n")

        return {
            "success": True,
            "added": added_files,
            "updated": updated_files,
            "skipped": skipped_files,
            "removed": removed_files,
            "total_chunks_added": total_chunks_added,
            "total_chunks_updated": total_chunks_updated
        }

    except Exception as exc:
        db.rollback()
        logger.error(f"Ingestion failed with error: {exc}", exc_info=True)
        return {"success": False, "error": str(exc)}
    finally:
        db.close()


if __name__ == "__main__":
    result = run_ingestion()
    sys.exit(0 if result.get("success") else 1)
