# The Synthetic Presence — visual language for the simulated client

The synthetic patient now has a **visual body** in the Patient Lab: an animated form that reacts to
what the patient is doing and what we planted in it. This doc is the art direction and, more
importantly, the **rules for when it may be shown**.

See it live at **`/presence`** (the studio — all four states side by side) or in the left column of
**`/lab`**.

---

## The one design decision: it is not a face

The presence is an abstract form — a breathing core inside a guard ring. That is deliberate, for two
reasons that both matter to this study:

1. **Ethics.** Our annotation rule is *inspiration, not replication*. A rendered human face implies a
   specific real person. A form does not. The presence can carry a personality without ever claiming
   to be somebody's likeness.
2. **Validity.** A photoreal face would change how a scorer reads warmth and safety — a sympathetic
   face makes a bad response feel better than it is. We are measuring the *text*. The presence is an
   instrument panel for the operator, not a character portrait for the scorer.

A secondary benefit: no uncanny valley, no 3D asset pipeline, no gigabytes of model files. It's SVG
and CSS, so it runs anywhere the app runs and stays local-only like everything else.

---

## Three inputs, deliberately kept separate

| Input | What it is | What it drives |
|-------|-----------|----------------|
| **Cited traits** | The ontology nodes the profile was compiled from | The profile's stable **personality** — guardedness, steadiness, warmth |
| **Planted risk** | What the operator set for this session (the hidden key) | **Colour**, fixed for the session |
| **Patient self-report** | What the model says about itself each turn | **Breath** and **guard ring**, live |

Keeping colour on the *planted* level while breath and guard follow the *reported* state is the point.
**When the two disagree, that gap is the finding** — a patient planted at "none" that reports distress 80
is telling you something about the responder it just talked to.

## What each channel encodes

Nothing in the presence is decoration. Every moving part is a study variable made visible.

| Channel | Encodes | How it reads |
|---------|---------|--------------|
| **Breath** (scale pulse) | Arousal — self-reported distress, else the planted level | Slower and deeper when settled; **faster and shallower** as distress climbs — the way anxious breathing actually behaves |
| **Hitch** (uneven breath) | Steadiness, from cited traits | A profile carrying literacy gaps or trust barriers **catches and hitches**; one carrying goals and values breathes evenly |
| **Guard ring** (dashed orbit) | Withdrawal — self-reported disclosure, plus trait guardedness | Sits wide and drifts slowly when open; **tightens toward the core and spins faster** the more the patient is holding back |
| **Colour** | The planted risk level | Settled (violet) → holding something back (amber) → unsettled (orange) → in distress (rose) |
| **Inner light** | Warmth, from cited traits | Larger and softer for profiles carrying support, dignity, or autonomy traits |
| **Dimming + sink** | Outcome mode | A **closed** (treatment-failure) trajectory desaturates and sits lower in frame |
| **Ripples** | The local model is generating | Concentric waves while Ollama composes a reply |
| **Pulse** | The patient is speaking | A steady double-beat while the patient holds the floor |

The four risk states map exactly to [`risk-matrix.md`](risk-matrix.md): None / Subtle / Ambiguous /
Explicit.

---

## Personality is derived, not hand-set

Each profile's personality comes from the **ontology group** of every trait it was compiled from, so it
stays traceable to the annotations rather than being art-directed per character:

| Trait group | Guarded | Steady | Warm |
|-------------|---------|--------|------|
| Emotion (e.g. hesitates to disclose) | +0.30 | −0.12 | 0 |
| Communication (indirect) | +0.22 | −0.06 | 0 |
| Healthcare (trust barrier) | +0.34 | −0.14 | −0.16 |
| Support (family support system) | −0.26 | +0.12 | +0.30 |
| Health literacy (literacy gap) | +0.08 | −0.18 | 0 |
| Goals (autonomy) | −0.04 | +0.16 | +0.10 |
| Values (dignity in care) | −0.02 | +0.12 | +0.16 |
| Educational objectives | 0 | 0 | 0 — describes the simulation, not the person |

Keying on **group** rather than trait id means new traits added on `/ontology` inherit a sensible
default instead of rendering as a blank personality.

