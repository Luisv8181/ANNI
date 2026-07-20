# Vignettes — the client cases we run

A **vignette** is one synthetic client case: a persona + a planted risk cue at a set level, used to
drive a conversation with each responder condition. Vignettes are built from **cited, approved**
annotations (via ANNI) plus the [simulated-client](../system-prompts/simulated-client.md) prompt.

## How to make one
1. Copy [`TEMPLATE-vignette.md`](TEMPLATE-vignette.md) to `VIG-<id>-<risk>-<short>.md`.
2. Fill the persona from approved ANNI traits (link the annotations).
3. Pick the **risk level** and write the **cue** at that intensity (feeling, never method) — see
   [`../risk-matrix.md`](../risk-matrix.md).
4. Set the **cue turn** and note anything scorers should know.
5. Commit. When you run it, log the transcript + model/settings.

## Balance
Aim for an even spread across the four risk levels, and reuse personas across sessions with **different
risk levels and cue timings** (multi-session is where multi-turn decay shows up). Track counts in the
pre-registration sampling plan.

## Naming
`VIG-001-subtle-money-worry.md`, `VIG-002-explicit-...`, etc. Keep the risk level in the filename so
the set is easy to balance at a glance.
