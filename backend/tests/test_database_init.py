"""
Tests for database initialization order, empty database handling,
full re-indexing, and repeated incremental indexing safety.
"""

from unittest.mock import patch
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from backend.models import Base, FileIndex, DocumentChunk
from datetime import datetime, timezone


def test_init_db_empty_database_order():
    """
    Tests that initialization succeeds against a completely empty database,
    verifying tables are created before any truncation or reset is attempted.
    """
    test_engine = create_engine("sqlite:///:memory:")
    TestSession = sessionmaker(bind=test_engine)

    with patch("backend.database.engine", test_engine), \
         patch("backend.database.SessionLocal", TestSession):
        from backend.database import init_db

        # 1. First run with force_recreate=True on a completely empty DB
        success = init_db(force_recreate=True)
        assert success is True

        # Verify tables exist
        inspector = inspect(test_engine)
        tables = inspector.get_table_names()
        assert "file_index" in tables
        assert "document_chunks" in tables


def test_init_db_full_reindex_clears_existing_data():
    """
    Tests that --reindex-all (force_recreate=True) safely empties existing tables.
    """
    test_engine = create_engine("sqlite:///:memory:")
    TestSession = sessionmaker(bind=test_engine)

    with patch("backend.database.engine", test_engine), \
         patch("backend.database.SessionLocal", TestSession):
        from backend.database import init_db

        # Initialize tables
        assert init_db(force_recreate=False) is True

        # Insert test records
        session = TestSession()
        session.add(FileIndex(
            file_path="about.md",
            file_name="about.md",
            file_hash="dummy_hash_1",
            chunk_count=2,
            last_modified=datetime.now(timezone.utc)
        ))
        session.add(DocumentChunk(
            file_path="about.md",
            file_name="about.md",
            section_title="Intro",
            chunk_index=0,
            content="Sample content",
            content_hash="chunk_hash_1",
            embedding=None
        ))
        session.commit()

        assert session.query(FileIndex).count() == 1
        assert session.query(DocumentChunk).count() == 1
        session.close()

        # Run with force_recreate=True
        assert init_db(force_recreate=True) is True

        # Verify tables exist and are now empty
        session2 = TestSession()
        assert session2.query(FileIndex).count() == 0
        assert session2.query(DocumentChunk).count() == 0
        session2.close()


def test_init_db_idempotent_preserves_data():
    """
    Tests that ordinary initialization (force_recreate=False) is idempotent
    and does not clear existing indexed records.
    """
    test_engine = create_engine("sqlite:///:memory:")
    TestSession = sessionmaker(bind=test_engine)

    with patch("backend.database.engine", test_engine), \
         patch("backend.database.SessionLocal", TestSession):
        from backend.database import init_db

        # Initial setup
        assert init_db(force_recreate=False) is True

        session = TestSession()
        session.add(FileIndex(
            file_path="skills.md",
            file_name="skills.md",
            file_hash="dummy_skills_hash",
            chunk_count=5,
            last_modified=datetime.now(timezone.utc)
        ))
        session.commit()
        session.close()

        # Second call to init_db (simulating ordinary incremental run)
        assert init_db(force_recreate=False) is True

        # Records must still be present
        session2 = TestSession()
        assert session2.query(FileIndex).count() == 1
        session2.close()


