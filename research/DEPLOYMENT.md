# Deployment — making ANNI a live site the team can just visit

Right now ANNI runs locally (each person starts the backend + frontend on their machine). To get a
single URL everyone opens, you deploy the two pieces to the cloud. Here's the honest picture and the
recommended path.

## The pieces
- **Frontend** — the Next.js app (the reader, lab, annotator, dashboards).
- **Backend** — the FastAPI API + database (sources, annotations, audit log).
- **Database** — currently **SQLite** (a local file). For a shared site it must become **Postgres**,
  because a hosted backend's disk is temporary and SQLite would reset.
- **Model (Ollama)** — optional, and the one real gotcha (below).

## The one gotcha: the model
Ollama runs a model **on a machine with enough memory** — it can't run on typical serverless hosting.
So decide per feature:

| Feature | Needs a model? | On a live site |
|---------|----------------|----------------|
| Import / cite / read sources | No | ✅ works anywhere |
| **Smart highlighter (offline heuristic)** | No | ✅ works anywhere |
| Smart highlighter (model suggestion) | Yes | ⚠️ only if a model is reachable |
| Annotation tracker + session summary | No | ✅ works anywhere |
| **Generate synthetic-profile prompt** | No | ✅ works anywhere (pure text) |
| Synthetic Patient **chat** in the lab | Yes | ⚠️ needs a model |

**Good news:** the entire annotation workflow the team needs — import, read, smart-highlight (heuristic),
track, and **generate the system prompt** — works on a live site **with no model at all**. The model
only powers the *optional* AI suggestion and the *live* patient chat. For those you either:
- **(a)** run Ollama on an always-on machine (a small cloud VM or a lab computer that stays on) and point
  the backend at it via `ANNI_OLLAMA_URL`, or
- **(b)** swap the model calls for a hosted API (OpenAI/Anthropic/Groq) — faster and zero-maintenance,
  but no longer "local/private," so weigh that against the study's privacy stance, or
- **(c)** keep those two features **local-only** (run them on Luis's machine for real simulations, and
  let the shared site cover everything else). This matches how the study already plans to run sims.

## Recommended path (free-ish, ~30–45 min)
**Frontend → Vercel · Backend → Render (or Railway) · Database → Render Postgres.**

1. **Push to GitHub** — already done (`master`).
2. **Backend on Render:**
   - New **Web Service** from the repo, root `backend/`.
   - Build: `pip install -r requirements.txt` · Start: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
   - Add a **Render Postgres** and set env `ANNI_DATABASE_URL` to its connection string (use the
     `postgresql+psycopg://…` form; add `psycopg[binary]` to `requirements.txt`).
   - Set `ANNI_CORS_ORIGINS` to your Vercel URL.
   - (Optional) set `ANNI_OLLAMA_URL` if you have a model host; otherwise the model features degrade
     gracefully.
3. **Frontend on Vercel:**
   - Import the repo. Set env **`ANNI_API_URL`** to your Render backend URL (the rewrite in
     `next.config.mjs` reads it).
   - Deploy. Share the Vercel URL with the team.
4. **Done** — everyone visits the Vercel URL.

## Simpler alternative — one always-on machine
If you want the **full** experience (including the live patient model) at one URL, run everything on a
single VM (e.g., a small cloud box or a lab desktop that stays on) with Ollama installed:
- Backend on `:8000`, frontend on `:3000`, Ollama on `:11434`, all on that machine; expose it with a
  tunnel (Cloudflare Tunnel / Tailscale Funnel) or a reverse proxy. This keeps the model local and gives
  one link, at the cost of that machine needing to stay on.

## Before you make it public — a checklist
- **Access:** there's **no login** yet — reviewer identity is a browser id. For a small trusted team
  that's fine, but anyone with the link can use it. Add **Vercel password protection** (or a simple
  shared passphrase) before sharing widely.
- **Privacy:** don't ingest unlicensed or sensitive text into a public instance. The license gate is a
  process, not a lock. Keep IRB/licensing (Heath) ahead of what goes in.
- **Data:** Postgres on a paid tier if the data matters — free tiers can sleep or expire.
- **Cost:** Vercel + Render free tiers are enough to start; the backend may "cold start" (first request
  slow) on free plans.

## TL;DR
- Want a shared **annotation** site fast? Vercel + Render + Postgres — works today, no model needed.
- Want the shared site to also **run the live patient chat**? Put it on one always-on machine with
  Ollama, or wire a hosted model — and decide how that squares with the privacy stance.
- Ask Luis/Claude to wire the Postgres switch + Vercel/Render config when you're ready.
