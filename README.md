# ANNI — Artificial Neural Annotation Intelligence

A **local-first, human-in-the-loop annotation platform** for transforming appropriately licensed public patient testimonies into structured, explainable behavioral profiles for synthetic patient simulations used in medical education.

---

## What it does

ANNI enforces a strict provenance chain from raw testimony to usable synthetic patient trait. Every step is recorded, every AI output requires a human decision, and nothing enters the knowledge base without an auditable approval.

```
source ingest → read gate → human annotation → AI review → human decision →
approved trait → compiled synthetic-patient prompt → Patient Lab → blind scoring
```

The core rule: **AI can suggest. Humans decide.** Every trait in a compiled
profile traces back to a cited quote from a human-approved annotation — the
system is built for *inspiration, not replication*.

### Surfaces (pages)

| Route | What it's for |
|-------|---------------|
| `/` | Annotation workspace — read gate, annotation form, ontology browser, AI review, citation engine |
| `/reader` | Lab Reader — ingest a source (paste / URL / PDF), smart highlighter (Ollama-assisted), annotation tracker, end-of-session summary, and one-click synthetic-profile prompt generation with citations |
| `/lab` | Synthetic Patient Lab — an Ollama model role-plays the compiled patient; risk-level and outcome-mode controls; push transcripts to the scoring queue |
| `/score` | Blind scoring — a blinded queue scored on safety / accuracy / warmth, with team results and source-guess accuracy |
| `/ontology` | In-app ontology editor — view grouped traits, add new ones |
| `/provenance` | Tamper-evident audit chain viewer with a recompute-and-verify badge |
| `/presence` | Presence Studio — the synthetic patient's visual language, all four states side by side |
| `/annotate` | Focused annotator mode |

---

## Architecture

```
ANNI/
├── app/                  # Next.js 14 frontend (React, TypeScript, Tailwind)
│   ├── page.tsx          # Annotation workspace — composes workspace components
│   ├── reader/           # Lab Reader — ingestion, smart highlighter, session summary, prompt gen
│   ├── lab/              # Synthetic Patient Lab (Ollama patient)
│   ├── score/           # Blind scoring view
│   ├── ontology/        # In-app ontology editor
│   ├── provenance/      # Audit-chain viewer + verify badge
│   └── annotate/        # Focused annotator mode
├── components/           # One component per panel
│   ├── testimony-panel.tsx
│   ├── annotation-form.tsx
│   ├── ontology-browser.tsx
│   ├── suggestion-dashboard.tsx
│   ├── synthetic-profiles.tsx
│   ├── project-picker.tsx
│   └── citation-engine.tsx
├── lib/
│   ├── api.ts            # Typed fetch client for the FastAPI backend
│   ├── hooks.ts          # TanStack Query hooks (queries, mutations, optimistic updates)
│   ├── schemas.ts        # Zod validation schemas (mirrors backend Pydantic models)
│   ├── store.ts          # Zustand — ephemeral UI state only (hasRead, selectedOntologyId)
│   ├── project.ts        # Current-project selection (multi-project support)
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
| POST | `/ontology-nodes` | Add a new ontology node (in-app editing) |
| GET | `/projects` | List projects |
| POST | `/projects` | Create a project (multi-project support) |
| GET | `/sources?project_id=` | List sources for a project |
| GET | `/sources/{id}/paragraphs` | List paragraphs for a source |
| POST | `/sources/ingest` | Ingest a source from pasted text (cite + segment) |
| POST | `/sources/ingest-url` | Ingest a source by fetching a URL |
| POST | `/sources/ingest-file` | Ingest a source from an uploaded file (PDF/text) |
| POST | `/read-confirmations` | Record that a reviewer read a source |
| GET | `/annotations?project_id=` | List annotations with decisions |
| POST | `/annotations` | Submit annotation (triggers Ollama review) |
| POST | `/annotations/{id}/decisions` | Record accept/reject/modify/merge decision |
| GET | `/annotations/{id}/citation` | Full provenance citation for an annotation |
| GET | `/annotations/{id}/suggestions` | List AI suggestions for an annotation |
| POST | `/annotations/{id}/suggestions/{sid}/decide` | Decide on an AI suggestion |
| GET | `/annotation-stats?project_id=` | Annotation tracker stats (totals, by-trait, IAA inputs) |
| POST | `/annotation-assist` | Ollama-assisted trait suggestion for the smart highlighter |
| POST | `/prompt-compilations` | Compile approved annotations into a system prompt |
| GET | `/prompt-compilations?project_id=` | List compiled synthetic-patient profiles |
| GET | `/synthetic-lab/config?project_id=` | Lab config (profiles, risk levels, outcome modes) |
| POST | `/synthetic-lab/message` | Send a turn to the Ollama synthetic patient |
| POST | `/synthetic-lab/generate-prompt` | Generate a profile prompt + provenance footer + citations |
| GET | `/scoring-items?project_id=` | Blinded scoring queue |
| POST | `/scoring-items/from-conversation` | Turn a lab transcript into scoring items |
| POST | `/scores` | Submit a blind score |
| GET | `/scoring-results?project_id=` | Aggregated scoring results |
| GET | `/audit-log` | Tamper-evident audit log (newest first) |
| GET | `/audit-log/verify` | Recompute the SHA-256 chain and report integrity |

Interactive docs: `http://localhost:8000/docs`

---

## Product guardrails

1. **No AI writes directly to the knowledge base.** Every `AISuggestion` starts with `decision: pending`. A human must act on it.
2. **No annotation without a read confirmation.** The backend validates the `read_confirmation_id` on every annotation POST, including that the confirmation belongs to the same source.
3. **Prompt compilation accepts only approved annotations.** The endpoint rejects any annotation not in `status: approved`.
4. **All events are audit-logged with chained hashes.** The log can be verified programmatically — any gap or tampered event breaks the chain.

---

## What's built since the first cut

- **Source import UI** — the Lab Reader ingests sources from pasted text, a URL, or an uploaded PDF, with license/allow-list metadata captured on ingest.
- **Smart highlighter** — an Ollama-assisted annotation assistant suggests traits from a highlighted span; the human still decides.
- **Annotation tracker + session summary** — the Reader tracks how you annotate and produces an end-of-session summary table (time, counts, traits), then compiles the synthetic-profile prompt.
- **Synthetic Patient Lab** — an Ollama model role-plays the compiled patient under risk-level and outcome-mode controls; transcripts can be pushed to the scoring queue.
- **Blind scoring** — a blinded queue scored on safety / accuracy / warmth with team results and source-guess accuracy.
- **In-app ontology editing** and **multi-project support**.
- **Provenance surfacing** — compiled prompts carry a provenance footer + per-annotation citations, and `/provenance` verifies the audit chain.

## What's still open

- Authentication — reviewer identity is a UUID in localStorage. JWT auth is the next backend sprint.
- Async SQLAlchemy — DB sessions are synchronous; migrate to `sqlalchemy.ext.asyncio` for multi-user load.
- Automated tests — backend route tests with `pytest` + `httpx.AsyncClient`, frontend with `vitest` + `msw`.
- Deployment — the system is intentionally **local-only** today (privacy). See `research/DEPLOYMENT.md` for the hosting assessment and the Google AI Studio path.
