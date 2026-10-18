# Portfolio RAG Assistant Backend

This directory houses the Python + FastAPI Retrieval-Augmented Generation (RAG) backend for Gajjela Vasudev's portfolio. It loads, chunks, embeds, and indexes markdown/PDF documents from `knowledge-base/` into PostgreSQL with `pgvector`, and provides a rate-limited chat API for visitors.

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
 embeddings.py               # 4. OpenAI text-embedding-3-small (1536 dim)
       │
       ▼
   ingest.py                 # 5. Incremental Indexing Engine (Diff Tracking)
       │
       ▼
PostgreSQL + pgvector        # 6. Tables: file_index & document_chunks (HNSW index)
       │
       ▼
  retriever.py               # 7. Cosine Distance Vector Search
       │
       ▼
     llm.py                  # 8. Grounded Generation (Strict Anti-Hallucination)
       │
       ▼
    main.py                  # 9. FastAPI Endpoints (/api/chat & /api/health)
```

---

## ⚙️ Prerequisites & Setup

### 1. PostgreSQL & pgvector
1. Ensure PostgreSQL is installed and running on your system.
2. Install the `pgvector` extension if not already present:
   - On Windows (with PostgreSQL 15): download the pgvector release or run `CREATE EXTENSION vector;` in your PostgreSQL instance.
   - Or run via Docker with pgvector pre-installed:
     ```bash
     docker run -d --name portfolio-pgvector -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=portfolio_rag -p 5432:5432 pgvector/pgvector:pg15
     ```
3. Create the database:
   ```sql
   CREATE DATABASE portfolio_rag;
   ```

### 2. Configure Environment Variables
Copy `backend/.env.example` to `backend/.env` and update with your credentials:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```ini
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/portfolio_rag
OPENAI_API_KEY=sk-your-openai-api-key-here
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
```

---

## 🚀 Running the Services

### 1. Run Incremental Ingestion
To index or update the knowledge base:
```bash
python ingest.py
```
*(or `python -m backend.ingest`)*

The command will:
- Walk `knowledge-base/` recursively.
- Compare SHA-256 hashes against `file_index`.
- Index newly added files.
- Re-index only modified files.
- Purge stale chunks for deleted files.
- Skip unchanged files.
- Print a clear console summary report.

### 2. Start the FastAPI Chat API Server
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
- API will be accessible at: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

---

## 🧪 Running Automated Tests

Run the test suite with `pytest`:
```bash
python -m pytest backend/tests -v
```

All 11 tests cover:
- Markdown and text extraction with section preservation
- Header-aware chunking and metadata preservation
- File SHA-256 hashing
- Incremental change-detection logic (add, update, skip, remove)
- API request models and validation
- Grounded answer fallback handling

---

## 🔄 How to Add a New Knowledge File & Make the Assistant Learn

1. Create a new markdown file in `knowledge-base/` (e.g. `knowledge-base/projects/new-project.md`).
2. Add your content using clear markdown headers (`# Title`, `## Overview`, `## Tech Stack`).
3. Run the ingest command:
   ```bash
   python ingest.py
   ```
4. Output will confirm:
   ```text
   [+] Added: projects/new-project.md (3 chunks)
   ```
5. Open your portfolio in the browser, click the bottom-right assistant button, and ask about the new project. The assistant retrieves and cites it immediately!
