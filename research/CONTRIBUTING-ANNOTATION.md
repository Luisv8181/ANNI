# How to Annotate in ANNI

This is the hands-on guide for tagging testimony characteristics and citing them. Luis will do this
solo for a week, then teach the team from this doc. If you're new, start with **Annotator mode** — it
walks you through each step.

---

## The idea in one line

We read real (licensed) patient testimony, **highlight the phrases that reveal a characteristic**, tag
each with a trait, and record why — so every trait we use in a simulated client is **traceable to a
real quote**, with the AI's second opinion on record. Rule: **AI suggests, humans decide.**

## Before you annotate: is the source cleared?

Only annotate sources that are **licensed/allow-listed** (Heath's check). If a source is still
`pending` in [`sources/INTAKE-REGISTER.md`](sources/INTAKE-REGISTER.md), don't paste its text anywhere
yet — leave it as a link until it's cleared.

## Two ways to run ANNI

### Option 1 — Annotator mode (recommended for the team)
The friendly, guided flow. No expert UI to learn.
- **In the app:** run it locally (below) and open **`/annotate`**, or click **"Annotator mode"** from
  the main workspace.
- **Zero-setup practice:** the standalone **Annotator Playground** (shared as a link / in the repo as
  `annotator-playground.html`) runs in any browser with nothing to install. Perfect for learning; tags
  stay in your browser and don't save to the project.

### Option 2 — Lab Reader (import + smart highlighter)
The on-ramp for **real sources**. Open **Lab Reader** (`/reader`) → **Import a source**: paste the text
with its title/author/URL/license. ANNI cites it, content-hashes it, and formats it into paragraphs.
Then confirm you read it, **highlight** a phrase, and the **smart highlighter** suggests the most likely
trait (you confirm or override). A live **"How we annotate"** tracker shows the trait distribution,
average confidence, decisions, and how often you agree with the AI. Only paste text you're cleared to use.

### Option 3 — Expert workspace
The full pipeline (read gate, ontology browser, AI suggestions, citation engine, compiled profiles).
Use this once you're comfortable.

## The five steps (same in both)

1. **Choose a story** (source/testimony).
2. **Read it** and confirm you personally read it — ANNI stores this as part of the audit trail; you
   can't annotate until you do.
3. **Highlight the evidence** — select the exact words that show a characteristic.
4. **Tag the trait** — pick from the trait list (plain-language cards in Annotator mode). ANNI's local
   AI gives a **second opinion**; you can accept, reject, modify, or merge it.
5. **Rate your confidence, add a why, save.** It's now an annotation with full provenance.

## The trait list (ontology)

ANNI ships with the trait set we use (hesitation to disclose, indirect communication, healthcare-trust
barrier, family support, medical-literacy gap, autonomy goal, dignity, learner objective). If the
study needs new traits (e.g., crisis-specific cues), we add them to the ontology deliberately and
version them — open an issue or tell Luis; don't invent ad-hoc tags.

## From annotations → simulated clients

Approved annotations compile into a **behavioral profile** (a constrained system prompt) for a
synthetic patient. That's the bridge from real testimony to the
[simulated client](system-prompts/simulated-client.md): the client's persona traits come from
**cited, approved** annotations, not from thin air.

## Running ANNI locally (for the app version)

From the repo root (see the main project `README.md` for full detail):

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# frontend (new terminal, repo root)
npm install
npm run dev        # open http://localhost:3000  → click "Annotator mode"
```

(The local AI second-opinion needs Ollama running; without it, annotations still save and simply stay
in "ANNI reviewing…" until reviewed.)

## Golden rules

- **Read before you tag** — the gate is there on purpose.
- **Quote exactly** — the highlighted span is the citation; don't paraphrase it.
- **One clear trait per highlight** — if a quote shows two things, make two annotations.
- **Never annotate uncleared or sensitive text.** Links first, text only once licensed.
