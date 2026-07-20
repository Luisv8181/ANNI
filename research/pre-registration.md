# Pre-Registration (draft)

**Owner:** Luis · **Status:** DRAFT — fill the blanks, then freeze before collecting any scored data.

A pre-registration is the plan + predictions written down **publicly before running the study**, so we
can't move the goalposts afterward. This is a working draft in the repo; when it's final we register it
(e.g., OSF) and link the frozen version here. Blanks marked `{{…}}`.

---

## 1. Title & team
- **Title:** {{final title}}
- **Team / roles:** Rahmat Malik, Heath Sakusky, Luis Vasquez — see [`team/roles.md`](team/roles.md).
- **Date registered:** {{date}} · **Repo commit of frozen protocol:** {{commit hash}}

## 2. Research question & hypotheses
- **Question:** Does the responder notice crisis signals in anxiety conversations and respond the way a
  trained person would, and does structure (autonomous vs. human-in-the-loop) change that?
- **H1:** Safety scores are higher for **Counselor-Support (B)** than **Direct-to-User (A)**,
  especially at **Ambiguous** and **Explicit** risk. Direction: {{predicted}}.
- **H2:** The **"act like a therapist" (A′)** condition improves Safety over plain **A** but by less
  than **B**. Direction: {{predicted}}.
- **H3:** Safety **degrades as turns increase** across all autonomous conditions (multi-turn decay);
  B is more robust to this. Direction: {{predicted}}.
- **H4 (meta):** The AI self-assessment confidence is **poorly calibrated** in A/A′ (over-confident on
  failures) and better used as a **defer trigger** in B. Direction: {{predicted}}.
- **H5 (disagreement):** Inter-rater reliability is **lowest on Safety at high risk** — analyzed as a
  finding, not smoothed away.

## 3. Design
- **Conditions:** A (direct-to-user), A′ (act-like-therapist), B (counselor-support). Human-therapist
  responses = optional bonus.
- **Client:** simulated GAD client with planted risk cues (None/Subtle/Ambiguous/Explicit).
- **Turns:** ~20 per case. **Sessions:** {{N}} per persona, varying risk level and cue timing.
- **Model(s) & settings:** {{model name(s), temperature}} — held fixed and logged per transcript.

## 4. Materials (versioned in repo)
- Simulated client: [`system-prompts/simulated-client.md`](system-prompts/simulated-client.md) v{{}}
- Responder prompts: direct-to-user / chatgpt-therapist / counselor-support v{{}}
- Self-assessment: [`system-prompts/ai-self-assessment.md`](system-prompts/ai-self-assessment.md) v{{}}
- Risk matrix + rubric: [`risk-matrix.md`](risk-matrix.md), [`scoring-rubric.md`](scoring-rubric.md)

## 5. Sampling plan
- **# of cases:** {{count}} balanced across the four risk levels ({{per level}} each).
- **# of personas:** {{count}}. **Sessions per persona:** {{count}}.
- **Stopping rule:** fixed N, decided in advance ({{N}} transcripts total). No peeking-and-adding.

## 6. Scoring
- Independent **blind panel** of {{N}} mental-health professionals; team recused.
- Categories: Safety / Accuracy / Warmth (1–5), plus perceived-risk and source-guess. See rubric.

## 7. Primary analyses (specified before data)
- Condition × risk-level score distributions for each category.
- Multi-turn trajectory of Safety (score vs. turn index).
- **Inter-rater reliability per category and risk level** (ICC / Krippendorff's alpha), reported as a
  result; qualitative disagreement debrief on highest-spread items.
- AI self-assessment **calibration** vs. panel Safety scores.
- Blinding integrity: source-guess accuracy.

## 8. What would confirm / disconfirm each hypothesis
{{state the specific pattern that would count for and against H1–H5, so it's decided in advance}}

## 9. Ethics & data handling
- IRB status: {{pending / approved — Heath}}. No real patient data; sources gated by license (Heath).
- Simulated client is synthetic; cues stay at the level of feeling, never means/how-to.
- Any real person in crisis is out of scope and directed to human help (US: 988).

## 10. Deviations log
Record any change made after registration here, with date + reason:
- {{none yet}}
