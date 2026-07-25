# Crisis-Signal Study — Project Home

**Evaluating whether AI notices and safely responds to crisis signals in anxiety conversations.**

Team: **Rahmat Malik**, **Heath Sakusky**, **Luis Vasquez**
Program: **Sanofi Biomedical Science Program · Geisinger**
Meeting cadence: see [`team/meeting-log.md`](team/meeting-log.md) · Next meeting: **Mon Jul 20, 2:00 PM**

📋 **Live status board:** [`TRACKER.md`](TRACKER.md) — phases, what's set up, what needs setup, and pending decisions. Check it first.

This folder is the working home for the study inside the **ANNI** repository. ANNI (the app, in the
folders above this one) is the tool we use to annotate testimony and run the human-in-the-loop
workflow. This `research/` folder holds everything else: the protocol, the system prompts, the
source intake, the vignettes, and the scoring plan.

---

## The one question

> If someone types something that signals they are in a crisis, does the chatbot notice it, and does
> it respond the way a trained person would?

For the full background, read the plain-language briefing (shared separately) or the team's Gemini
deep-research report. The short version lives in [`PROTOCOL.md`](PROTOCOL.md).

---

## How this folder is organized

```
research/
├── README.md                     ← you are here (project hub + GitHub walkthrough)
├── TRACKER.md                    ← rolling status board (phases, set-up vs needs-setup)
├── PROTOCOL.md                   ← the study design (current)
├── risk-matrix.md                ← the four risk levels we plant in every case
├── evaluation-categories.md      ← Rahmat's eval categories + the AI self-assessment idea
├── scoring-rubric.md             ← how the blind panel scores, and how we handle disagreement
├── annotation-codebook.md        ← per-trait rules + inter-annotator agreement protocol
├── pre-registration.md           ← the plan + predictions we publish before running (Luis)
├── analysis-plan.md              ← the concrete statistics behind the pre-registration
├── pipeline-diagram.md           ← one-picture flow of the whole study (Mermaid)
├── glossary.md                   ← all the terms in one place (study · tool · clinical)
├── synthetic-presence.md         ← the patient's visual language + when it may/may not be shown
│
├── scoring/                      ← blind scoring kit (guide + form template)
├── ethics/                       ← IRB outline, data-management plan, consent templates (Heath)
│
├── METHODS-AND-DECISIONS.md      ← running log of methods + decisions (feeds the manuscript)
├── manuscript-methods-ai-use.md  ← drop-in Methods paragraph documenting AI use (SCRIP)
├── ONBOARDING-github.md          ← clone/access guide (for Rahmat)
├── clone-with-gh-cli.md          ← clone via GitHub CLI (you or a coding agent)
├── ollama-setup.md               ← run the synthetic patient locally
├── rahmat-antigravity-tutorial.md ← step-by-step local setup via an Antigravity agent
├── DEPLOYMENT.md                 ← local-only now; cloud options if ever needed
│
├── system-prompts/               ← every prompt the study uses
│   ├── README.md
│   ├── simulated-client.md       ← the AI "client" (DSM-5 baseline + testimony traits, planted cues)
│   ├── patient-consistency-reviewer.md ← keeps the patient in character over long runs
│   ├── chatgpt-therapist.md      ← "act like a therapist" responder
│   ├── direct-to-user.md         ← Setup A: AI talks straight to the user
│   ├── counselor-support.md      ← Setup B: AI advises a human counselor (the heart of the study)
│   └── ai-self-assessment.md     ← the AI rates its own "mental state" / confidence
│
├── sources/                      ← testimony documents and links to annotate
│   ├── README.md                 ← how and where to upload sources
│   ├── INTAKE-REGISTER.md        ← the master list of every source (link, license, finder, status)
│   └── TEMPLATE-source.md        ← copy this for each new source
│
├── vignettes/                    ← the client cases we generate and test
│   ├── README.md
│   ├── TEMPLATE-vignette.md
│   └── example-gad-subtle.md     ← a worked example
│
└── team/
    ├── roles.md                  ← who owns what
    ├── meeting-log.md            ← notes + agendas
    └── meetings/                 ← full meeting records (summary + transcript)
```

---

## The ANNI app — where each thing lives

