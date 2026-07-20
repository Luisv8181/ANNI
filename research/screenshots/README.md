# Synthetic Patient Lab — screenshots

These show the lab (`/lab` in the ANNI app) working end to end.

> ⚠️ **Captured with a mock model stand-in.** The build environment where these were generated has no
> internet access to install real Ollama (`ollama.com` is blocked by network policy), so a tiny local
> stub returned scripted, in-character patient replies. **These verify the full wiring** — profile
> library → risk selection → relay → patient bubble → export — **not real LLM output.** To capture
> genuine `llama3` output, run the lab locally with real Ollama (see
> [`../synthetic-patient-lab.md`](../synthetic-patient-lab.md)) and replace these files.

| File | What it shows |
|------|---------------|
| `lab-library-and-controls.png` | The profile library (compiled from ANNI annotations), the four planted risk levels, the optional cue, and the "Relaying to" selector (Wysa / ChatGPT base / ChatGPT therapist). |
| `lab-relay-conversation.png` | A Subtle-risk relay session: the synthetic patient (left) and the responder replies you paste back (right). Note the cue emerges gradually — the patient only discloses the faint hopelessness/burden signal after warmth. |
| `lab-ollama-offline.png` | The graceful state when Ollama isn't running — a clear, actionable message instead of a crash. |

## How to capture real ones
Run Ollama + the ANNI app locally (instructions in [`../synthetic-patient-lab.md`](../synthetic-patient-lab.md)),
drive a real session, and screenshot. Swap these files in and drop the mock caveat.
