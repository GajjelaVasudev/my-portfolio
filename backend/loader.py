"""
Extensible document loader for the RAG knowledge base.
Supports Markdown (.md), Plain Text (.txt), and PDF (.pdf).
"""

import hashlib
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Dict, List, Optional

logger = logging.getLogger("rag_assistant.loader")


@dataclass
class LoadedDocument:
    file_path: str       # Relative path from knowledge-base root, e.g. "skills.md"
    file_name: str       # Basename, e.g. "skills.md"
    file_type: str       # Extension, e.g. ".md"
    content: str         # Full extracted text content
    file_hash: str       # SHA-256 hexadecimal digest
    last_modified: datetime


def calculate_file_hash(path: Path) -> str:
    """Calculates SHA-256 hash of a file's binary content."""
    sha = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def _load_text_file(path: Path) -> str:
    """Loads plain text or markdown file with utf-8 encoding and fallback."""
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1", errors="replace")


def _load_pdf_file(path: Path) -> str:
    """Extracts text content from a PDF document using pypdf."""
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        pages_text: List[str] = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                pages_text.append(f"--- Page {i + 1} ---\n{page_text.strip()}")
        return "\n\n".join(pages_text)
    except Exception as exc:
        logger.error(f"Error reading PDF file {path}: {exc}")
        return ""


class DocumentLoaderRegistry:
    """Registry allowing custom format handlers to be registered dynamically."""

    def __init__(self) -> None:
        self._loaders: Dict[str, Callable[[Path], str]] = {}
        # Register default handlers
        self.register([".md", ".markdown"], _load_text_file)
        self.register([".txt"], _load_text_file)
        self.register([".pdf"], _load_pdf_file)

    def register(self, extensions: List[str], loader_fn: Callable[[Path], str]) -> None:
        for ext in extensions:
            self._loaders[ext.lower()] = loader_fn

    def get_supported_extensions(self) -> List[str]:
        return list(self._loaders.keys())

    def load_file(self, full_path: Path, base_dir: Path) -> Optional[LoadedDocument]:
        ext = full_path.suffix.lower()
        if ext not in self._loaders:
            return None

        try:
            content = self._loaders[ext](full_path)
            if not content or not content.strip():
                logger.warning(f"File {full_path.name} is empty or extracted no text.")
                return None

            stat = full_path.stat()
            file_hash = calculate_file_hash(full_path)
            relative_path = str(full_path.relative_to(base_dir)).replace("\\", "/")

            return LoadedDocument(
                file_path=relative_path,
                file_name=full_path.name,
                file_type=ext,
                content=content.strip(),
                file_hash=file_hash,
                last_modified=datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc)
            )
        except Exception as exc:
            logger.error(f"Failed to load file {full_path}: {exc}")
            return None


# Global loader registry instance
loader_registry = DocumentLoaderRegistry()


def scan_knowledge_base(base_dir: Path) -> List[LoadedDocument]:
    """
    Recursively scans the knowledge-base directory and loads all supported documents.
    """
    if not base_dir.exists() or not base_dir.is_dir():
        logger.warning(f"Knowledge base directory does not exist: {base_dir}")
        return []

    documents: List[LoadedDocument] = []
    supported_exts = set(loader_registry.get_supported_extensions())

    for path in sorted(base_dir.rglob("*")):
        if path.is_file() and path.suffix.lower() in supported_exts:
            # Skip hidden files or temporary files
            if path.name.startswith(".") or path.name.startswith("~"):
                continue
            doc = loader_registry.load_file(path, base_dir)
            if doc:
                documents.append(doc)

    return documents