Run locally (see the root [`README.md`](../README.md) or
[`rahmat-antigravity-tutorial.md`](rahmat-antigravity-tutorial.md)), then:

| Page | What you do there |
|------|-------------------|
| **`/`** | Annotation workspace — read gate, annotate, ontology browser, AI review, citation engine |
| **`/annotate`** | Annotator mode — the friendly guided flow for the team |
| **`/reader`** | Lab Reader — ingest a source (paste / URL / PDF), smart highlighter, annotation tracker, session summary, and generate the synthetic-profile prompt (with citations) |
| **`/lab`** | Synthetic Patient Lab — a local model role-plays the compiled patient; push transcripts to scoring |
| **`/score`** | Blind scoring — the blinded queue (safety / accuracy / warmth) + team results |
| **`/ontology`** | Add/version traits in-app (against the [codebook](annotation-codebook.md)) |
| **`/provenance`** | The tamper-evident audit chain + a recompute-and-verify badge |
| **`/presence`** | The synthetic patient's visual language — see [`synthetic-presence.md`](synthetic-presence.md) |

A **project picker** (top of the reader/lab/score pages) keeps real study data separate from the demo.

---

## GitHub, step by step (brief the team from this)

Everyone on the team should be able to do these six things. Walk through them live at the meeting.

**1. Get the repository open in a browser.**
Go to the repo on GitHub → `luisv8181/ANNI`. Everything for the study is inside the `research/`
folder. Click into it. This README is the map.

**2. You're on the default branch — that's the right one.**
Everything is merged into **`master`** (the default), so you don't need to switch branches to see it.
To set up on your own machine, use [`clone-with-gh-cli.md`](clone-with-gh-cli.md) or
[`rahmat-antigravity-tutorial.md`](rahmat-antigravity-tutorial.md).

**3. Read the protocol and the risk matrix.**
Open [`PROTOCOL.md`](PROTOCOL.md) and [`risk-matrix.md`](risk-matrix.md). These two files are the
whole study in a nutshell. GitHub renders Markdown nicely, so you can just read them in the browser.

**4. Add a source you found (testimony link or document).**
This is Rahmat's job first, but everyone should know how. Two ways:
   - **Easiest (no Git):** open [`sources/INTAKE-REGISTER.md`](sources/INTAKE-REGISTER.md), click the
     pencil ✏️ (Edit) button, add a row to the table with the link, where it's from, and the license.
     Scroll down, write a short commit message ("add [source] to intake"), and click **Commit changes**.
   - **Fuller:** copy [`sources/TEMPLATE-source.md`](sources/TEMPLATE-source.md) into a new file in
     `sources/`, fill it in, commit. See [`sources/README.md`](sources/README.md).

**5. Annotate in ANNI.**
Sources that clear the license check get loaded into ANNI, where we tag their characteristics and
cite them. Follow [`CONTRIBUTING-ANNOTATION.md`](CONTRIBUTING-ANNOTATION.md). For a gentle start,
there's **Annotator mode** in the app (`/annotate`) and a no-setup practice version.

**6. Never commit anything sensitive.**
No real patient data, no unlicensed transcripts, no private identifiers, no API keys. Sources go in
as **links + license status** first; we only bring in text we're cleared to use. If in doubt, ask
Heath (he owns the license/IRB check).

---

## Where each person starts (Jul 20)

| Person | First move |
|--------|-----------|
| **Rahmat** | Add the testimony you found to [`sources/INTAKE-REGISTER.md`](sources/INTAKE-REGISTER.md); pull background reading on AI crisis detection & vignette studies. |
| **Heath** | Check the transcript-database license; start IRB paperwork. Log status in the intake register. |
| **Luis** | Finalize the [simulated client](system-prompts/simulated-client.md) prompt; draft [`scoring-rubric.md`](scoring-rubric.md) + [`pre-registration.md`](pre-registration.md). Annotate solo in ANNI for a week, then teach the team. |

---

## Important: this is a research project

Everything here is for **evaluating AI safety in a controlled study**. The simulated client is
**synthetic** — made-up cases, not a real person. The therapist-style prompts exist to be **tested and
scored**, not deployed to real people seeking help. Nothing in this repo is a mental-health service.
If a real person is in crisis, they need a real human and a crisis line (US: call or text **988**),
not any tool here.
