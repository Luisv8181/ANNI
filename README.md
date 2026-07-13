# ANNI

Artificial Neural Annotation Intelligence is a local-first, human-in-the-loop annotation platform for transforming appropriately licensed public patient testimonies into structured, explainable metadata.

This repository starts with a Sprint 1 implementation:

- Project and source intake scaffolding
- Required reading confirmation
- Three-column annotation workspace
- Ontology browser
- Local AI review queue interface
- Human vs. ANNI vs. final comparison dashboard
- Citation and provenance records
- Research dashboard foundation
- FastAPI backend skeleton with provenance-first data models

## Run the frontend

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Static site export

ANNI can be built as a static site:

```bash
npm run site
```

The exported site is written to `out/`. Upload that folder to a static host or serve it locally with any static file server.
## Backend skeleton

The backend lives in `backend/` and is intentionally conservative. It defines the core entities that ANNI must preserve before adding ingestion workers, Ollama review, embeddings, or simulation services.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Product guardrails

ANNI should never accept AI output directly into the knowledge base. The required chain is:

`original testimony -> human annotation -> AI suggestion -> human decision -> final annotation -> synthetic patient trait`

