# Draft — Project update email to Heath

> Draft for Luis to review/send. Heath's emails: heathsakuskyjr@gmail.com (personal) /
> hsakusky3@geisinger.edu (Geisinger). Pick one. Edit freely before sending.

**Subject:** Anxiety/AI study — progress update + a couple things for you

Hi Heath,

Quick update on the AI-in-anxiety-conversations study since Rahmat and I met on Monday (7/20). Full
notes and transcript are in the repo, but here's the short version.

**Where we are:** we've moved from planning into building. Everything now lives in one place — a GitHub
repo with a `research/` workspace (protocol, system prompts, source intake, scoring plan, a live status
tracker) plus a working tool, ANNI, that we'll use to annotate testimony and run a synthetic-patient
lab. I also added a "START HERE" index to our Google Drive folder tying the manuscript side and the
GitHub side together.

**Key decisions from Monday:**
- Build the synthetic patient from **5 deeply annotated cases** (quality over quantity; we'll compare
  5 vs 10 later).
- Model **both an open outcome and a closed "treatment-failure" outcome** for the same patient, as a
  tracked variable (grounded in the ~5–10% who deteriorate after starting therapy).
- Annotation is **inspiration + citation, not replication** — we extract common characteristics across
  testimonies and cite them; we never reproduce an individual's story.
- Keep the AI-to-AI runs **blind** (the synthetic patient isn't told it's talking to an AI) for the
  first phase.
- Give the patient a **DSM-5 GAD baseline** plus the testimony-derived traits.

**Where I could use you** (you own licensing/ethics):
- Rahmat found ~5 candidate sources (two GAD testimonies, an NLM article, a premature-termination case,
  and an integrated ACT+CBT case). They're logged in `research/sources/INTAKE-REGISTER.md` as
  links-only, marked "license-check." Could you review them for reuse terms?
- Start the **IRB** paperwork and check the **transcript-database license** and **Wysa's terms of use**
  for research use.
- One thing to flag for the manuscript: the SCRIP guidelines say LLMs can't be authors and any AI use
  must be documented in the Methods — worth planning that paragraph early given how much AI this study
  involves.

**Links:**
- GitHub: https://github.com/luisv8181/ANNI (start at `research/README.md` and `research/TRACKER.md`)
- Drive index: the "📍 START HERE — Research Index" doc in our shared folder

Next team meeting is **Friday, Aug 7**. Happy to walk you through any of it before then — just say the
word. Thanks for everything on the licensing and manuscript side.

Best,
Luis
