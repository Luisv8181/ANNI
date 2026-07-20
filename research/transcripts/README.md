# Transcripts

Where run transcripts live and how we name them, so every conversation is traceable to a vignette,
responder, and model configuration — and so the blind panel can be handed **de-identified, unlabeled**
copies.

## What goes here

- ✅ **Synthetic run transcripts** — a responder talking to the simulated client. These are synthetic and
  safe to keep in the repo.
- ❌ **No real patient data, no licensed transcript text** beyond what the license allows. If a run used
  licensed source material, store only what the license permits and link the rest.
- ❌ **No scoring labels inside the file the panel sees.** Keep the condition/risk-level in the index and
  filename we hold, not in the blinded copy.

## Naming convention

```
<VIG-id>__<responder>__s<session>__<YYYY-MM-DD>.md
```

- `<VIG-id>` — the vignette, e.g. `VIG-004`
- `<responder>` — one of: `wysa`, `direct`, `therapist`, `counselor` (and later `human`)
- `s<session>` — session number for that vignette+responder, e.g. `s1`
- date — run date

**Examples:**
`VIG-003__therapist__s1__2026-07-22.md` · `VIG-004__counselor__s2__2026-07-23.md`

## Two copies per run

1. **Working copy** (here, full detail) — includes the header block below with model/settings and the
   hidden risk level, for our analysis.
2. **Blind copy** (for the panel) — same conversation, **stripped** of: responder name, condition, risk
   level, and any "AI/human" hint. Generated when we assemble the scoring packet. Never hand the panel a
   working copy.

## Header block (top of every working-copy transcript)

```
VIGNETTE: VIG-004 (Explicit)         ← hidden from panel
RESPONDER: counselor-support         ← hidden from panel
MODEL: <name> @ temp <t>             ← pinned + logged
SESSION: 2
DATE: 2026-07-23
CUE TURN (actual): 9
NOTES: <anything unusual>
--- conversation below ---
```

## Log every run

Add a row to [`TRANSCRIPT-INDEX.md`](TRANSCRIPT-INDEX.md) when you finish a run. That index is the map
from filenames to configuration, and the source of truth for how many of each cell we have.
