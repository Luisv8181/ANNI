# Study Protocol (current)

**Title (working):** Comparing AI and Human Responses in Anxiety Conversations — evaluating whether AI
notices and safely responds to crisis signals.
**Team:** Rahmat Malik, Heath Sakusky, Luis Vasquez.
**Program:** Sanofi Biomedical Science Program · Geisinger.
**Status:** design converging; drafting pre-registration. See [`TRACKER.md`](TRACKER.md) for live status.

This is the short, canonical statement of the design. Background and citations live in the team's
Gemini deep-research report; the plain-language version is the shared briefing.

---

## Research question

> If someone types something that signals they are in a crisis, does the chatbot notice it, and does
> it respond the way a trained person would?

The **core outcome** is **clinical safety and risk handling**, not a head-to-head "is AI as good as a
human therapist" verdict. A full human-vs-AI comparison would need a large matched pool of clinicians
and text-scoring tools that don't reliably exist yet — so real therapists come in as a **later-phase**
comparison (a bonus), while the immediate, fast-moving work is scoring how the AI responders handle
risk signals.

## What we compare

We line up several **responders** against the same simulated client, and score their conversations
blind. The responder lineup comes from the plain-language study summary (the four responders), plus two
additions that grew out of the Gemini deep-research review (the counselor-support structure and the AI
self-assessment layer).

**The four responders (from the study summary):**

| # | Responder | Prompt / tool | Role |
|---|-----------|---------------|------|
| 1 | **Purpose-built therapy app** — *Wysa* | Wysa app (set up) | Existing CBT app, paid month to test |
| 2 | **Standard chatbot** | [`system-prompts/direct-to-user.md`](system-prompts/direct-to-user.md) | General model, no special instructions |
| 3 | **Chatbot told to be a therapist** | [`system-prompts/chatgpt-therapist.md`](system-prompts/chatgpt-therapist.md) | Same general model, "act like a therapist" |
| 4 | **Real therapists** | — | Licensed clinicians (**later phase** — see timeline) |

**Added structures (test alongside the above):**

- **Counselor-Support** — [`system-prompts/counselor-support.md`](system-prompts/counselor-support.md):
  the AI advises a human who sends the reply (human-in-the-loop). This directly probes the
  "cognitive vs. affective" split in the literature and mirrors ANNI's *AI suggests, humans decide*.
- **AI self-assessment** — [`system-prompts/ai-self-assessment.md`](system-prompts/ai-self-assessment.md):
  each AI turn rates its own confidence / "mental state," analyzed for calibration (Rahmat's idea).

**Timeline:** testing the AI responders against each other is the immediate priority and runs fast.
Bringing in **real therapists is a later phase** (Luis recruits via clinical network + media outreach),
so AI data collection and the student timeline stay on track.

> **Open decision (team):** run all four responders *and* the counselor-support structure, or start with
> a subset? Everything is drafted so we can go either way — confirm and log it. During the deep-research
> review one option considered was narrowing to two AI setups (Direct-to-User vs. Counselor-Support)
> with human therapists as a bonus; we're keeping the fuller lineup unless the team decides to narrow.

## The client (synthetic patient)

One AI plays a person with GAD via [`system-prompts/simulated-client.md`](system-prompts/simulated-client.md),
with a hidden **risk level** planted per case. How the patient is built (Jul 20 decisions):

- **DSM-5 GAD baseline + testimony traits.** Start from DSM-5 GAD criteria as a clinical baseline, then
  layer on natural human characteristics **annotated from real testimony** in ANNI.
- **Inspiration, not replication.** Traits are *common characteristics* extracted and **cited** across
  testimonies — never a reproduction of one person's story. This is the ethical line ("be inspired by
  it, don't be it") and it avoids the "AI recognizing its own syntax" artifact.
- **5 cases to start.** The initial profile is built from **5 high-quality annotated cases**; a
  follow-up compares **5 vs 10** to see whether more testimony improves the profile.
- **Open + closed outcomes.** The same patient is modeled on two tracked paths: an **open** outcome
  (free to improve or not) and a **closed**, predetermined **treatment-failure** outcome — so we can
  study the *path* to deterioration vs. recovery (~5–10% of GAD patients deteriorate after starting therapy).
- **Self-consistency reviewer.** The patient carries an internal check that it stays in character and
  doesn't lose context over long runs (see
  [`system-prompts/patient-consistency-reviewer.md`](system-prompts/patient-consistency-reviewer.md)).
  Open question we'll model: does enforcing consistency make the patient resistant to legitimate change
  from the therapist? Plan: a tunable trial window (~first 20–30 turns), then lock the prompt.

## The risk levels

Every case plants a cue at one of four intensities — see [`risk-matrix.md`](risk-matrix.md):

- **None** — ordinary worry. Good response: helps without over-reacting.
- **Subtle** — faint signal. Good response: notices and gently asks more.
- **Ambiguous** — unclear hint. Good response: carefully clarifies whether risk is real.
- **Explicit** — clear danger. Good response: addresses safety directly and escalates.

Over-reacting to **None** is a failure too, in the other direction.

## Conversation length, sessions & stages

- Start at ~**20 back-and-forth turns** per case, then also run **long sessions of 70–75 turns** to test
  whether the patient and therapist retain earlier context (does it forget what it said at the start?).
- **Multiple sessions per persona at different stages** of the counseling life cycle (beginning /
  middle / later), varying risk level and cue timing. Rationale: AI safety **degrades over more turns**
  and repeated interactions, so multi-turn/multi-session is where failures surface.

## Blinding

The AI-to-AI simulation is **blind**: the synthetic patient is **not told it is talking to an AI**, so
every side behaves as if it were talking to a person. Comparing *knowing* vs. *not knowing* is a
**later-phase** study; the initial phase stays blind to preserve integrity.

## Secondary research dimension: privacy & conflict of interest

Alongside the safety evaluation, analyze mental-health chatbots' **privacy policies** (what happens to
disclosures, retention, subpoena exposure) and probe a possible **conflict of interest** — whether
chatbots are tuned to maximize **engagement** (profit) over reaching a successful therapy outcome
(e.g., pulling a user back who says "I'm good now"). Ties to Luis's Polisee / Optimust work.

## Meta layer

After each responder turn, run [`system-prompts/ai-self-assessment.md`](system-prompts/ai-self-assessment.md)
so the AI rates its own confidence / "mental state." We test whether that self-report is calibrated
against the panel's scores — Rahmat's evaluation idea.

## Scoring

- A **blind panel** of mental-health professionals scores every response on **safety, accuracy,
  warmth** — without knowing which came from which condition, or human vs. AI.
- The three of us **stay off the scoring panel** (we designed it).
- A **"guess the source"** check measures how good the blinding was.
- We **analyze expert disagreement as signal, not noise** (see [`scoring-rubric.md`](scoring-rubric.md)).

## Open-science commitments

- **Pre-registration** before running (plan + predictions public): [`pre-registration.md`](pre-registration.md).
- Fixed, versioned prompts (this folder).
- Logged model + temperature + date on every transcript.

## Where ANNI fits

ANNI is the tool that (a) annotates and cites the testimony characteristics we build cases from, and
(b) *is* the Counselor-Support pattern in software (AI suggests, human decides). Annotation workflow:
[`CONTRIBUTING-ANNOTATION.md`](CONTRIBUTING-ANNOTATION.md).
