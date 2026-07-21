# Manuscript Methods — documentation of AI use (draft)

Drafted for the **Methods** section, per SCRIP guidance (LLMs cannot be authors; any AI use must be
documented in Methods). Edit tone/length to match the manuscript. Fill the bracketed specifics
(model versions, dates) before submission.

---

## Draft paragraph (drop-in)

> **Use of artificial intelligence.** Artificial intelligence tools were used in several defined,
> human-supervised roles in this study; no large language model (LLM) met authorship criteria, and none
> is listed as an author. The study's annotation and simulation platform (ANNI), its GitHub repository,
> and the research documentation were developed with the assistance of an AI coding assistant (Claude
> Opus 4.8, Anthropic), and all code, data models, and interfaces were reviewed and approved by the
> authors. Behavioral characteristics were extracted from licensed,
> publicly available patient testimony by human annotators; a locally hosted LLM (Ollama running
> `llama3`) provided non-binding trait suggestions that a human annotator accepted, rejected, or
> modified, with each decision recorded in a tamper-evident audit log. Simulated patients were generated
> by a locally hosted LLM role-playing a profile compiled from human-approved, cited annotations layered
> on a DSM-5 generalized anxiety disorder baseline; simulated patients did not reproduce any single
> individual's narrative. The conversational agents under evaluation — general-purpose LLMs (e.g.,
> ChatGPT) and a purpose-built therapeutic application (Wysa) — were the objects of study rather than
> instruments of analysis. Meeting notes and transcripts were produced with an automated notetaker
> (Google Gemini) with participant consent and reviewed by the authors, and an AI-assisted literature
> synthesis informed the background framing, with all cited claims verified against primary sources.
> Locally hosted models were used where feasible to keep sensitive text on-device.

---

## Notes for finalizing
- Insert **model versions and access dates** (e.g., the exact Ollama model tag; the ChatGPT/Wysa
  versions tested) — the study already logs model + settings per transcript, so pull them from there.
- If a cloud model is used later (Google AI Studio / Gemini), add one sentence stating which text was
  sent to it and confirming no unlicensed or identifiable data was included.
- Keep this consistent with the **How-AI-was-used** section in
  [`METHODS-AND-DECISIONS.md`](METHODS-AND-DECISIONS.md).
