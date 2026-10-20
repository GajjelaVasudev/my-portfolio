"""
FastAPI application for the Portfolio RAG Assistant.
Provides rate-limited, grounded retrieval-augmented generation endpoints
with multi-provider AI fallback (Gemini -> OpenAI -> Groq).
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path so 'backend' package is resolvable regardless of execution directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import logging
import time
import uuid
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.config import settings
from backend.database import get_db, init_db
from backend.models import FileIndex, DocumentChunk
from backend.retriever import retrieve_relevant_chunks
from backend.llm import generate_grounded_answer, _is_valid_key
from backend.embeddings import GeminiEmbeddingError

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rag_assistant.api")

# Rate Limiter setup (key by client IP)
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing RAG Assistant service and database schema...")
    try:
        init_db()
    except Exception as exc:
        logger.warning(f"Database initialization warning during startup: {exc}")
    yield
    logger.info("Shutting down RAG Assistant service.")


app = FastAPI(
    title="Gajjela Vasudev Portfolio RAG Assistant API",
    version="1.1.0",
    description="File-based Retrieval-Augmented Generation API with multi-provider fallback",
    lifespan=lifespan
)

# Attach rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware configuration: strictly configured origins plus Netlify app domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https://([a-zA-Z0-9_-]+\.)?netlify\.app$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Response-Time"],
    max_age=86400,
)


# Request and Response Pydantic Models
class ChatTurn(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., max_length=1500, description="Turn content")


class ChatRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Visitor's inquiry about Vasudev"
    )
    history: Optional[List[ChatTurn]] = Field(
        default=None,
        description="Session conversation history"
    )


class SourceReference(BaseModel):
    file_name: str
    section_title: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceReference]
    is_fallback: bool
    provider: Optional[str] = None
    request_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    environment: str
    service: str = "portfolio-rag-backend"
    version: str = "1.1.0"


class DependencyHealthResponse(BaseModel):
    status: str
    environment: str
    database: str
    indexed_files: int
    total_chunks: int
    configured_providers: List[str]


# --------------------------------------------------------------------------
# Lightweight Health Check Endpoints (/health and /api/health)
# --------------------------------------------------------------------------
@app.get("/health", response_model=HealthResponse)
@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Lightweight availability endpoint for load balancers and deployment probes."""
    return HealthResponse(
        status="healthy",
        environment=settings.environment
    )


# --------------------------------------------------------------------------
# Detailed Dependency Status Endpoint (/health/deps and /api/health/deps)
# --------------------------------------------------------------------------
@app.get("/health/deps", response_model=DependencyHealthResponse)
@app.get("/api/health/deps", response_model=DependencyHealthResponse)
def dependency_health_check(db: Session = Depends(get_db)):
    """Reports database connection status and configured AI provider readiness without exposing secrets."""
    db_status = "connected"
    file_count = 0
    chunk_count = 0

    try:
        file_count = db.query(FileIndex).count()
        chunk_count = db.query(DocumentChunk).count()
    except Exception as exc:
        db_status = f"unhealthy: {type(exc).__name__}"
        logger.warning(f"Dependency health database query warning: {exc}")

    # Inspect configured providers without printing keys
    configured: List[str] = []
    if _is_valid_key(settings.effective_gemini_api_key):
        configured.append("gemini (primary)")
    if _is_valid_key(settings.openai_api_key):
        configured.append("openai (fallback 1)")
    if _is_valid_key(settings.groq_api_key):
        configured.append("groq (fallback 2)")

    overall_status = "healthy" if db_status == "connected" and configured else "degraded"

    return DependencyHealthResponse(
        status=overall_status,
        environment=settings.environment,
        database=db_status,
        indexed_files=file_count,
        total_chunks=chunk_count,
        configured_providers=configured
    )


# --------------------------------------------------------------------------
# Main Chat Endpoint (/api/chat)
# --------------------------------------------------------------------------
@app.options("/api/chat", include_in_schema=False)
def chat_options():
    """Explicit OPTIONS handler for non-preflight or load-balancer probes."""
    return Response(status_code=status.HTTP_200_OK)


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
def chat_endpoint(
    request: Request,
    response: Response,
    payload: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Public conversational endpoint for portfolio visitors.
    Retrieves evidence from PostgreSQL + pgvector and returns a grounded answer
    using multi-provider fallback.
    """
    t_start = time.perf_counter()
    req_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:8]}"
    response.headers["X-Request-ID"] = req_id

    clean_query = payload.query.strip()
    if not clean_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inquiry query cannot be empty."
        )

    logger.info(f"[{req_id}] Received inquiry: '{clean_query[:60]}...' from {get_remote_address(request)}")

    try:
        # 1. Retrieve relevant passages from Supabase pgvector
        t_retrieval_start = time.perf_counter()
        retrieved_chunks = retrieve_relevant_chunks(
            db=db,
            query=clean_query,
            top_k=settings.top_k_chunks,
            threshold=settings.similarity_threshold
        )
        t_retrieval = time.perf_counter() - t_retrieval_start

        # 2. Convert history to dictionary format
        history_dicts = [
            {"role": turn.role, "content": turn.content}
            for turn in (payload.history or [])
        ]

        # 3. Generate grounded answer with multi-provider fallback
        t_llm_start = time.perf_counter()
        result = generate_grounded_answer(
            query=clean_query,
            retrieved_chunks=retrieved_chunks,
            history=history_dicts
        )
        t_llm = time.perf_counter() - t_llm_start
        t_total = time.perf_counter() - t_start

        response.headers["X-Response-Time"] = f"{t_total:.2f}s"
        logger.info(
            f"[{req_id}] Stage breakdown -> Total: {t_total:.2f}s | "
            f"Retrieval: {t_retrieval:.2f}s ({len(retrieved_chunks)} chunks) | "
            f"LLM: {t_llm:.2f}s (provider: {result.get('provider_used')})"
        )

        return ChatResponse(
            answer=result["answer"],
            sources=[
                SourceReference(
                    file_name=src["file_name"],
                    section_title=src["section_title"]
                )
                for src in result.get("sources", [])
            ],
            is_fallback=result.get("is_fallback", False),
            provider=result.get("provider_used"),
            request_id=req_id
        )

    except GeminiEmbeddingError as exc:
        t_total = time.perf_counter() - t_start
        response.headers["X-Response-Time"] = f"{t_total:.2f}s"
        logger.warning(f"[{req_id}] Embedding error after {t_total:.2f}s: {exc}")
        return ChatResponse(
            answer=(
                "Leo is temporarily unable to vectorize this inquiry. "
                "Please configure a valid Google Gemini API key or try again in a moment."
            ),
            sources=[],
            is_fallback=True,
            provider="none",
            request_id=req_id
        )
    except Exception as exc:
        t_total = time.perf_counter() - t_start
        response.headers["X-Response-Time"] = f"{t_total:.2f}s"
        logger.error(f"[{req_id}] Unexpected error after {t_total:.2f}s: {exc}", exc_info=True)
        return ChatResponse(
            answer=(
                "Leo is temporarily unavailable. Please try again in a moment, "
                "or reach out to Vasudev directly via vgajjella@gmail.com."
            ),
            sources=[],
            is_fallback=True,
            provider="none",
            request_id=req_id
        )
