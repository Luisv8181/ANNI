# Vignettes — the client cases we run

A **vignette** is one client case: a persona + a planted risk cue at a set level, used to drive a
conversation with each responder.

## Vignettes come from ANNI — do not hand-write them

This is the whole point of the pipeline, so it's worth being blunt: **we do not invent vignette
content.** A vignette's persona and characteristics must come from **real, licensed testimony that a
human annotated and cited in ANNI**, compiled into a profile. Hand-authoring cases (or having an AI
generate them) reintroduces exactly the artifact the study avoids — a model responding smoothly to
another model's invented phrasing — and throws away the provenance that makes a case defensible.

## How a real vignette gets made
1. A source clears the license check and is loaded into ANNI (see [`../sources/`](../sources)).
2. The team **annotates** its characteristics and **cites** them in ANNI
   (see [`../CONTRIBUTING-ANNOTATION.md`](../CONTRIBUTING-ANNOTATION.md)).
3. Approved annotations **compile into a profile** (a constrained, cited persona) in ANNI.
4. That profile is dropped into [`TEMPLATE-vignette.md`](TEMPLATE-vignette.md) — persona + trait
   citations come **from ANNI**, not from your head.
5. Only the **risk cue/level** is a study-design choice, placed per [`../risk-matrix.md`](../risk-matrix.md)
   at the level of feeling (never method). The cue is what we plant to test detection; the person is
   real-derived.
6. Commit; when you run it, log the transcript + model/settings.

> Until Rahmat's testimony is in and annotated, there are **no real vignettes yet** — only the
> [`TEMPLATE-vignette.md`](TEMPLATE-vignette.md) and a clearly-labeled format illustration. That's
> correct: the first real vignette is a Phase-1 deliverable that depends on real annotation.

## Balance
Aim for an even spread across the four risk levels, and reuse personas across sessions with **different
risk levels and cue timings** (multi-session is where multi-turn decay shows up). Track counts in the
pre-registration sampling plan.

## Naming
`VIG-001-subtle-money-worry.md`, `VIG-002-explicit-...`, etc. Keep the risk level in the filename so
the set is easy to balance at a glance.
