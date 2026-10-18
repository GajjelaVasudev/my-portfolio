"""
Tests for Google Gemini embedding and generation services.
Verifies gemini-embedding-001 (768 dimensions), error handling,
mock mode isolation, and production failure safeguards.
"""

import math
import pytest
from unittest.mock import MagicMock, patch
from backend.config import settings
from backend.embeddings import (
    EmbeddingService,
    GeminiEmbeddingError,
    embedding_service,
    _generate_mock_embedding,
    is_mock_vector
)
from backend.llm import generate_grounded_answer, FALLBACK_MESSAGE, _deduplicate_sources
from backend.retriever import RetrievedChunk


def test_gemini_embedding_configuration():
    # gemini-embedding-001 must be configured with 768 dimensions
    assert settings.embedding_dimension == 768
    assert settings.gemini_embedding_model == "gemini-embedding-001"


def test_explicit_mock_mode_embedding_generation():
    # In mock mode, produces deterministic normalized 768-dim vectors offline
    mock_svc = EmbeddingService(mock_mode=True)
    vec = mock_svc.get_embedding("Distributed microservice architectures")
    assert len(vec) == 768
    assert isinstance(vec, list)
    assert isinstance(vec[0], float)

    # Unit norm check
    norm = math.sqrt(sum(x * x for x in vec))
    assert abs(norm - 1.0) < 1e-4

    # Batch test
    texts = [
        "Java Spring Boot microservices",
        "React TypeScript responsive frontend design"
    ]
    vectors = mock_svc.get_embeddings_batch(texts)
    assert len(vectors) == 2
    assert len(vectors[0]) == 768
    assert len(vectors[1]) == 768


def test_is_mock_vector_detection():
    # Mock vector has > 50% exact zeros
    mock_vec = _generate_mock_embedding("Test text for mock vector", dimension=768)
    assert is_mock_vector(mock_vec) is True

    # Real dense vector has virtually no exact zeros
    real_vec = [0.01 * (i % 10 - 5) + 0.001 for i in range(768)]
    assert is_mock_vector(real_vec) is False


def test_production_mode_raises_on_missing_api_key(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", None)
    monkeypatch.setattr(settings, "embedding_mock_mode", False)

    svc = EmbeddingService(mock_mode=False)
    with pytest.raises(GeminiEmbeddingError) as exc_info:
        svc.get_embeddings_batch(["Some text"])

    assert "GEMINI_API_KEY is not configured" in str(exc_info.value)


def test_production_mode_raises_on_api_failure(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "valid_looking_key_123")
    monkeypatch.setattr(settings, "embedding_mock_mode", False)

    mock_client = MagicMock()
    mock_client.models.embed_content.side_effect = Exception("404 Model gemini-embedding-001 not found or disabled")

    import google.genai
    monkeypatch.setattr(google.genai, "Client", lambda **kwargs: mock_client)

    svc = EmbeddingService(mock_mode=False)
    with pytest.raises(GeminiEmbeddingError) as exc_info:
        svc.get_embeddings_batch(["Sample document chunk"])

    # Must raise GeminiEmbeddingError, never fall back to mock
    assert "Gemini embedding API failure" in str(exc_info.value)
    mock_client.models.embed_content.assert_called_once()


def test_production_mode_uses_real_api_mock(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test_key_abc")
    monkeypatch.setattr(settings, "embedding_mock_mode", False)

    mock_emb = MagicMock()
    mock_emb.values = [0.05] * 768

    mock_response = MagicMock()
    mock_response.embeddings = [mock_emb]

    mock_client = MagicMock()
    mock_client.models.embed_content.return_value = mock_response

    import google.genai
    monkeypatch.setattr(google.genai, "Client", lambda **kwargs: mock_client)

    svc = EmbeddingService(mock_mode=False)
    results = svc.get_embeddings_batch(["Grounded portfolio context"])
    assert len(results) == 1
    assert len(results[0]) == 768
    assert results[0][0] == 0.05


def test_gemini_llm_grounded_generation_mock_mode(monkeypatch):
    # Ensure test runs in unconfigured local / mock mode regardless of .env key
    monkeypatch.setattr(settings, "gemini_api_key", None)

    sample_chunk = RetrievedChunk(
        id=1,
        file_path="skills.md",
        file_name="skills.md",
        section_title="Programming Languages",
        chunk_index=0,
        content="Java is Vasudev's primary language for backend systems.",
        similarity_score=0.85
    )

    result = generate_grounded_answer(
        query="What is Vasudev's primary programming language?",
        retrieved_chunks=[sample_chunk]
    )

    assert "answer" in result
    assert len(result["sources"]) == 1
    assert result["sources"][0]["file_name"] == "skills.md"
    assert result["sources"][0]["section_title"] == "Programming Languages"
    assert result["is_fallback"] is False


def test_gemini_llm_fallback_on_unsupported_query():
    result = generate_grounded_answer(
        query="What is Vasudev's favorite movie?",
        retrieved_chunks=[]
    )
    assert result["is_fallback"] is True
    assert FALLBACK_MESSAGE in result["answer"]
    assert result["sources"] == []


def test_deduplicate_sources():
    chunks = [
        RetrievedChunk(id=1, file_path="skills.md", file_name="skills.md", section_title="Languages", chunk_index=0, content="c1", similarity_score=0.9),
        RetrievedChunk(id=2, file_path="skills.md", file_name="skills.md", section_title="Languages", chunk_index=1, content="c2", similarity_score=0.8),
        RetrievedChunk(id=3, file_path="experience.md", file_name="experience.md", section_title="Internship", chunk_index=0, content="c3", similarity_score=0.7),
    ]
    sources = _deduplicate_sources(chunks)
    assert len(sources) == 2
    assert sources[0] == {"file_name": "skills.md", "section_title": "Languages"}
    assert sources[1] == {"file_name": "experience.md", "section_title": "Internship"}


def test_gemini_llm_generation_with_client_mock(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "mock_key_for_test")

    mock_response = MagicMock()
    mock_response.text = "Vasudev is experienced in Java, Spring Boot, and PostgreSQL."

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    import google.genai
    monkeypatch.setattr(google.genai, "Client", lambda **kwargs: mock_client)

    sample_chunk = RetrievedChunk(
        id=1,
        file_path="skills.md",
        file_name="skills.md",
        section_title="Backend",
        chunk_index=0,
        content="Java and Spring Boot microservices.",
        similarity_score=0.9
    )

    result = generate_grounded_answer(
        query="What backend skills does Vasudev have?",
        retrieved_chunks=[sample_chunk]
    )

    assert result["is_fallback"] is False
    assert "Java, Spring Boot" in result["answer"]
    assert len(result["sources"]) == 1
    mock_client.models.generate_content.assert_called_once()
