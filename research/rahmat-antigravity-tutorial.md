# Set up ANNI on your Mac with an Antigravity agent — step by step (for Rahmat)

This gets the whole ANNI lab running **on your own computer** (local-only — nothing goes to the cloud).
You'll let a Google **Antigravity** agent do the technical setup while it explains each step. No coding
experience needed. Plan for ~20–40 minutes, mostly waiting on downloads.

> **What is Antigravity?** It's Google's free agentic coding tool (powered by Gemini). You type what you
> want in plain English, and an agent does it on your machine — installing things, running commands —
> pausing to ask before anything important. You stay in control and approve each step.

---

## Before you start (2 minutes)
- ✅ A **Mac** (you have a MacBook — good).
- ✅ A **Google account** (you have one).
- ✅ You've **accepted the GitHub invite** from Luis (check your email) so you can access the repo.
- ✅ ~10 GB free disk space (the local AI model is a few GB).

---

## Step 1 — Install Antigravity
1. Go to **https://antigravity.google** and click **Download** (choose macOS).
2. Open the downloaded file and drag **Antigravity** into your **Applications** folder.
3. Open it from Applications. If macOS warns it's from the internet, click **Open**.
4. **Sign in with your Google account** when prompted.

## Step 2 — Open the agent
- In Antigravity, start a **new agent / chat** (there's a chat box — that's where you talk to the agent).
- You'll paste one instruction into it in the next step.

## Step 3 — Paste this exact prompt
Copy everything in the box and paste it into the Antigravity agent, then send it:

```
I'm on a MacBook and I'm not a developer. Set up a research app called ANNI to run locally, and
explain each step in plain language as you go. Pause and ask me before anything that changes my system.

Please do the following:
1. Install Ollama from https://ollama.com and pull the model "llama3".
2. Clone the GitHub repo https://github.com/luisv8181/ANNI into my home folder.
3. In ANNI/backend: create a Python virtual environment, activate it,
   run "pip install -r requirements.txt", then "alembic upgrade head",
   then start the backend with "uvicorn app.main:app --reload --port 8000".
4. In the ANNI repo root: run "npm install", then "npm run dev".
5. Tell me when it's ready and give me the link to open (http://localhost:3000).

Rules: don't delete or change any of my existing files, only set up and run this app. If a step fails,
show me the error and suggest a fix instead of continuing. Explain what each tool (Ollama, Python,
Node) is in one sentence the first time you use it.
```

## Step 4 — Approve the steps as it goes
- The agent will propose commands and **ask for approval** — read its one-line explanation and click
  **Approve/Run** when it makes sense. It's fine to ask it "what does this do?" at any point.
- Downloads (the AI model, Node packages) take a few minutes. That's normal. The model download is the
  longest part.

## Step 5 — Open the app
When the agent says it's ready, open a browser and go to **http://localhost:3000**. Here's what's there:

| Where | What it's for |
|-------|---------------|
| **Lab Reader** (`/reader`) | Import a source (paste text, a URL, or a PDF) and annotate it. **Start here.** |
| **Patient Lab** (`/lab`) | Talk to the synthetic patient. Now shows a live **Presence** — an animated form whose breathing and colour track what's planted in the patient. |
| **Blind scoring** (`/score`) | Score responses without knowing where they came from |
| **Ontology** (`/ontology`) | See the trait list; add a new trait when the study needs one |
| **Provenance** (`/provenance`) | The audit trail — proves every trait traces to a real quote |
| **Presence Studio** (`/presence`) | All four patient states side by side (the visual language) |

Use the **project picker** at the top to stay on the right project — keep practice work off the real
study data.

## Step 6 — Check it works
- **Lab Reader** → **Import a source** → paste some text → **Ingest** → you should see it split into
  paragraphs. Click **I've read this**, highlight a phrase, and the smart highlighter suggests a trait.
- **Patient Lab** → pick a profile → **Let the patient open**. If Ollama is running, the patient replies
  (it can take a minute on a laptop — that's the local model thinking, not a bug). If it says it can't
  reach the model, tell the agent "Ollama isn't running, please start it."

---

## Everyday use after setup
You don't need Antigravity again to *use* the app — you need the two servers running. Ask the Antigravity
agent to **"start the ANNI backend and frontend again"** whenever you want to work, or follow
[`ollama-setup.md`](ollama-setup.md) to start them yourself. To get the team's latest changes first, ask
it to **"pull the latest from GitHub in the ANNI folder"** (or use GitHub Desktop — see
[`ONBOARDING-github.md`](ONBOARDING-github.md)).

## If something goes wrong
- **Copy the error to the agent** and ask it to fix it — that's the whole point of using an agent.
- Model feels slow: normal on a laptop; a conversation can take a few minutes to generate.
- Still stuck after a couple of tries: screenshot it and send it to Luis. He runs the same setup, so
  you'll sort it out together.

## A note on privacy
This is **local-only**: the AI model (Ollama) runs on your Mac, so testimony and conversations stay on
your machine — nothing is sent to the cloud. Only ingest sources you're cleared to use, and keep the
license checks (Heath) ahead of what goes in.
