"""
Context-preserving text chunker for the RAG pipeline.
Extracts sections from markdown headings and partitions long sections
into overlapping chunks while preserving document and section metadata.
"""

import hashlib
import re
from dataclasses import dataclass
from typing import List
from backend.loader import LoadedDocument


@dataclass
class TextChunk:
    file_path: str
    file_name: str
    section_title: str
    chunk_index: int
    content: str
    content_hash: str


# Regex matching Markdown ATX headings (# Title, ## Subtitle, etc.)
HEADING_REGEX = re.compile(r"^(#{1,4})\s+(.+)$", re.MULTILINE)


def _split_markdown_into_sections(text: str) -> List[tuple[str, str]]:
    """
    Splits markdown text into (section_title, section_body) tuples.
    If no headings are found, returns the entire text under an empty title.
    """
    matches = list(HEADING_REGEX.finditer(text))
    if not matches:
        return [("", text.strip())]

    sections: List[tuple[str, str]] = []
    
    # Text before the first heading (preamble)
    if matches[0].start() > 0:
        preamble = text[:matches[0].start()].strip()
        if preamble:
            sections.append(("Introduction", preamble))

    for i, match in enumerate(matches):
        section_title = match.group(2).strip()
        start_pos = match.end()
        end_pos = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section_body = text[start_pos:end_pos].strip()
        
        if section_body:
            sections.append((section_title, section_body))

    return sections


def chunk_document(
    doc: LoadedDocument,
    max_chunk_chars: int = 1400,
    chunk_overlap_chars: int = 200
) -> List[TextChunk]:
    """
    Chunks a LoadedDocument into manageable TextChunks, preserving section titles
    and ensuring contextual headers for optimal vector retrieval.
    """
    sections = _split_markdown_into_sections(doc.content)
    chunks: List[TextChunk] = []
    chunk_index = 0

    for section_title, section_body in sections:
        # If the section easily fits in one chunk
        if len(section_body) <= max_chunk_chars:
            content_with_context = (
                f"[Source: {doc.file_name}"
                + (f" // {section_title}" if section_title else "")
                + f"]\n\n{section_body}"
            )
            content_hash = hashlib.sha256(content_with_context.encode("utf-8")).hexdigest()
            chunks.append(TextChunk(
                file_path=doc.file_path,
                file_name=doc.file_name,
                section_title=section_title or "General",
                chunk_index=chunk_index,
                content=content_with_context,
                content_hash=content_hash
            ))
            chunk_index += 1
        else:
            # Split longer section into overlapping sub-chunks by paragraphs or sentences
            paragraphs = [p.strip() for p in section_body.split("\n\n") if p.strip()]
            current_buffer: List[str] = []
            current_length = 0

            for paragraph in paragraphs:
                if current_length + len(paragraph) > max_chunk_chars and current_buffer:
                    sub_body = "\n\n".join(current_buffer)
                    content_with_context = (
                        f"[Source: {doc.file_name}"
                        + (f" // {section_title}" if section_title else "")
                        + f"]\n\n{sub_body}"
                    )
                    content_hash = hashlib.sha256(content_with_context.encode("utf-8")).hexdigest()
                    chunks.append(TextChunk(
                        file_path=doc.file_path,
                        file_name=doc.file_name,
                        section_title=section_title or "General",
                        chunk_index=chunk_index,
                        content=content_with_context,
                        content_hash=content_hash
                    ))
                    chunk_index += 1

                    # Retain last paragraph for overlap if applicable
                    overlap_para = current_buffer[-1] if len(current_buffer[-1]) <= chunk_overlap_chars else ""
                    current_buffer = [overlap_para] if overlap_para else []
                    current_length = len(overlap_para)

                current_buffer.append(paragraph)
                current_length += len(paragraph) + 2

            # Flush remaining buffer
            if current_buffer:
                sub_body = "\n\n".join(current_buffer)
                content_with_context = (
                    f"[Source: {doc.file_name}"
                    + (f" // {section_title}" if section_title else "")
                    + f"]\n\n{sub_body}"
                )
                content_hash = hashlib.sha256(content_with_context.encode("utf-8")).hexdigest()
                chunks.append(TextChunk(
                    file_path=doc.file_path,
                    file_name=doc.file_name,
                    section_title=section_title or "General",
                    chunk_index=chunk_index,
                    content=content_with_context,
                    content_hash=content_hash
                ))
                chunk_index += 1

    return chunks
