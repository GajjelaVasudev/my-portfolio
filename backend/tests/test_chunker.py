"""
Tests for text chunker and header extraction.
"""

from datetime import datetime, timezone
from backend.loader import LoadedDocument
from backend.chunker import chunk_document, _split_markdown_into_sections


def test_split_markdown_sections():
    sample_text = """# Main Title
This is introduction text.

## Section 1: Backend Systems
Java and Spring Boot microservices.

## Section 2: Databases
PostgreSQL and Redis caching.
"""
    sections = _split_markdown_into_sections(sample_text)
    assert len(sections) == 3
    assert sections[0][0] == "Main Title"
    assert "introduction text" in sections[0][1]
    assert sections[1][0] == "Section 1: Backend Systems"
    assert "Spring Boot" in sections[1][1]
    assert sections[2][0] == "Section 2: Databases"
    assert "Redis caching" in sections[2][1]


def test_chunk_document_metadata():
    doc = LoadedDocument(
        file_path="projects/online-job-recruitment.md",
        file_name="online-job-recruitment.md",
        file_type=".md",
        content="# Online Job Recruitment\n\n## Overview\nA distributed microservice recruitment system.\n\n## Tech Stack\nJava, Spring Boot, Docker.",
        file_hash="test_hash_123",
        last_modified=datetime.now(timezone.utc)
    )

    chunks = chunk_document(doc)
    assert len(chunks) >= 2
    assert chunks[0].file_name == "online-job-recruitment.md"
    assert chunks[0].file_path == "projects/online-job-recruitment.md"
    assert chunks[0].chunk_index == 0
    assert len(chunks[0].content_hash) == 64
    assert "[Source: online-job-recruitment.md" in chunks[0].content


def test_chunk_document_long_section_splits():
    # Long section exceeding 1400 characters
    long_para = "This is a detailed paragraph explaining high-concurrency systems. " * 30
    doc = LoadedDocument(
        file_path="long_doc.md",
        file_name="long_doc.md",
        file_type=".md",
        content=f"# Long Section Document\n\n## Deep Dive\n{long_para}\n\n{long_para}",
        file_hash="long_hash_456",
        last_modified=datetime.now(timezone.utc)
    )

    chunks = chunk_document(doc, max_chunk_chars=500, chunk_overlap_chars=50)
    assert len(chunks) > 1
    # Every chunk must preserve the section title
    for c in chunks:
        assert c.section_title == "Deep Dive"
        assert len(c.content) > 0
