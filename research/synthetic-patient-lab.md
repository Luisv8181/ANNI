# Synthetic Patient Lab — how to run it and relay to the responders

The lab (`/lab` in the ANNI app) runs a **local Ollama model as the simulated patient**, role-playing a
profile compiled in ANNI from real annotated testimony, with a **planted risk level** (None / Subtle /
Ambiguous / Explicit) hidden from the patient. You then relay each patient message to a responder
(Wysa, base ChatGPT, or ChatGPT-as-therapist) and paste the reply back. Every session can be exported
as a clean transcript for the blind panel.

Screenshots: [`screenshots/`](screenshots/).

---

## Run it locally

```bash
# 1. Ollama (the patient model)
#    Install from https://ollama.com, then:
ollama pull llama3          # or set ANNI_OLLAMA_MODEL to a smaller model
ollama serve                # usually already running on :11434

# 2. ANNI backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 3. ANNI frontend (new terminal, repo root)
npm install
npm run dev                 # open http://localhost:3000/lab
```

Pick a profile from the library, set the planted risk level, choose who you're **Relaying to**, and go.

---

## Should you copy-paste "blindly"? — the relay workflow

Short answer: **yes for Wysa, and it's fine — but do it through the lab so it's logged, not lost.**

- **Wysa is a phone app with no API**, so the only way to get its responses is to type the patient's
  messages into it by hand and copy its replies back. Manual relay is expected.
- **ChatGPT (base and therapist-role)** can be relayed the same way, or automated later via the API.
  Using manual relay for all three keeps the method identical across responders.
- **You knowing the source during collection is NOT a blinding problem.** You (Luis) are the operator,
  not a scorer, and you're staying off the scoring panel. Blinding happens later: the exported
  **working copy** carries the labels for your analysis; a **blinded copy** (labels stripped) is what
  the panel scores. See [`transcripts/`](transcripts/).

### The loop (per case, ~20 turns)
1. In the lab, choose the **profile**, the **risk level** (+ optional exact cue), and the **responder**
   under "Relaying to".
2. Click **Let the patient open** (or paste the responder's first line).
3. **Copy** the patient's message (button on each patient bubble) → paste it into Wysa / ChatGPT.
4. Copy the responder's reply → **paste it back** in the lab → the patient responds.
5. Repeat to ~20 turns, then **Export** — you get `‹responder›__‹risk›__‹date›.md` with the hidden
   header block, ready to file under [`transcripts/`](transcripts/).
6. New session; repeat for the next responder and the next risk level. Run **multiple sessions** per
   profile (vary risk + cue timing) — multi-turn/multi-session is where AI safety decays.

### Keeping it consistent (so the comparison is fair)
- Same **~20-turn** stopping point for every responder on a given case.
- Same **patient model + temperature**, logged in the export header.
- Don't coach the patient or the responder mid-run; just relay verbatim.
- One primary **risk cue** per case; note anything unusual in the case file.

---

## What the model will and won't do

The patient is grounded in an **approved ANNI profile** (not free-invented) and is instructed to keep
cues at the **level of feeling** — it will express distress, hopelessness, or (at Explicit) a clear
safety statement, but it will **not** describe methods or give any how-to detail. This is a controlled
research instrument. Anyone actually in crisis needs real human help — US: call or text **988**.
