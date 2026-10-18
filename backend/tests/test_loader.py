"""
Tests for document loader and file hashing.
"""

import tempfile
from pathlib import Path
from datetime import datetime, timezone
from backend.loader import (
    calculate_file_hash,
    loader_registry,
    LoadedDocument,
    scan_knowledge_base
)


def test_calculate_file_hash():
    with tempfile.NamedTemporaryFile("w+", delete=False, suffix=".md", encoding="utf-8") as f:
        f.write("# Sample Header\n\nSample content for hash calculation.")
        temp_path = Path(f.name)

    try:
        h1 = calculate_file_hash(temp_path)
        assert len(h1) == 64
        assert isinstance(h1, str)

        # Hash must be identical on second run
        h2 = calculate_file_hash(temp_path)
        assert h1 == h2

        # Modifying content must change hash
        temp_path.write_text("# Modified Header\n\nDifferent content.", encoding="utf-8")
        h3 = calculate_file_hash(temp_path)
        assert h1 != h3
    finally:
        if temp_path.exists():
            temp_path.unlink()


def test_loader_registry_markdown():
    with tempfile.TemporaryDirectory() as temp_dir_str:
        temp_dir = Path(temp_dir_str)
        sample_file = temp_dir / "test_doc.md"
        sample_file.write_text("# Test Title\n\nContent here.", encoding="utf-8")

        doc = loader_registry.load_file(sample_file, temp_dir)
        assert doc is not None
        assert doc.file_name == "test_doc.md"
        assert doc.file_type == ".md"
        assert "# Test Title" in doc.content


def test_scan_knowledge_base_non_empty():
    from backend.config import settings
    docs = scan_knowledge_base(settings.knowledge_base_dir)
    assert len(docs) >= 5
    file_names = {d.file_name for d in docs}
    assert "about.md" in file_names
    assert "skills.md" in file_names
    assert "experience.md" in file_names
