# ANNI Synthetic Lab — full pipeline run

A complete, recorded walk-through of the pipeline: **source → cite → read gate → smart highlighter →
annotate → session summary → generated synthetic profile → Patient Lab → blind scoring → provenance.**

Run on **2026-07-25**. Everything here was produced by the app itself, not written by hand.

> **The source in this run is synthetic.** It's a composite written for the test — not a real person's
> testimony — so nothing here needs a license check. When you run this for real, only ingest sources
> Heath has cleared.

---

## What happened, stage by stage

| # | Screenshot | Stage | What it proves |
|---|-----------|-------|----------------|
| 01 | `01-import-and-cite.png` | Import & cite a source | Title, author, URL and license captured *before* the text enters the system |
| 02 | `02-reader-ingested.png` | Ingested into the reader | Content-hashed and split into paragraphs; **read gate blocks annotation** until confirmed |
| 03 | `03-smart-highlighter.png` | Smart highlighter | Model suggestion (84%, with rationale) **and** the offline heuristic (95%) both fire; the human still confirms |
| 04 | `04-tracker-after-five.png` | Live tracker | Trait distribution, confidence and AI-agreement update as you go |
| 05 | `05-session-summary.png` | Session summary | 5 annotations, timing per annotation, evidence quote for each |
| 06 | `06-generated-prompt.png` | Generator controls | Persona name, outcome mode, planted risk, DSM-5 toggle |
| 07 | `07-citations-block.png` | Generated prompt + citations | Every trait expands to quote, source, license, sha256, paragraph, char offsets, reviewer |
| 08 | `08-lab-session.png` | Patient Lab | The brand-new profile role-played across a 5-turn conversation |
| 09 | `09-presence-and-trail.png` | Presence + trail | Personality derived from cited traits; distress/disclosure trail across the session |
| 10 | `10-blind-scoring-queue.png` | Blind scoring | The queue shows **no presence, no risk label, no source** — blinding holds |
| 11 | `11-provenance-chain.png` | Provenance | **50 events, chain verified intact** across the whole run |

## Artifacts

- `artifacts/sp-04-system-prompt.md` — the generated profile prompt, ending in its ANNI provenance
  footer (compiler + ontology version, annotation IDs, source hash).
- `artifacts/sp-04-citations.json` — the machine-readable citation report: one entry per trait, each
  carrying source, license, `sha256`, paragraph, character offsets, reviewer, confidence, decisions.

## The profile this run produced

**SP-04 — Overwhelmed Self-Advocate**, compiled from 5 cited annotations of the demo source:

| Trait | Evidence quote | Conf. |
|-------|---------------|-------|
| Hesitates to disclose symptoms | "probably nothing, and I didn't want to bother the doctor" | 84% |
| Family support system | "drove me to every appointment after that and sat with me in the waiting room" | 88% |
| Medical literacy gap | "might as well have been written in another language. I nodded along without understanding the dosage instructions" | 93% |
| Healthcare trust barrier | "I stopped believing anyone there actually had my back" | 93% |
| Autonomy goal | "I just want to be the one who decides what happens next with my own treatment" | 93% |

Its **derived personality** — guarded 42 · steady 34 · warm 74 — comes entirely from those five traits'
ontology groups. Nothing was art-directed.

Across the 5-turn lab session the trail moved **distress +19, disclosure +30** (5/5 turns measured):
the patient got more distressed *and* opened up more — the healthy shape, matching the warm responder
turns used in the run.

---

## Reproducing this yourself

1. Start ANNI (see the root [`README.md`](../README.md), or
   [`research/rahmat-antigravity-tutorial.md`](../research/rahmat-antigravity-tutorial.md)).
2. Open `/reader`, click **Import a source**, paste the text from
   `artifacts/` or your own cleared source, and fill in the citation fields.
3. Click **I've read this**, then drag-select a phrase — the highlighter suggests a trait.
4. **Fill in the "Why?" note** (see the finding below), pick a confidence, **Add annotation**. Repeat.
5. Scroll to **Session summary** → name the persona, pick a planted risk → **Generate system prompt**.
6. Approve the annotations in the workspace, compile them into a profile, then open `/lab` to talk to it.
7. Push the conversation **To scoring**, and check `/provenance` to verify the chain.

---

## Findings from this run

Two things surfaced that are worth acting on.

**1. Blank notes make a thinner profile.** The first pass skipped the optional *"Why?"* field, and the
compiled prompt came out with `- Hesitates to disclose symptoms: (no note added)` for every trait. The
note is what carries the annotator's reasoning into the patient's behaviour. With notes filled it reads
`- Hesitates to disclose symptoms: Minimises the symptom and defers to others' need for the appointment
slot.` — materially richer. **Treat the note as required, not optional**, and say so in the annotation
training. Worth considering making it mandatory in the UI.

**2. Fixed a bug the simulation caught.** The citations panel wouldn't open: its `.md` download was a
`<button>` nested inside the toggle `<button>`, which is invalid HTML — the browser re-parents the inner
one and the click never reaches the toggle. The two are now siblings, and the panel expands correctly
(screenshot 07). This would have hit anyone trying to inspect citations in the UI.

## A note on the model used for this run

Ollama isn't reachable from the sandbox this run was recorded in, so a **scripted stand-in** answered on
`localhost:11434` — returning a fixed trait suggestion for each highlight and five scripted patient turns
with their state tags. That means the *plumbing* is fully exercised end to end (prompt → suggestion →
annotation → compile → role-play → state parse → trail → scoring → audit chain), but the **wording and
judgment quality of a real `llama3` are not represented here**. Re-run these steps on your own machine
with Ollama running to see genuine model output.
