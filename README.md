# ANNI — Artificial Neural Annotation Intelligence

A **local-first, human-in-the-loop annotation platform** for transforming appropriately licensed public patient testimonies into structured, explainable behavioral profiles for synthetic patient simulations used in medical education.

---

## What it does

ANNI enforces a strict provenance chain from raw testimony to usable synthetic patient trait. Every step is recorded, every AI output requires a human decision, and nothing enters the knowledge base without an auditable approval.

```
testimony → human annotation → AI review → human decision → approved trait → synthetic patient prompt
```

The core rule: **AI can suggest. Humans decide.**

---

## Architecture

```
ANNI/
├── app/                  # Next.js 14 frontend (React, TypeScript, Tailwind)
│   └── page.tsx          # Main page — composes workspace components
├── components/           # One component per panel
│   ├── testimony-panel.tsx
│   ├── annotation-form.tsx
│   ├── ontology-browser.tsx
│   ├── suggestion-dashboard.tsx
│   └── citation-engine.tsx
├── lib/
│   ├── api.ts            # Typed fetch client for the FastAPI backend
│   ├── hooks.ts          # TanStack Query hooks (queries, mutations, optimistic updates)
│   ├── schemas.ts        # Zod validation schemas (mirrors backend Pydantic models)
│   ├── store.ts          # Zustand — ephemeral UI state only (hasRead, selectedOntologyId)
│   └── identity.ts       # UUID-based reviewer identity (localStorage)
└── backend/
    ├── app/
    │   ├── config.py     # pydantic-settings — all config in one place
    │   ├── main.py       # FastAPI routes + CORS + startup seed + Ollama check
    │   ├── models.py     # SQLAlchemy ORM models
    │   ├── schemas.py    # Pydantic request/response schemas
    │   ├── provenance.py # Chained SHA-256 audit log + citation report + prompt compiler
    │   ├── seed.py       # Idempotent demo data (ontology nodes, source, paragraphs)
    │   └── ollama.py     # BackgroundTask — calls Ollama, writes AISuggestion to DB
    └── alembic/          # Database migrations
```

**Stack:** Next.js 14 · FastAPI · SQLAlchemy · SQLite · Alembic · Ollama · TanStack Query · Zod · react-hook-form · Zustand · Tailwind CSS

---

## Key design decisions

### Provenance-first data model
Every annotation carries: source ID + content hash + paragraph position + character offsets + ontology node version + reviewer identity + timestamp. The audit log uses chained SHA-256 hashes (each event hashes the previous event's hash), making the trail tamper-evident.

### Read-confirmation gate
A reviewer must explicitly confirm they personally read the source testimony before the annotation form unlocks. This confirmation is stored as a linked database record and validated on every annotation write — not just a UI checkbox.

### Local AI review
After a human annotation is submitted, a `BackgroundTask` calls a locally running Ollama model. The model returns a structured JSON second opinion (suggestion, rationale, confidence). This is written as an `AISuggestion` with `decision: "pending"`. The human then accepts, rejects, modifies, or merges it.

### Prompt compilation
Approved annotations compile into a constrained system prompt for a synthetic patient AI persona. The prompt explicitly forbids the model from inventing personal history, demographics, diagnoses, or trauma not supplied by approved annotations. Each compiled prompt embeds its provenance: source version, ontology version, annotation IDs, compiler version.

---

## Running locally

**Prerequisites:** Python 3.11+, Node 18+, [Ollama](https://ollama.com) with a model pulled (default: `llama3`)

```bash
# 1 — Clone
git clone https://github.com/Luisv8181/ANNI.git
cd ANNI

# 2 — Backend
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 3 — Frontend (new terminal, from repo root)
npm install
npm run dev
```

Open `http://localhost:3000`. The backend API is available at `http://localhost:8000` (docs at `/docs`).

### Configuration

All backend settings use the `ANNI_` env prefix. Create `backend/.env` to override:

```env
ANNI_DATABASE_URL=sqlite:///./anni.db
ANNI_OLLAMA_URL=http://localhost:11434
ANNI_OLLAMA_MODEL=llama3
ANNI_CORS_ORIGINS=["http://localhost:3000"]
```

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/ontology-nodes` | List all ontology nodes |
| GET | `/projects` | List projects |
| GET | `/sources?project_id=` | List sources for a project |
| GET | `/sources/{id}/paragraphs` | List paragraphs for a source |
| POST | `/read-confirmations` | Record that a reviewer read a source |
| GET | `/annotations?project_id=` | List annotations with decisions |
| POST | `/annotations` | Submit annotation (triggers Ollama review) |
| POST | `/annotations/{id}/decisions` | Record accept/reject/modify/merge decision |
| GET | `/annotations/{id}/citation` | Full provenance citation for an annotation |
| GET | `/annotations/{id}/suggestions` | List AI suggestions for an annotation |
| POST | `/annotations/{id}/suggestions/{sid}/decide` | Decide on an AI suggestion |
| POST | `/prompt-compilations` | Compile approved annotations into a system prompt |
| GET | `/audit-log` | Tamper-evident audit log (newest first) |

Interactive docs: `http://localhost:8000/docs`

---

## Product guardrails

1. **No AI writes directly to the knowledge base.** Every `AISuggestion` starts with `decision: pending`. A human must act on it.
2. **No annotation without a read confirmation.** The backend validates the `read_confirmation_id` on every annotation POST, including that the confirmation belongs to the same source.
3. **Prompt compilation accepts only approved annotations.** The endpoint rejects any annotation not in `status: approved`.
4. **All events are audit-logged with chained hashes.** The log can be verified programmatically — any gap or tampered event breaks the chain.

---

## What's not built yet

- Authentication — reviewer identity is currently a UUID stored in localStorage. JWT auth is the next backend sprint.
- Source import UI — the data model supports full source ingestion with license/allow-list checks, but the UI for importing new sources is not built.
- Async SQLAlchemy — current DB sessions are synchronous. For multi-user load, migrate to `sqlalchemy.ext.asyncio`.
- Tests — backend route tests with `pytest` + `httpx.AsyncClient`, frontend with `vitest` + `msw`.
- Multi-project navigation — the UI is scoped to the demo project. Routing for multiple projects is the next frontend sprint.
