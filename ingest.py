#!/usr/bin/env python
"""
Root entry point for RAG incremental ingestion.
Usage: python ingest.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.ingest import run_ingestion

if __name__ == "__main__":
    result = run_ingestion()
    sys.exit(0 if result.get("success") else 1)
