#!/usr/bin/env python
"""
Root entry point for RAG incremental ingestion.
Usage:
  python ingest.py                # Incremental index (only new/changed files)
  python ingest.py --reindex-all  # Force full re-indexing of all documents
"""

import sys
import argparse
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.ingest import run_ingestion

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="RAG Knowledge Base Incremental Ingest")
    parser.add_argument(
        "--reindex-all", "--force",
        dest="reindex_all",
        action="store_true",
        help="Purge existing vector table and re-index all documents from scratch"
    )
    args = parser.parse_args()

    result = run_ingestion(force_recreate=args.reindex_all)
    sys.exit(0 if result.get("success") else 1)