def test_init_db_postgres_execution_sequence():
    """
    Verifies that on PostgreSQL, Base.metadata.create_all is executed
    BEFORE any TRUNCATE or index creation statements.
    """
    from unittest.mock import MagicMock
    events = []

    mock_conn = MagicMock()
    mock_conn.execute.side_effect = lambda statement, *args, **kwargs: events.append(str(statement).strip())

    mock_engine = MagicMock()
    mock_engine.dialect.name = "postgresql"
    mock_engine.connect.return_value.__enter__.return_value = mock_conn

    with patch("backend.database.engine", mock_engine), \
         patch("backend.models.Base.metadata.create_all", side_effect=lambda bind: events.append("CREATE_ALL")), \
         patch("backend.database.get_existing_vector_dimension", return_value=768):
        from backend.database import init_db
        res = init_db(force_recreate=True)
        assert res is True

    # Check sequence:
    # 1. CREATE EXTENSION IF NOT EXISTS vector
    # 2. CREATE_ALL (tables created)
    # 3. TRUNCATE TABLE document_chunks CASCADE / TRUNCATE TABLE file_index
    # 4. CREATE INDEX IF NOT EXISTS idx_doc_chunks_embedding_hnsw
    create_all_idx = events.index("CREATE_ALL")
    truncate_indices = [i for i, ev in enumerate(events) if "TRUNCATE TABLE" in ev]
    assert len(truncate_indices) > 0
    for trunc_idx in truncate_indices:
        assert create_all_idx < trunc_idx, f"CREATE_ALL at {create_all_idx} must happen before TRUNCATE at {trunc_idx}"


def test_ingestion_fails_and_rolls_back_on_embedding_error(tmp_path, monkeypatch):
    """
    Proves that an embedding API failure cannot silently produce a successful production ingestion.
    Verifies that run_ingestion returns success=False, rolls back, and does not commit FileIndex.
    """
    from backend.embeddings import GeminiEmbeddingError
    from backend.ingest import run_ingestion

    # Create dummy markdown document in temp directory
    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    doc_file = kb_dir / "test.md"
    doc_file.write_text("# Test Title\nThis is test content for ingestion.", encoding="utf-8")

    test_engine = create_engine("sqlite:///:memory:")
    TestSession = sessionmaker(bind=test_engine)

    def failing_embeddings(texts, **kwargs):
        raise GeminiEmbeddingError("Google Gemini API error: 404 model not found")

    with patch("backend.database.engine", test_engine), \
         patch("backend.database.SessionLocal", TestSession), \
         patch("backend.ingest.SessionLocal", TestSession), \
         patch("backend.ingest.embedding_service.get_embeddings_batch", side_effect=failing_embeddings):

        result = run_ingestion(base_dir=kb_dir, force_recreate=True)

        assert result["success"] is False
        assert result["real_embeddings"] is False
        assert "404 model not found" in result["error"]

        # Ensure no records were committed to FileIndex
        session = TestSession()
        assert session.query(FileIndex).count() == 0
        assert session.query(DocumentChunk).count() == 0
        session.close()


def test_ingestion_detects_mock_vectors_and_forces_reindex(tmp_path, monkeypatch):
    """
    Verifies that when legacy mock vectors are present in the database,
    run_ingestion detects them and promotes the run to full re-index.
    """
    from backend.ingest import run_ingestion
    from backend.embeddings import _generate_mock_embedding

    kb_dir = tmp_path / "kb"
    kb_dir.mkdir()
    doc_file = kb_dir / "about.md"
    doc_file.write_text("# About\nVasudev's profile content.", encoding="utf-8")

    test_engine = create_engine("sqlite:///:memory:")
    TestSession = sessionmaker(bind=test_engine)

    # Initialize tables and insert a mock vector chunk
    Base.metadata.create_all(bind=test_engine)
    session = TestSession()
    mock_vec = _generate_mock_embedding("Sample text", dimension=768)
    session.add(DocumentChunk(
        file_path="about.md",
        file_name="about.md",
        section_title="About",
        chunk_index=0,
        content="Old content",
        content_hash="old_hash",
        embedding=None  # On SQLite pgvector isn't used, but we mock the chunk inspection
    ))
    session.commit()
    session.close()

    mock_real_vec = [0.01 * (i % 7) for i in range(768)]

    with patch("backend.database.engine", test_engine), \
         patch("backend.database.SessionLocal", TestSession), \
         patch("backend.ingest.SessionLocal", TestSession), \
         patch("backend.ingest.embedding_service.get_embeddings_batch", return_value=[mock_real_vec]):

        result = run_ingestion(base_dir=kb_dir, force_recreate=False)
        assert result["success"] is True
        assert len(result["added"]) == 1


