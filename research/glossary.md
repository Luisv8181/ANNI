# Glossary

One place for the terms used across the study and the ANNI tool. Grouped into **study**, **ANNI tool**,
and **clinical** terms. Pulls together definitions that also appear in the poster, protocol, codebook,
and methods docs.

## Study terms
- **Responder** — a system whose replies we evaluate: Wysa (purpose-built app), a standard chatbot, a
  chatbot *told* to act as a therapist, the counselor-support setup, and (later) real therapists.
- **Direct-to-user** — an AI responder talking straight to the client (autonomous). See
  [`system-prompts/direct-to-user.md`](system-prompts/direct-to-user.md).
- **Counselor-support** — the AI advises a human who sends the reply (human-in-the-loop); the heart of
  the study. See [`system-prompts/counselor-support.md`](system-prompts/counselor-support.md).
- **Risk cue / red flag** — something in the client's message signaling possible danger.
- **Risk level** — the planted intensity of a cue: **None / Subtle / Ambiguous / Explicit** (see
  [`risk-matrix.md`](risk-matrix.md)).
- **Escalation** — moving a situation to a higher level of care (crisis line, clinician).
- **Blinding** — scorers (and, in AI-to-AI runs, the synthetic patient) don't know the source of a
  message, so scores aren't biased.
- **Blind scoring** — an independent panel rates responses on safety/accuracy/warmth without knowing the
  source. Kit: [`scoring/`](scoring).
- **Guess the source** — scorers guess human-vs-AI per item; measures how good the blinding was.
- **Outcome mode** — the synthetic patient's tracked trajectory: **open** (free to improve/worsen) or
  **closed** (predetermined treatment failure).
- **Stages** — points in the counseling life cycle (beginning / middle / later) sampled across sessions.
- **Multi-turn degradation** — AI safety tending to worsen as a conversation lengthens.
- **Pre-registration** — writing the plan + predictions publicly before running the study
  ([`pre-registration.md`](pre-registration.md)).
- **Inter-rater reliability (IRR/IAA)** — how much independent raters agree (Krippendorff's α, ICC,
  Cohen's κ); reported as a finding, not averaged away.
- **Vignette** — a short, synthetic-but-realistic client case used for testing.

## ANNI tool terms
- **ANNI** — the annotation + simulation platform (Artificial Neural Annotation Intelligence).
- **Ontology / trait** — the tag set you annotate with (e.g., "Family support system"); versioned.
- **Annotation** — a highlighted evidence span + a trait + a reviewer note, with provenance.
- **Provenance** — the traceable chain: source → cited quote → human decision, recorded in a
  tamper-evident **audit log** (chained SHA-256 hashes).
- **Read gate** — the reviewer must confirm they personally read a source before annotating it.
- **Smart highlighter** — suggests likely traits on a selection (offline heuristic + optional model);
  the human confirms.
- **Compiled profile / prompt** — approved annotations compiled into a synthetic-patient system prompt.
- **Lab Reader** — the ingest + cite + annotate surface (`/reader`).
- **Synthetic Patient Lab** — where a local model (Ollama) role-plays the patient (`/lab`).
- **Relay Mode** — copying each side of a conversation into Wysa/ChatGPT so the run stays blind.
- **Scoring item** — one responder message (in context) queued for the blind panel (`/score`).
- **Project** — a container separating one workstream's data (sources, annotations, profiles, scores)
  from another.

## Clinical terms
- **GAD** — Generalized Anxiety Disorder: chronic, hard-to-control worry across multiple areas for ≥6
  months, with physical symptoms; the study's focus.
- **DSM-5** — the diagnostic manual; we use its GAD criteria as the synthetic patient's clinical baseline.
- **CBT** — Cognitive Behavioral Therapy: a structured, skills-based therapy well-suited to anxiety.
- **ACT / DBT** — Acceptance & Commitment Therapy / Dialectical Behavior Therapy (appear in source cases).
- **Pseudo-empathy** — an AI simulating emotional understanding via pattern-matching without the capacity
  to execute real clinical support.
- **Premature termination** — a client dropping out of therapy early (useful for the closed/failure path).
- **Teach-back** — asking a patient to repeat the plan in their own words to confirm understanding.
- **988** — the US Suicide & Crisis Lifeline (call or text). For real crises, not part of the study.

## System / setup terms
- **System prompt** — the hidden instructions that tell a chatbot how to behave (e.g., "act like a
  therapist").
- **Ollama** — runs AI models locally (on-device), keeping data off the cloud.
- **Antigravity** — Google's agentic setup tool used to install ANNI locally (Rahmat's tutorial).
- **gh CLI** — the GitHub command-line tool used to clone the repo.
