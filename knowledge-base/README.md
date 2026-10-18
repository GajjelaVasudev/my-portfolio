# Knowledge Base Management Guide

This directory is the **single source of truth** for Vasudev's RAG Personal Assistant. The assistant retrieves relevant passages from these files to answer visitor inquiries. It never invents or hardcodes facts.

---

## 📁 Directory Structure

```text
knowledge-base/
├── README.md               # This guide and document templates
├── about.md                # Bio, philosophy, background, and interests
├── skills.md               # Languages, frameworks, tools, and CS fundamentals
├── experience.md           # Professional roles and internships
├── hackathons.md           # Hackathons, competitions, and collaborative sprints
├── certifications.md       # Verified certificates, IDs, and issuing orgs
├── achievements.md         # Honors, milestones, and competitive profiles
├── resume.pdf              # (Optional) Candidate PDF resume
└── projects/               # Individual deep-dive project files
    ├── online-job-recruitment.md
    ├── scalable-ecommerce.md
    └── maternal-healthcare.md
```

---

## ⚡ How It Works

1. **You edit or add files directly in this directory.**
2. **You run the incremental indexing command**:
   ```bash
   python ingest.py
   ```
   *(or `python -m backend.ingest` from the project root)*
3. **The ingest script**:
   - Calculates the SHA-256 hash of each file.
   - Detects newly created, modified, or removed files.
   - Updates the vector database with new embeddings.
   - Skips unchanged files to save time and API costs.
   - Purges stale chunks when a file is deleted.
4. **The assistant instantly answers questions using the latest indexed knowledge.**

> [!IMPORTANT]
> Editing or adding a file will **not** be visible to the assistant until you run `python ingest.py`.

---

## 📝 Document Guidelines & Templates

Use standard Markdown (`.md`). You can also place plain text (`.txt`) and PDF files (`.pdf`) in this folder.

Use clean headings (`#`, `##`, `###`) because the document chunker uses headings to preserve contextual section titles for citations.

### 1. Template: New Project (`projects/your-project-name.md`)
```markdown
# Project Name (Short Tagline)

## Overview
- **Project Title**: Project Name
- **Role**: Backend Architect / Full-Stack Engineer
- **Year**: 2024
- **Status**: Completed / Active
- **Repository URL**: https://github.com/GajjelaVasudev/your-repo
- **Live Demo**: https://your-demo-url.com

## Problem Statement
A concise description of the engineering problem or business need.

## Architectural Solution
How you designed and structured the application to solve the problem.

## Key Technical Features
- **Feature 1**: Description highlighting technical depth and design patterns.
- **Feature 2**: Description of performance, caching, or concurrency handling.
- **Feature 3**: Security, data validation, or testing pipelines.

## Tech Stack
- **Languages**: Java, TypeScript
- **Frameworks**: Spring Boot, React
- **Databases**: PostgreSQL, Redis
- **DevOps**: Docker, GitHub Actions
```

### 2. Template: New Role or Internship (`experience.md`)
```markdown
## Role Title — Organization Name
- **Organization**: Company / Lab Name
- **Role**: Software Engineering Intern
- **Period**: Month 2024 — Month 2025
- **Location**: Remote / Hybrid / City
- **Key Responsibilities & Contributions**:
  - Engineered modular microservices using ...
  - Improved database query execution by ...
  - Automated deployment pipelines using Docker and ...
- **Technologies Used**: Technology 1, Technology 2, Technology 3.
```

### 3. Template: New Certification (`certifications.md`)
```markdown
## Certification Title
- **Credential Name**: Full Official Name
- **Issuing Organization**: Oracle / AWS / Meta / Coursera
- **Issue Date**: Month 2024
- **Expiry Date**: (If applicable)
- **Credential ID**: ABC-123456
- **Verification URL**: https://verification-link.com
- **Core Competencies Covered**: Summary of skills tested and mastered.
```

---

## 🗑️ How to Remove Information

1. Simply delete the file (e.g., `rm knowledge-base/projects/old-project.md`) or edit out the specific section.
2. Run `python ingest.py`.
3. The ingestion tool automatically detects deleted files or updated content, removes stale embeddings from the PostgreSQL vector store, and confirms the deletion.
