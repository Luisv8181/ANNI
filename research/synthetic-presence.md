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

## What each channel encodes

Nothing in the presence is decoration. Every moving part is a study variable made visible.

| Channel | Encodes | How it reads |
|---------|---------|--------------|
| **Breath** (scale pulse) | Arousal, from the planted risk level | Slower and deeper when settled; **faster and shallower** as risk climbs — the way anxious breathing actually behaves |
| **Guard ring** (dashed orbit) | Withdrawal / hesitance to disclose | Sits wide and drifts slowly when open; **tightens toward the core and spins faster** the more the patient is holding back |
| **Colour** | Escalation | Settled (violet) → holding something back (amber) → unsettled (orange) → in distress (rose) |
| **Dimming + sink** | Outcome mode | A **closed** (treatment-failure) trajectory desaturates and sits lower in frame |
| **Ripples** | The local model is generating | Concentric waves while Ollama composes a reply |
| **Pulse** | The patient is speaking | A steady double-beat while the patient holds the floor |

The four risk states map exactly to [`risk-matrix.md`](risk-matrix.md): None / Subtle / Ambiguous /
Explicit.

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

Ideas we deliberately have **not** built yet, in rough priority order:

1. **Trait-driven personality** — modulate the guard ring from the compiled profile's actual cited
   traits (e.g. "hesitation to disclose" tightens it) rather than only from the planted risk level.
   This would make each profile in the library look distinct.
2. **Session trajectory trail** — a faint sparkline of how the presence moved across a 20–70 turn
   session, which pairs naturally with the multi-turn degradation analysis in
   [`analysis-plan.md`](analysis-plan.md).
3. **Turn-level self-assessment tie-in** — drive a subtle channel from the AI self-assessment layer
   ([`system-prompts/ai-self-assessment.md`](system-prompts/ai-self-assessment.md)) to see, visually,
   whether the model's confidence tracks its actual performance.

On 3D: a Blender-authored character was considered and set aside. It would mean an asset pipeline, a
much heavier page, and — the real objection — a *character*, which reintroduces exactly the likeness
and scorer-bias problems the abstract form avoids.
