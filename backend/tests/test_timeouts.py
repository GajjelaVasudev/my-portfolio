"""
Tests for timeout handling, stage timing, and grounded retrieval boundaries.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import settings
from backend.models import DocumentChunk
from backend.retriever import RetrievedChunk
from backend.llm import generate_grounded_answer, SERVICE_UNAVAILABLE_MESSAGE, FALLBACK_MESSAGE

client = TestClient(app)


def test_chat_endpoint_request_id_and_timing_headers():
    """Verify that /api/chat propagates X-Request-ID and measures X-Response-Time."""
    fake_chunk = RetrievedChunk(
        id=1,
        file_path="projects.md",
        file_name="projects.md",
        section_title="Overview",
        chunk_index=0,
        content="Vasudev engineered NxtGen LMS.",
        similarity_score=0.85
    )

    with patch("backend.main.retrieve_relevant_chunks", return_value=[fake_chunk]):
        with patch("backend.main.generate_grounded_answer") as mock_gen:
            mock_gen.return_value = {
                "answer": "Vasudev built NxtGen LMS.",
                "sources": [{"file_name": "projects.md", "section_title": "Overview"}],
                "is_fallback": False,
                "provider_used": "gemini"
            }
            resp = client.post(
                "/api/chat",
                json={"query": "Tell me about NxtGen LMS"},
                headers={"X-Request-ID": "test_req_42"}
            )
            assert resp.status_code == 200
            assert resp.headers.get("X-Request-ID") == "test_req_42"
            assert "X-Response-Time" in resp.headers
            data = resp.json()
            assert data["request_id"] == "test_req_42"
            assert data["answer"] == "Vasudev built NxtGen LMS."
            assert data["provider"] == "gemini"


def test_simulated_gemini_timeout_recovers_or_returns_graceful_message():
    """Verify that a timeout during LLM call does not crash the server and returns a clean message."""
    fake_chunk = RetrievedChunk(
        id=1,
        file_path="projects.md",
        file_name="projects.md",
        section_title="Overview",
        chunk_index=0,
        content="Vasudev engineered NxtGen LMS.",
        similarity_score=0.85
    )

    # When all providers time out or fail
    with patch("backend.llm._call_gemini_provider", side_effect=TimeoutError("Gemini read timed out")):
        with patch("backend.llm._call_openai_provider", return_value=None):
            with patch("backend.llm._call_groq_provider", return_value=None):
                result = generate_grounded_answer(
                    query="Tell me about NxtGen LMS",
                    retrieved_chunks=[fake_chunk]
                )
                assert result["is_fallback"] is True
                assert result["provider_used"] == "none"
                assert result["answer"] == SERVICE_UNAVAILABLE_MESSAGE


def test_empty_retrieval_does_not_hallucinate_ungrounded_answer():
    """Ensure that queries retrieving zero evidence return the strict grounding fallback."""
    result = generate_grounded_answer(
        query="What is the capital of France?",
        retrieved_chunks=[]
    )
    assert result["is_fallback"] is True
    assert result["provider_used"] == "none"
    assert "don't have enough verified information" in result["answer"].lower()
    assert result["sources"] == []


def test_unconfigured_providers_do_not_attempt_network_calls():
    """Ensure unconfigured providers are skipped immediately without network attempts."""
    with patch.object(settings, "gemini_api_key", None):
        with patch.object(settings, "google_api_key", None):
            with patch.object(settings, "openai_api_key", None):
                with patch.object(settings, "groq_api_key", None):
                    from backend.llm import _call_gemini_provider, _call_openai_provider, _call_groq_provider
                    assert _call_gemini_provider("test") is None
                    assert _call_openai_provider("test") is None
                    assert _call_groq_provider("test") is None
