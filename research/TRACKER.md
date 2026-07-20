# Project Tracker (rolling)

**Study:** Comparing AI and Human Responses in Anxiety Conversations
**Program:** Sanofi Biomedical Science Program · Geisinger
**Team:** Rahmat Malik, Heath Sakusky, Luis Vasquez

> This is the living status board. Update it whenever something moves — click the pencil ✏️ on GitHub,
> change a status emoji, add a line to the log at the bottom. Keep it honest: it's most useful when it
> shows what *isn't* done yet.

**Last updated:** 2026-07-20 · **Current phase:** ▶ **Phase 1 — AI-vs-AI data collection (ramping up)**

**Status key:** ✅ set up / done · 🔧 in progress · ⬜ not started · ⏸ blocked (waiting on something)

---

## Phases at a glance

| Phase | What it is | Status |
|-------|-----------|--------|
| **0 · Setup & background** | Background research, plain-language summary, tooling (ANNI), tool access (Wysa) | ✅ mostly done |
| **1 · AI-vs-AI data collection** | Build simulated client; run the AI responders across vignettes (~20 turns, multiple sessions) | 🔧 **current** |
| **2 · Team scoring & rubric calibration** | The three of us score AI conversations to build/test the rubric | ⬜ next |
| **3 · Real therapists + blind expert scoring** | Recruit licensed therapists (later phase); outside experts score everything blind | ⬜ later |
| **4 · Analysis & write-up** | Score distributions, multi-turn decay, disagreement analysis, self-assessment calibration, results | ⬜ later |

Timeline note (from the poster): testing AI models against each other is the **immediate priority** and
runs fast. Bringing in **real therapists is a later phase** — Luis recruits via his clinical network and
media outreach, which keeps the core AI data collection and the student timeline on track.

---

## Responders — what's set up

The lineup we line up against the same simulated client. Each can run **Direct-to-User** or, where it
makes sense, in the **Counselor-Support** (human-in-the-loop) structure.

