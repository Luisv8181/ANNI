# Ollama Setup — running the synthetic patient locally

Ollama runs AI models **on your own computer** (not the cloud), which keeps data private and lets the
synthetic patient run offline. On a MacBook it works but can be a few minutes slower than ChatGPT —
that's expected.

## Option A — the quick way (recommended for Rahmat)
1. Download Ollama for macOS: **https://ollama.com/download** → open the `.dmg` → drag to Applications →
   launch it (a llama icon appears in the menu bar).
2. Open **Terminal** (Cmd+Space → type "Terminal") and pull a model:
   ```bash
   ollama pull llama3
   ```
   (First pull downloads a few GB — give it time. `llama3` is the ANNI default.)
3. Test it:
   ```bash
   ollama run llama3 "Say hello in one short sentence."
   ```
   If it replies, you're set.

## Option B — let Antigravity set it up for you
Since you have a Google account, you have access to Google's **Antigravity** tool. Open it and paste the
prompt below; it will download and configure everything (Ollama + the ANNI lab) for you, then open the
lab. Use this if the terminal steps feel like a lot. Read what it proposes before approving each step.

> **Paste this into Antigravity:**
>
> ```
> I'm on a MacBook and want to run a research app locally. Please set this up step by step, explaining
> each step and asking before anything destructive:
>
> 1. Install Ollama (https://ollama.com) and pull the model "llama3".
> 2. Clone the GitHub repo https://github.com/luisv8181/ANNI into my home folder.
> 3. Backend: in ANNI/backend, create a Python venv, activate it, `pip install -r requirements.txt`,
>    then `alembic upgrade head`, then run `uvicorn app.main:app --reload --port 8000`.
> 4. Frontend: in the ANNI repo root, run `npm install` then `npm run dev`.
> 5. Open http://localhost:3000/lab in my browser.
>
> If a step fails, show me the error and suggest a fix instead of continuing. Don't change any files in
> the repo — only run it.
> ```

If anything errors, copy the message to Luis. Nothing here touches your files or sends data anywhere —
it just runs the app locally.

## Running the ANNI Synthetic Patient Lab
With Ollama running and the repo cloned (see [`ONBOARDING-github.md`](ONBOARDING-github.md)):

```bash
# from the repo root
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# new terminal, repo root:
npm install
npm run dev            # open http://localhost:3000  →  "Patient Lab"
```

- The **Patient Lab** (`/lab`) lets you pick a profile, set the hidden risk level, and talk to the
  synthetic patient (Ollama). If Ollama isn't running, the lab shows a clear message telling you to
  start it — nothing breaks.
- **Relay Mode** is how we run the blind study: copy each patient message into Wysa / ChatGPT, copy the
  reply back, and export the transcript.

## Config (defaults are fine)
The backend reads these (only change if needed), in `backend/.env`:
```
ANNI_OLLAMA_URL=http://localhost:11434
ANNI_OLLAMA_MODEL=llama3
```

## Notes
- **Luis will primarily run the simulations** (and screen-record), since his machine is set up — but
  it's worth having this on your MacBook to experiment.
- Bigger models are smarter but slower; `llama3` is a good balance to start. We can try others later.
