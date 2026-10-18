# Portfolio RAG Assistant Backend (Google Gemini)

This directory houses the Python + FastAPI Retrieval-Augmented Generation (RAG) backend for Gajjela Vasudev's portfolio, powered by **Google Gemini** (`google-genai` SDK) and **PostgreSQL with pgvector** (Supabase or self-hosted).

---

## 🏗️ Architecture Overview

```text
knowledge-base/              # 1. Source of Truth (Markdown, TXT, PDF)
       │
       ▼
   loader.py                 # 2. Extensible Document Loader & SHA-256 Hashing
       │
       ▼
   chunker.py                # 3. Context-Preserving Markdown Header Chunker
       │
       ▼
 embeddings.py               # 4. Google Gemini gemini-embedding-001 (768 dim)
       │
       ▼
   ingest.py                 # 5. Incremental Indexing Engine (Diff Tracking & Migration)
       │
       ▼
PostgreSQL + pgvector        # 6. Tables: file_index & document_chunks (HNSW Vector Index)
       │
       ▼
  retriever.py               # 7. Cosine Distance Vector Search
       │
       ▼
     llm.py                  # 8. Google Gemini Grounded Generation (Strict Anti-Hallucination)
       │
       ▼
    main.py                  # 9. FastAPI Endpoints (/api/chat & /api/health with Rate Limiting)
```

---

## ⚙️ Prerequisites & Setup

### 1. Database (Supabase or Local PostgreSQL)
1. Ensure `pgvector` extension is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 2. Configure Environment Variables
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```ini
DATABASE_URL=postgresql+psycopg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_GENERATION_MODEL=gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=gemini-embedding-001
EMBEDDING_DIMENSION=768
CORS_ORIGINS=http://localhost:5173,https://your-portfolio.netlify.app
```

---

## 🚀 Running the Services

### 1. Indexing the Knowledge Base
To index or update the knowledge base incrementally:
```bash
python ingest.py
```

To force a full re-indexing (required when switching embedding models or migrating vector tables):
```bash
python ingest.py --reindex-all
```

The ingest command:
- Walks `knowledge-base/` recursively.
- Compares SHA-256 hashes against `file_index`.
- Indexes newly added files with `gemini-embedding-001` (768 dimensions).
- Re-indexes only modified files.
- Purges stale chunks for deleted files.
- Skips unchanged files.
- Prints a clear console summary report.

### 2. Start the FastAPI Chat API Server
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
- API is accessible at: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

---

## 🧪 Running Automated Tests

Run the test suite with `pytest`:
```bash
python -m pytest backend/tests -v
```

All 16 tests cover:
- Google Gemini embedding dimensions (768) and unit normalization
- Google Gemini grounded generation and fallback handling
- Markdown and text extraction with section preservation
- Header-aware chunking and metadata preservation
- File SHA-256 hashing
- Incremental change-detection logic (add, update, skip, remove)
- API request models and validation