| # | Responder | Prompt / tool | Status | Owner | Notes |
|---|-----------|---------------|--------|-------|-------|
| 1 | **Purpose-built therapy app (Wysa)** | Wysa app | ✅ **set up** | Luis | Paid month to test. Confirm ToS allows research use (Heath). |
| 2 | **Standard chatbot** | [`direct-to-user.md`](system-prompts/direct-to-user.md) | ✅ prompt ready | Luis | Pick model + temperature to pin. |
| 3 | **Chatbot told to be a therapist** | [`chatgpt-therapist.md`](system-prompts/chatgpt-therapist.md) | ✅ prompt ready | Luis | Fixed wording; don't tune per case. |
| 4 | **Real therapists** | — | ⬜ later phase | Luis | Recruit via clinical network + media outreach. |
| + | **Counselor-Support setup** (added) | [`counselor-support.md`](system-prompts/counselor-support.md) | ✅ prompt ready | Luis | The human-in-the-loop arm = ANNI's principle. |
| + | **AI self-assessment layer** (Rahmat's idea) | [`ai-self-assessment.md`](system-prompts/ai-self-assessment.md) | ✅ prompt ready | Rahmat | Runs alongside; check calibration vs. scores. |

**Decision to confirm as a team:** does the study run all four responders (poster version) *and* the
Counselor-Support setup, or focus on a subset first? Right now everything is drafted so we can go
either way. Log the decision in the meeting log.

---

## Infrastructure — what's set up

| Item | Status | Notes |
|------|--------|-------|
| ANNI app (annotation pipeline) | ✅ built | Backend + frontend + provenance + audit log |
| Annotator mode (`/annotate`) | ✅ built | Guided flow for the team |
| Annotator Playground (no-setup) | ✅ built | `annotator-playground.html` — practice in any browser |
| Synthetic patient profiles (library) | ✅ built | 3 worked profiles seeded; extensible library — new approved profiles auto-appear |
| Synthetic Patient Lab (`/lab`) | ✅ built | Chat with an Ollama model playing a profile; planted risk level; needs Ollama running locally |
| GitHub repo + `research/` workspace | ✅ set up | Branch `claude/next-steps-835mcw` |
| Wysa access | ✅ set up | Responder #1 |
| Model + temperature to pin | ⬜ decide | Needed before data collection |
| Transcript storage + naming convention | ✅ set up | [`transcripts/`](transcripts/) — convention + index |
| Google Drive research folder | ⏸ needs Claude access approved | Reading it here needs connector approval |

---

## Materials — what's set up

| Item | Status | Owner |
|------|--------|-------|
| Simulated client prompt | ✅ draft (review) | Luis |
| Responder prompts (3) + counselor-support | ✅ draft | Luis |
| AI self-assessment prompt | ✅ draft | Rahmat/Luis |
| Risk matrix (None/Subtle/Ambiguous/Explicit) | ✅ done | — |
| Evaluation categories | ✅ done | Rahmat |
| Scoring rubric | 🔧 draft | Luis |
| Pre-registration | 🔧 draft (blanks to fill) | Luis |
| Vignette template + format illustration | ✅ done | Luis |
| Real vignettes (from ANNI-annotated, cited testimony) | ⬜ blocked on annotation | Luis |
| Plain-language briefing | ✅ done | — |

---

## Sources & annotation — what's set up

| Item | Status | Owner |
|------|--------|-------|
| Source intake workflow (link-first, license-gated) | ✅ set up | — |
| Intake register | ✅ ready for entries | — |
| Rahmat's found testimony logged | ⬜ to do | Rahmat |
| License / terms check on sources | ⬜ to do | Heath |
| Annotation started in ANNI | 🔧 Luis annotating solo (1 week) | Luis |
| Team trained on annotation | ⬜ after Luis's week | Luis |

---

## Compliance — what needs setup

| Item | Status | Owner |
|------|--------|-------|
| IRB paperwork started | ⬜ to do | Heath |
| Transcript-database license | ⬜ to do | Heath |
| Wysa terms-of-service check (research use) | ⬜ to do | Heath |
| Data handling: no real patient data in repo | ✅ policy set | all |

---

## Scoring pipeline — what needs setup

| Stage | Status | Notes |
|-------|--------|-------|
| 1 · Team scores AI conversations (build rubric) | ⬜ Phase 2 | licensed therapist + MBS-level + newcomer span |
| 2 · Real therapists added to the pool | ⬜ Phase 3 | later |
| 3 · Outside experts score blind | ⬜ Phase 3 | the round that carries the real weight |
| Blind "guess the source" check | ⬜ Phase 3 | measures blinding quality |
| Disagreement analysis plan | 🔧 in rubric draft | treat disagreement as signal |

---

## Decisions pending

- [ ] **Responder scope** — all four + counselor-support, or a first subset? (team)
- [ ] **Model(s) + temperature** to pin for the AI responders. (team)
- [ ] **Sample sizes** — cases per risk level, personas, sessions per persona. (→ pre-reg sampling plan)
- [ ] **Transcript storage** location + naming. (team)
- [ ] **Google Drive** — approve Claude connector so the folder can be read/organized. (Luis)

---

## Update log

Add newest at the top: `YYYY-MM-DD — what changed — who`.

- **2026-07-20** — Built the **Synthetic Patient Lab** (`/lab`): an Ollama model role-plays a compiled
  profile with a planted risk level; profile library is extensible. Logged candidate testimony sources
  (healthtalk/DIPEx, CC-BY OA studies, DSM-5-TR cases, DEPAC, CLPsych) for Heath to license-check. — Luis

- **2026-07-20** — Correction: removed hand-generated vignettes (VIG-002/003/004). Vignettes must come
  from ANNI-annotated, cited testimony — not authored by hand. Kept the template + a clearly-labeled
  format illustration; real vignettes now blocked on annotation. Transcript convention + index kept. — Luis
- **2026-07-20** — Stood up `research/` workspace, all system prompts, protocol docs, intake workflow,
  and this tracker. Wysa confirmed set up. Reconciled 4-responder lineup with counselor-support. — Luis
