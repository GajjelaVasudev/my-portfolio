"""
FastAPI application for the Portfolio RAG Assistant.
Provides rate-limited, grounded retrieval-augmented generation endpoints.
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path so 'backend' package is resolvable regardless of execution directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import logging
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Request, status
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
from backend.llm import generate_grounded_answer
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
    init_db()
    yield
    logger.info("Shutting down RAG Assistant service.")


app = FastAPI(
    title="Gajjela Vasudev Portfolio RAG Assistant API",
    version="1.0.0",
    description="File-based Retrieval-Augmented Generation API for personal portfolio",
    lifespan=lifespan
)

# Attach rate limit error handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
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


class HealthResponse(BaseModel):
    status: str
    environment: str
    database: str
    indexed_files: int
    total_chunks: int


@app.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint reporting system status and knowledge base size."""
    db_status = "connected"
    file_count = 0
    chunk_count = 0

    try:
        file_count = db.query(FileIndex).count()
        chunk_count = db.query(DocumentChunk).count()
    except Exception as exc:
        db_status = f"unhealthy: {exc}"
        logger.warning(f"Health check database query warning: {exc}")

    return HealthResponse(
        status="healthy",
        environment=settings.environment,
        database=db_status,
        indexed_files=file_count,
        total_chunks=chunk_count
    )


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
def chat_endpoint(
    request: Request,
    payload: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Public conversational endpoint for portfolio visitors.
    Retrieves evidence from PostgreSQL + pgvector and returns a grounded answer.
    """
    clean_query = payload.query.strip()
    if not clean_query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inquiry query cannot be empty."
        )

    logger.info(f"Received chat inquiry: '{clean_query[:60]}...' from {get_remote_address(request)}")

    try:
        # 1. Retrieve relevant passages
        retrieved_chunks = retrieve_relevant_chunks(
            db=db,
            query=clean_query,
            top_k=settings.top_k_chunks,
            threshold=settings.similarity_threshold
        )

        # 2. Convert history to dictionary format
        history_dicts = [
            {"role": turn.role, "content": turn.content}
            for turn in (payload.history or [])
        ]

        # 3. Generate grounded answer
        result = generate_grounded_answer(
            query=clean_query,
            retrieved_chunks=retrieved_chunks,
            history=history_dicts
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
            is_fallback=result.get("is_fallback", False)
        )
    except GeminiEmbeddingError as exc:
        logger.warning(f"Embedding error: {exc}")
        return ChatResponse(
            answer=(
                "The assistant backend is running, but requires a Google Gemini API key to vectorize queries and search the knowledge base. "
                "Please configure `GEMINI_API_KEY` in `backend/.env` (or set `EMBEDDING_MOCK_MODE=true` for offline testing)."
            ),
            sources=[],
            is_fallback=True
        )
