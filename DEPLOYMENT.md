# Production Deployment Guide: RAG Personal Assistant

This guide provides step-by-step instructions for deploying your file-based RAG personal assistant to production using the approved stack:

- **AI Provider**: Google Gemini (`google-genai` SDK)
- **Database**: Supabase (PostgreSQL with `pgvector`)
- **Backend**: Render (FastAPI Web Service)
- **Frontend**: Netlify (Vite + React)

---

## 📋 Architecture & Environment Variable Summary

| Service | Component | Key Environment Variables |
| :--- | :--- | :--- |
| **Google AI Studio** | Gemini Models | `GEMINI_API_KEY`, `GEMINI_GENERATION_MODEL=gemini-1.5-flash`, `GEMINI_EMBEDDING_MODEL=gemini-embedding-001` |
| **Supabase** | PostgreSQL + pgvector | `DATABASE_URL=postgresql+psycopg://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| **Render** | FastAPI Backend | `PORT` (auto-set), `DATABASE_URL`, `GEMINI_API_KEY`, `CORS_ORIGINS=https://[your-site].netlify.app` |
| **Netlify** | React Frontend | `VITE_API_URL=https://[your-render-backend].onrender.com` |

---

## Step 1: Google Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Create or sign in to your Google Cloud project and click **Get API key**.
3. Copy your API key.
4. **Security Check**: This key must **only** be configured on Render or in `backend/.env`. It is never exposed to the frontend or version control.

---

## Step 2: Supabase (PostgreSQL + pgvector) Setup

1. Sign in to [Supabase](https://supabase.com/) and create a new project (e.g. `portfolio-rag-db`).
2. **Enable pgvector**:
   - In your Supabase dashboard, navigate to **Database** → **Extensions**.
   - Search for `vector` and toggle it **ON**.
   - Alternatively, open the **SQL Editor** and run:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```
3. **Obtain Connection String**:
   - Go to **Project Settings** → **Database** → **Connection string**.
   - Select the **URI** tab and choose **Transaction Pooler** (recommended for serverless/Render, port `6543`) or **Direct Connection** (port `5432`).
   - Format with psycopg v3:
     ```text
     postgresql+psycopg://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[YOUR-REGION].pooler.supabase.com:6543/postgres
     ```
   *(Replace `[YOUR-PROJECT-REF]` and `[YOUR-PASSWORD]` with your actual credentials).*

---

## Step 3: Run Full Re-Indexing with Gemini Embeddings

Because Google Gemini's `gemini-embedding-001` configured with `output_dimensionality=768` uses **768 dimensions** (unlike legacy 1536-dimensional models), vectors must not be mixed in the same table.

1. In your local `backend/.env`, set your real `DATABASE_URL` (Supabase) and `GEMINI_API_KEY`:
   ```ini
   DATABASE_URL=postgresql+psycopg://postgres.yourref:yourpass@aws-0-region.pooler.supabase.com:6543/postgres
   GEMINI_API_KEY=your_actual_gemini_api_key
   GEMINI_GENERATION_MODEL=gemini-1.5-flash
   GEMINI_EMBEDDING_MODEL=gemini-embedding-001
   EMBEDDING_DIMENSION=768
   ```
2. Execute the **full re-indexing command**:
   ```powershell
   python ingest.py --reindex-all
   ```
3. The ingestion tool will:
   - Verify Supabase connectivity and the `vector` extension.
   - Create or migrate the `document_chunks` table with `vector(768)` and an HNSW cosine similarity index.
   - Embed all documents in `knowledge-base/` with `gemini-embedding-001` (768 dimensions).
   - Record SHA-256 hashes in `file_index`.
4. Subsequent updates only require running standard `python ingest.py` to index new or modified files incrementally.

---

## Step 4: Render (FastAPI Backend Deployment)

1. Sign in to [Render](https://render.com/) and click **New** → **Web Service**.
2. Connect your GitHub repository: `GajjelaVasudev/my-portfolio`.
3. Configure the service settings:
   - **Name**: `portfolio-rag-backend`
   - **Language**: `Python 3`
   - **Branch**: `main` (or your active deployment branch)
   - **Root Directory**: leave blank (repository root)
   - **Build Command**:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Health Check Path**: `/api/health`
4. In the **Environment Variables** section on Render, add:
   - `PYTHON_VERSION`: `3.13.5`
   - `ENVIRONMENT`: `production`
   - `DATABASE_URL`: *(Your Supabase connection string from Step 2)*
   - `GEMINI_API_KEY` (or `GOOGLE_API_KEY`): *(Your Google AI Studio API key - Primary Provider)*
   - `GEMINI_GENERATION_MODEL`: `gemini-flash-latest`
   - `GEMINI_EMBEDDING_MODEL`: `gemini-embedding-001`
   - `EMBEDDING_DIMENSION`: `768`
   - `OPENAI_API_KEY`: *(Optional: OpenAI API key for Fallback 1)*
   - `OPENAI_MODEL`: `gpt-4o-mini`
   - `GROQ_API_KEY`: *(Optional: Groq API key for Fallback 2)*
   - `GROQ_MODEL`: `llama-3.3-70b-versatile`
   - `CORS_ORIGINS`: `https://your-portfolio.netlify.app,http://localhost:5173` *(Update with your Netlify URL once deployed)*
5. Click **Create Web Service**.
6. Once deployed, note down your Render backend URL (e.g. `https://portfolio-rag-backend-vkq8.onrender.com`). Verify by visiting `https://portfolio-rag-backend-vkq8.onrender.com/health`.

---

## Step 5: Netlify (Frontend Deployment)

1. Sign in to [Netlify](https://www.netlify.com/) and click **Add new site** → **Import an existing project**.
2. Select your GitHub repository: `GajjelaVasudev/my-portfolio`.
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add the build-time environment variable:
   - In Netlify dashboard: **Site configuration** → **Environment variables**.
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://portfolio-rag-backend-vkq8.onrender.com` *(Your Render backend URL)*
5. Deploy the site.
6. Copy your production Netlify URL (e.g. `https://your-portfolio.netlify.app`).

---

## Step 6: Final Security & CORS Lockdown

1. Go back to your Render dashboard for `portfolio-rag-backend`.
2. Update the `CORS_ORIGINS` environment variable to strictly allow your live Netlify domain and local development:
   ```text
   https://your-portfolio.netlify.app,http://localhost:5173
   ```
3. Render will redeploy with the updated CORS policy.
4. Test the floating assistant on your live Netlify site. Ask:
   - *"What microservices projects has Vasudev built?"*
   - Verify that citations point to `projects/online-job-recruitment.md` and answers are grounded.

---

## 🛠️ Local Verification Commands

Before deploying, you can run all automated tests locally:

```powershell
# 1. Run all backend tests (loader, chunker, Gemini embeddings, generation, API)
python -m pytest backend/tests -v

# 2. Run frontend linter
npm run lint

# 3. Run TypeScript & Vite production build
npm run build
```
