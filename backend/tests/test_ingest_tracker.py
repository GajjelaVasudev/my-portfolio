"""
Tests for incremental ingestion change-detection logic.
"""

from dataclasses import dataclass
from typing import Dict, List, Set


@dataclass
class MockFile:
    path: str
    content_hash: str


def compute_diff(
    current_files: Dict[str, str],   # path -> hash
    indexed_files: Dict[str, str]    # path -> hash
) -> dict:
    """Pure logic function for incremental diff calculation."""
    added = []
    updated = []
    skipped = []
    removed = []

    for path, chash in current_files.items():
        if path not in indexed_files:
            added.append(path)
        elif indexed_files[path] != chash:
            updated.append(path)
        else:
            skipped.append(path)

    for path in indexed_files:
        if path not in current_files:
            removed.append(path)

    return {
        "added": sorted(added),
        "updated": sorted(updated),
        "skipped": sorted(skipped),
        "removed": sorted(removed),
    }


def test_incremental_diff_detection():
    # Initial state
    current = {
        "about.md": "hash_a",
        "skills.md": "hash_b",
        "experience.md": "hash_c",
    }
    indexed = {
        "about.md": "hash_a",        # unchanged
        "skills.md": "hash_b_OLD",    # modified
        "old_project.md": "hash_d",   # deleted
    }

    # "experience.md" is newly added
    diff = compute_diff(current, indexed)

    assert diff["added"] == ["experience.md"]
    assert diff["updated"] == ["skills.md"]
    assert diff["skipped"] == ["about.md"]
    assert diff["removed"] == ["old_project.md"]


def test_incremental_diff_idempotent():
    # If no files have changed, all should be skipped
    current = {
        "about.md": "hash_a",
        "skills.md": "hash_b",
    }
    indexed = {
        "about.md": "hash_a",
        "skills.md": "hash_b",
    }

    diff = compute_diff(current, indexed)
    assert len(diff["added"]) == 0
    assert len(diff["updated"]) == 0
    assert len(diff["removed"]) == 0
    assert diff["skipped"] == ["about.md", "skills.md"]
