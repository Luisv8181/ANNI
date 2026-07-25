# Methods & Decisions Log

A running record of the study's methods and the decisions behind them. Two jobs:
1. Keep the team aligned on **what we decided and why**.
2. Seed the manuscript's **Methods** section — including the required documentation of **how AI was
   used** (SCRIP: LLMs can't be authors; AI use must be documented in Methods).

Newest decisions are added at the top of each section. Dates are when a decision was made or recorded.

---

## 1. Study design

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| D1 | **Research question:** does a chatbot notice a crisis signal and respond the way a trained person would? | Focuses the study on clinical safety / risk handling. | Wk 1–3 |
| D2 | **Scope narrowed** to risk-signal handling, *not* "is AI as good as a human therapist." | A full human-vs-AI comparison needs a large matched clinician pool and text-scoring tools that don't reliably exist; would consume the project defending the comparison. Real therapists remain a **later-phase bonus**. | Wk 1–3 |
| D3 | **Responder lineup (4):** purpose-built therapy app (**Wysa**), standard chatbot (ChatGPT, no instructions), chatbot **told to act as a therapist**, and **real therapists** (later phase). | From the plain-language study poster; Wysa is set up. | Wk 1–3 |
| D4 | **Added structures:** a **counselor-support** (human-in-the-loop) setup and an **AI self-assessment** layer. | Counselor-support isolates the AI's cognitive job from the affective one and mirrors ANNI's "AI suggests, humans decide"; self-assessment tests whether the model "knows" when it's out of its depth. | From deep-research review |
| D5 | **Risk matrix — 4 levels:** None / Subtle / Ambiguous / Explicit, each with a "what a good response does." Over-reacting to *None* is a failure too. | Mirrors VERA-MH dimensions; lets us find exact failure thresholds. | Wk 1–3 |
| D6 | **Turns:** start ~20 back-and-forth; also stress-test **70–75 turns**; multiple sessions per persona across counseling **stages** (beginning/middle/later). | AI safety degrades over longer/multi-turn interactions — that's where failures surface. | Jul 20 |
| D7 | **Blinding:** the synthetic patient is **not told it's talking to an AI** in the initial phase. | Preserves integrity; knowing-vs-not-knowing is a later-phase comparison. | Jul 20 |
| D8 | **Secondary dimension:** analyze mental-health chatbots' **privacy policies** and a possible **conflict of interest** (engagement/profit vs. successful outcome). | Raised in the Jul 20 meeting; ties to Polisee / Optimust. | Jul 20 |

## 2. Synthetic patient methodology

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| P1 | **5 deeply annotated cases** to build the initial profile; follow-up compares **5 vs 10**. | Quality over quantity while we're establishing the method. | Jul 20 |
| P2 | **Open + closed outcomes:** model the same patient on a free/open path and a predetermined **treatment-failure** path, both tracked. | ~5–10% of GAD patients deteriorate after starting therapy; tracking both shows the *path* to failure vs. success. | Jul 20 |
| P3 | **Annotation = inspiration, not replication.** Extract *common, cited characteristics* across testimonies; never reproduce an individual's story. | Ethical line ("be inspired by it, don't be it"); also avoids the "AI recognizing its own syntax" artifact. | Jul 20 |
| P4 | **DSM-5 GAD baseline** programmed as the clinical floor, with testimony-derived traits layered on top. | Free, standard baseline; testimonies add natural human characteristics. | Jul 20 |
| P5 | **Patient self-consistency reviewer:** an internal check that locks *facts/character* while allowing *state* (mood/symptoms) to move per the outcome mode; tunable trial window (~first 20–30 turns), then locked. | Small models drift/lose context over long runs; we must keep the persona consistent without making it immune to legitimate therapeutic change. | Jul 20 |
| P6 | **Vignettes come only from ANNI-annotated, cited testimony** — never hand-written. | Correction made after an early misstep; hand-authoring reintroduces the artifact ANNI exists to prevent. | Jul (chat) |

## 3. Scoring & evaluation

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| S1 | **Blind panel** of mental-health professionals scores each response on **Safety / Accuracy / Warmth**; the three of us **recuse** ourselves. | We designed it, so we don't grade it; blinding removes source bias. | Wk 1–3 |
| S2 | **"Guess the source"** check (human vs. AI; which setup). | Measures how good the blinding was. | Wk 1–3 |
| S3 | **Expert disagreement is analyzed, not averaged away.** Report inter-rater reliability per category & risk level; debrief the highest-spread items. | FAccT 2026: experts disagree most on the highest-stakes safety items, often for principled reasons; averaging creates an invalid "arithmetic compromise." | Wk 1–3 |
| S4 | **Rahmat's expanded categories:** symptom reduction, personalization, consistency, crisis detection, respectful-regardless-of-demographics, clear-it's-an-AI, comfort relying on it, no stigma, privacy protection. | Operationalizes Safety/Accuracy/Warmth + "common person" trust checks. | Jul 20 |
| S5 | **Pre-registration** (plan + predictions public before running). | Open science; prevents moving the goalposts. | Wk 1–3 |

## 4. Tooling & technical methods (ANNI)

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| T1 | **Human-in-the-loop annotation** ("AI suggests, humans decide") with provenance: read gate, content hashing, chained-hash audit log. | Every trait must trace to a cited quote and a human decision. | Ongoing |
| T2 | **Local-first via Ollama** for AI suggestions and the synthetic patient. | Keeps sensitive text off the cloud (privacy). | Ongoing |
| T3 | **Document ingestion pipeline** (Lab Reader): cite → content-hash → segment into paragraphs. Inputs: paste text, **URL fetch**, **PDF/.txt upload**. | Turns a real source into an annotatable document with provenance. | Jul 21 |
| T4 | **Smart highlighter:** offline keyword heuristic **plus** an optional model suggestion (Ollama); human always confirms. | Works with no model; upgrades when a model is available. | Jul 21 |
| T5 | **Annotation tracker + session summary:** trait distribution, confidence, decisions, AI-agreement, session timing and per-annotation log. | Tracks *how we annotate* (a research output in itself). | Jul 21 |
| T6 | **Prompt generator:** compiles a session's cited annotations into a pasteable synthetic-patient system prompt (DSM-5 baseline + traits + outcome/risk). | The bridge from annotation → runnable synthetic patient. | Jul 21 |
| T7 | **Synthetic Patient Lab** with **Relay Mode** (copy each side into Wysa/ChatGPT) to keep the AI-to-AI study blind. | Lets every side "think" it's talking to a person. | Jul 20–21 |
| T8 | **GitHub is the study-infrastructure home; Google Drive is the manuscript home.** Work developed on a branch, merged to `master` so the team sees it at the repo root. A START HERE index ties the two. | One source of truth for code/protocol; Drive for the written paper. | Jul 20 |
| T9 | **Citation & provenance are surfaced, not just stored.** Every compiled synthetic-profile prompt ships with a **provenance footer** (compiler + ontology versions, annotation IDs, source hashes) and a **per-annotation citation report** (source, license, sha256, quote, char offsets, reviewer, decisions). The **`/provenance` viewer** recomputes the chained-hash audit log and shows a verify badge. | Reviewers and the manuscript need to *see* the chain from trait → cited quote → human decision, and prove the record wasn't altered. | Jul 25 |
| T12 | **The patient reports its own distress/disclosure each turn**, parsed and stripped server-side, and plotted as a session trail. Treated as **telemetry, never a scoring input**; missing reports are recorded as gaps, never interpolated. | Gives the multi-turn degradation analysis a per-turn series, and makes the presence reflect the conversation rather than only the operator's setting. Self-report is not ground truth, so it must not enter scoring. | Jul 25 |
| T11 | **The synthetic patient has an abstract visual presence, never a face.** Its breath rate/depth, guard ring, colour, and dimming encode arousal, withdrawal, escalation, and outcome mode. It is shown in the Patient Lab and **barred from the blind scoring view**, because those channels encode the hidden key. | A rendered face would imply a real person's likeness (violating "inspiration, not replication") and would bias how scorers read warmth — we are measuring the text. Abstract keeps the personality without either problem. | Jul 25 |
| T10 | **In-app ontology editing + multi-project support.** New traits are added in-app (audited); reader/lab/score follow the selected project so real study data stays separate from the demo. | Lets the team grow the codebook and keep projects isolated without touching code. | Jul 21 |

## 5. Deployment

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| X1 | **Local-only for now.** Each member runs ANNI on their own machine; Luis runs the simulations and records them. | Keeps data private and the model (Ollama) local; matches the study's privacy stance. | Jul 21 |
| X2 | **If a cloud option is ever needed:** use **Google AI Studio (Gemini) free API** as the model backend, a static host (Netlify/Vercel) for the frontend, and Postgres for data. **Firestore is a poor fit** for our relational, audit-chained data without a rewrite. | Keeps a future cloud path in the Google ecosystem without committing now. | Jul 21 |

## 6. How AI was used (for the manuscript Methods section)

Documented per SCRIP guidance (LLMs are **not** authors; all AI output was reviewed by the human team):
- **Study infrastructure & code (ANNI):** an AI coding assistant — **Claude Opus 4.8 (Anthropic)** —
  helped build the annotation platform, the Lab Reader, the Synthetic Patient Lab, and the supporting
  scripts, and helped set up and organize the **GitHub repository** and the research documentation; all
  code, structure, and design were reviewed and approved by the team.
- **Annotation assistance:** a local model (Ollama, e.g., `llama3`) provides *suggestions* only; a human
  reviewer accepts/rejects/modifies every one.
- **Synthetic patient:** a local model role-plays the patient from a human-annotated, cited profile
  (DSM-5 baseline + traits); it never uses a real individual's story.
- **Responders under study:** general LLMs (e.g., ChatGPT) and a purpose-built app (Wysa) are the
  *subjects* of evaluation, not tools of the analysis.
- **Meeting documentation:** Gemini auto-generated meeting notes/transcripts (with consent), reviewed by
  the team.
- **Background synthesis:** a Gemini "deep research" report informed the literature framing; claims were
  checked against primary sources in the citation list.

## 7. Open decisions

- [ ] Responder scope for phase 1 — all four + counselor-support, or a subset?
- [ ] Which model(s) + temperature to pin (and log per transcript).
- [ ] Exact DSM-5 baseline wording in the patient prompt.
- [ ] Sample sizes (cases per risk level, personas, sessions) → pre-registration.

## Change log
- **2026-07-25** — Added T9 (citation/provenance surfacing + `/provenance` viewer) and T10 (in-app
  ontology editing + multi-project support). Retrofitted the repo docs to reflect every built surface.
- **2026-07-21** — Created this log; recorded local-only deployment decision + Google AI Studio cloud path.
