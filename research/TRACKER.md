# Project Tracker (rolling)

**Study:** Comparing AI and Human Responses in Anxiety Conversations
**Program:** Sanofi Biomedical Science Program · Geisinger
**Team:** Rahmat Malik, Heath Sakusky, Luis Vasquez

> This is the living status board. Update it whenever something moves — click the pencil ✏️ on GitHub,
> change a status emoji, add a line to the log at the bottom. Keep it honest: it's most useful when it
> shows what *isn't* done yet.

**Last updated:** 2026-07-20 (post-meeting) · **Current phase:** ▶ **Phase 1 — AI-vs-AI data collection (ramping up)** · **Next meeting:** Fri Aug 7

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
| Synthetic Patient Lab (`/lab`) | ✅ built | Ollama plays the patient; planted risk; **Relay Mode** to Wysa/ChatGPT + transcript export. Run locally: [`synthetic-patient-lab.md`](synthetic-patient-lab.md) · [screenshots](screenshots/) |
| Real Ollama run (live model output) | ⬜ on clone | Sandbox can't reach ollama.com; Luis runs it after cloning locally |
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

## Decided (Jul 20)

- [x] **Case quantity** — 5 deeply annotated cases to start; compare 5 vs 10 later.
- [x] **Outcome modeling** — open + closed (treatment-failure) paths, tracked.
- [x] **Annotation ethics** — inspiration + citation, not replication.
- [x] **Blinding** — patient not told it's talking to an AI (knowing-vs-not is a later phase).
- [x] **Patient baseline** — DSM-5 GAD + testimony traits.
- [x] **Turns** — start ~20, stress-test 70–75; multiple sessions per persona across stages.
- [x] **Transcript storage** — convention + index in `transcripts/`.
- [x] **Google Drive** — connector authorized; folder read + START HERE index added.

## Decisions still pending

- [ ] **Responder scope** — all four + counselor-support, or a first subset? (team)
- [ ] **Model(s) + temperature** to pin for the AI responders. (team)
- [ ] **DSM-5 baseline wording** — how to encode GAD criteria into the patient prompt. (Luis)

---

## Update log

Add newest at the top: `YYYY-MM-DD — what changed — who`.

- **2026-07-21** — Connected the **lab → scoring queue**: a "To scoring" button in the Patient Lab turns
  a conversation into blind scoring items (one per responder message; condition/risk/source saved as the
  hidden key). `POST /scoring-items/from-conversation`. The full pipeline now flows end to end. — Luis
- **2026-07-21** — Built the **in-app blind scoring view** (`/score`): blinded queue, safety/accuracy/
  warmth + perceived-risk + human-vs-AI guess, per-scorer progress, and a team results view (reveals the
  key). New models/endpoints (`scoring_items`, `scores`, `/scoring-items`, `/scores`, `/scoring-results`)
  + migration + demo items. Added the **pipeline diagram** (Mermaid) and the **analysis/statistics plan**. — Luis
- **2026-07-21** — Gap-analysis pass. Added the **annotation codebook** (+ IAA protocol), the **blind
  scoring kit** (`scoring/` guide + CSV form), and the **IRB/ethics starter pack** (`ethics/`: IRB
  outline, data-management plan, consent template). Recorded the AI assistant used —
  **Claude Opus 4.8 (Anthropic)** — in the methods/AI-use docs. — Luis
- **2026-07-21** — Added **clone-with-gh-cli.md** (GitHub CLI clone guide for a person or a coding
  agent; includes a paste-to-agent block). — Luis
- **2026-07-21** — Decision: **local-only** deployment for now. Added
  **METHODS-AND-DECISIONS.md** (full decision log + AI-use documentation for the manuscript), a
  step-by-step **Antigravity setup tutorial** for Rahmat, and documented the **Google AI Studio (Gemini)**
  free API as the future cloud-model path (Firestore ruled out as a DB mismatch). — Luis
- **2026-07-21** — Reader upgrades: **session summary** (timing + per-annotation log) and a **synthetic-
  profile prompt generator** (`POST /synthetic-lab/generate-prompt`); **model-backed smart highlighter**
  (`POST /annotation-assist`, graceful offline fallback); **URL + PDF ingestion**
  (`/sources/ingest-url`, `/sources/ingest-file`). Added `DEPLOYMENT.md` and made the API URL
  configurable (`ANNI_API_URL`) for hosting. — Luis
- **2026-07-20 (post-meeting)** — Built the **document ingestion pipeline + Lab Reader** (`/reader`):
  paste/cite a source → segmented + content-hashed into paragraphs → **smart highlighter** suggests
  traits on selection → **"How we annotate" tracker** (trait distribution, confidence, decisions, AI
  agreement). New endpoints `POST /sources/ingest` and `GET /annotation-stats`. — Luis
- **2026-07-20 (post-meeting)** — Wired **DSM-5 GAD baseline + open/closed outcome mode** into the lab
  (backend + `/lab` selector, recorded in transcript export). Added a draft **Heath update email** and a
  ready-to-paste **Antigravity setup prompt** for Rahmat. — Luis
- **2026-07-20 (post-meeting)** — Integrated Jul 20 decisions (5 cases, open/closed outcomes, DSM-5
  baseline, blinding, inspiration-not-replication, 20→70–75 turns). Added patient self-consistency
  reviewer prompt, GitHub onboarding + Ollama setup guides, and the meeting record (summary + transcript).
  Merged to master; Drive START HERE index added. — Luis
- **2026-07-20** — Added **Relay Mode** to the lab (responder selector for Wysa/ChatGPT, copy-message
  buttons, paste-reply flow, transcript export) + a run/relay guide and screenshots (mock-model wiring
  demo; real Ollama on local clone). — Luis
- **2026-07-20** — Built the **Synthetic Patient Lab** (`/lab`): an Ollama model role-plays a compiled
  profile with a planted risk level; profile library is extensible. Logged candidate testimony sources
  (healthtalk/DIPEx, CC-BY OA studies, DSM-5-TR cases, DEPAC, CLPsych) for Heath to license-check. — Luis

- **2026-07-20** — Correction: removed hand-generated vignettes (VIG-002/003/004). Vignettes must come
  from ANNI-annotated, cited testimony — not authored by hand. Kept the template + a clearly-labeled
  format illustration; real vignettes now blocked on annotation. Transcript convention + index kept. — Luis
- **2026-07-20** — Stood up `research/` workspace, all system prompts, protocol docs, intake workflow,
  and this tracker. Wysa confirmed set up. Reconciled 4-responder lineup with counselor-support. — Luis