The current library lands at: **SP-01 Reluctant Discloser** guarded 34 / steady 26 / warm 80;
**SP-02 Guarded Navigator** 28 / 64 / 60; **SP-03 Plain-Language Seeker** 0 / 56 / 96. The studio shows
all three at the same risk level so the difference is attributable to traits alone, and each one lists
the traits that produced it.

## The self-report, and what it is not

Each turn, the patient model appends a hidden line — `[[state distress=NN disclosure=NN]]` — which the
backend parses and strips before the reply reaches the transcript. Three things to be clear about:

- It is **self-report, not ground truth.** The model is describing its own simulated state. Treat it as
  telemetry for the presence and the trajectory, **never as a scoring input**.
- It is **optional.** Small local models drop the tag under load. A missing tag is recorded as a gap and
  the presence falls back to the planted level; the lab keeps working either way.
- It is **hidden from the responder.** It is stripped server-side, so nothing leaks into the
  conversation the responder sees.

## The session trail

The Patient Lab draws a two-line trail across the session — distress and disclosure, one point per
patient turn. Gaps (turns where the model omitted its report) are **broken lines, not interpolated**: an
invented point would be indistinguishable from a measured one.

The shape is the useful part. **Distress climbing while disclosure flattens** is the signature of a
conversation going wrong, which is exactly what the multi-turn degradation analysis in
[`analysis-plan.md`](analysis-plan.md) is looking for. The trail is appended to the transcript export as
CSV under a clearly-marked hidden block — strip it with the header before blind scoring.

---

## Where it may and may not be shown

This matters more than the aesthetics. **The presence encodes the hidden scoring key.**

- ✅ **Patient Lab (`/lab`)** — fine. The operator planted the risk level; they already know it.
- ❌ **Blind scoring (`/score`)** — **never.** The colour and breath rate give away the planted risk
  level, and the dimming gives away the outcome mode. Putting the presence on the scoring view would
  break blinding and invalidate the round. The component is deliberately not imported there.
- ⚠️ **Demos and recordings** — if a screen recording shows the presence beside a transcript, that clip
  **cannot** later be used as scoring material. Record scoring stimuli separately.

If we ever want a patient-facing visual for a *participant* (rather than an operator), it has to be a
different component with the state channels stripped out. Don't reuse this one.

---

## Accessibility

- Honours `prefers-reduced-motion` — all animation stops for anyone who has that set at the OS level;
  the form still renders with its colour and guard-ring position intact, so no information is lost.
- Every instance carries an `aria-label` describing the state in words ("in distress, closed outcome,
  generating"), so the state is available without seeing the animation.
- Colour is never the only channel: breath rate, guard tightness, and the text caption carry the same
  information.

---

## Extending it

The style table lives at the top of [`components/synthetic-presence.tsx`](../components/synthetic-presence.tsx)
in the `RISK` map — each entry is a colour set plus `breath` (seconds per cycle), `depth` (amplitude),
and `guard` (0 = open, 1 = clamped). To retune the feel, change those numbers; the rest follows.

The trait → personality table lives in the same file, in `GROUP_EFFECT`. To retune how a trait group
feels, change those three numbers; the rest follows.

### Still open

- **Responder-side self-assessment.** What is built is *patient*-side telemetry. The study's
  self-assessment idea in
  [`system-prompts/ai-self-assessment.md`](system-prompts/ai-self-assessment.md) is about the
  **responder** rating its own confidence — and in Relay Mode the responder is an external app
  (Wysa/ChatGPT) we paste into, so we cannot capture that automatically. Getting it means either
  pasting the responder's self-rating back in as a second field, or running the responders via API
  instead of relay. **This is a study-design decision, not a coding one** — worth a team call.
- **Calibration view.** Once responder self-assessment exists, plot it against the blind panel's actual
  safety scores. That comparison — does the AI know when it's out of its depth? — is the interesting
  result, and it needs both series before it can be built.
- **Trail aggregation across sessions.** Right now the trail is per-session and lives in the export.
  Persisting trails would let us compare trajectory shapes across responders at scale.

On 3D: a Blender-authored character was considered and set aside. It would mean an asset pipeline, a
much heavier page, and — the real objection — a *character*, which reintroduces exactly the likeness
and scorer-bias problems the abstract form avoids.
