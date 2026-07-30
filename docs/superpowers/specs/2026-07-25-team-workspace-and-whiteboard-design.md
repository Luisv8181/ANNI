# ANNI Team Workspace, Whiteboard UI, and Launch Packet Design

## Purpose

Make ANNI easy for a student team to use during a controlled research pilot: a member should be able to
select their workspace, understand what they can do next, and move from source review to a synthetic
patient session without needing to understand the underlying research infrastructure.

The experience will use a modern, calm 2D whiteboard visual language: large readable labels, simple
sketch-like diagrams, high-contrast cards, and one clear next action per screen. The style draws only from
the non-confidential Second Brain themes of care, attention, privacy, evidence, and practical action.

## Safety and study boundary

- The active live Wysa condition is **Luis / 18 years and older** only.
- An under-13 Wysa selection produced a warning. ANNI must label under-13 Wysa as unavailable and must not
  give account-creation or relay instructions for it.
- A 13–17 Wysa condition is deferred until Wysa eligibility, consent/guardian requirements, research terms,
  and the study ethics/IRB process are explicitly confirmed.
- Team selection is an ANNI research-workspace feature, not an authentication or Wysa-account integration.
  The app never creates, stores, or shares Wysa credentials.
- Synthetic profiles remain fictional and source-grounded; no real patient or account information enters
  ANNI or the repository.

## User model

Each person has a named ANNI workspace that supplies study context to Reader, prompt generation, and Lab.

| Member | ANNI workspace | Wysa status | Default age context |
|---|---|---|---|
| Luis | Active pilot operator | Active, 18+ only | 18+ Wysa pilot |
| Rahmat | Research contributor | Deferred | No active Wysa age condition |
| Heath | Research/compliance contributor | Deferred | No active Wysa age condition |

Selecting a workspace changes the visible welcome message, suggested next action, transcript metadata, and
the default context supplied to generated prompts. It must not silently make a deferred condition runnable.

## Product flow

1. **Welcome / team switcher**: choose Luis, Rahmat, or Heath from three plain-language cards.
2. **Workspace home**: show the member's role, current study status, and one primary action: annotate,
   compile a profile, or run the active 18+ pilot.
3. **Reader and prompt generator**: carry the workspace context in the session summary and prompt metadata.
4. **Patient Lab**: show an always-visible study-context badge. Only Luis sees the active Wysa 18+ relay
   option; deferred roles explain why the option is unavailable and point to the research note.
5. **Scoring/export**: retain operator and approved study context in the working record, while stripping all
   identifying context from the blinded scoring queue.

## Visual system

The redesign will preserve ANNI's provenance-first seriousness while becoming easier to scan.

- **Navigation**: a small persistent route rail with friendly names: Home, Read, Build, Run, Score, Evidence.
- **Whiteboard cards**: off-white paper surfaces, hand-drawn border accents, short marker-style headings,
  subtle violet/teal/amber/coral signals, and generous mobile spacing.
- **Flow map**: a reusable 2D whiteboard strip: `Read -> Mark -> Build -> Run -> Score`, with the current
  step clearly highlighted.
- **Safety callouts**: amber boundary cards state what is active, deferred, or requires human approval.
- **Accessibility**: semantic headings, normal body text, visible focus states, no information conveyed by
  colour alone, and reduced-motion support.

## Launch packet and outreach

Create a team-facing startup packet containing:

1. ANNI local access and device-testing instructions.
2. Antigravity installation and first-run guidance.
3. A coding-agent handoff prompt for cloning and running ANNI.
4. A GitHub account-creation and repository-access walkthrough.
5. The study safety boundary for Wysa, including the active 18+ pilot and deferred age conditions.

Draft, but do not send, two personalized emails:

- **Rahmat**: setup steps, annotation role, and the deferred Wysa status.
- **Heath**: setup steps, compliance/terms/ethics checks, and the decision required before any 13–17 study path.

## Milestones and build log

The build log lives at `research/BUILD-LOG.md`. Each entry records date, milestone, changes, test evidence,
and any blocked decision.

1. Foundation: add team-workspace rules and testable age-context helpers.
2. Workflow: connect the selected workspace to Reader, prompt generation, Lab, export, and blind-scoring
   boundaries.
3. Visual system: add whiteboard navigation, status cards, and responsive workspace surfaces.
4. Launch materials: create the startup packet and two email drafts.
5. Verification: run unit/build checks and a browser/device-flow review; record results in the build log.

## Non-goals

- No Wysa API integration, automation, account creation, credential storage, or collection of account data.
- No authorization claim beyond ANNI's local research workspace selection.
- No active under-13 or 13–17 Wysa testing path.
- No sending external email without a final recipient and content review.

## Success criteria

- A first-time student can identify their workspace and next step without reading technical documentation.
- The active/deferred Wysa boundary is clear and cannot be bypassed through the standard Lab UI.
- Selected workspace context appears in non-blinded workflow metadata and never appears in blinded scoring.
- The launch packet gives each collaborator a complete, safe local setup path.
- Build-log entries cite concrete test or review evidence for each milestone.
