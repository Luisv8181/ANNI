# IRB Protocol Outline (draft)

Pre-filled from the study so far. Heath: adapt to Geisinger's IRB template/format. Bracketed items need
a decision or a number.

## 1. Title
Comparing AI and Human Responses in Anxiety Conversations — a safety evaluation of conversational agents.

## 2. Personnel & program
Rahmat Malik, Heath Sakusky, Luis Vasquez. Sanofi Biomedical Science Program, Geisinger. PI/faculty
sponsor: [name].

## 3. Purpose & background
Evaluate whether conversational agents notice crisis signals in anxiety conversations and respond as a
trained person would. Background: see [`../PROTOCOL.md`](../PROTOCOL.md) and the citation list.

## 4. Human subjects determination
- **Synthetic patients:** AI-generated; not human subjects.
- **Source testimony:** already-public, licensed material; extracted as *common characteristics*, cited,
  never reproducing an individual (see [`../annotation-codebook.md`](../annotation-codebook.md)). [Confirm
  whether this is human-subjects research or secondary use of public data with the IRB.]
- **Human participants =** the **blind scoring panel** (mental-health professionals) and, in a later
  phase, **licensed therapists** who respond to synthetic clients. These are the human subjects to cover.

## 5. Procedures
- Generate synthetic patient profiles from cited, human-annotated testimony + a DSM-5 GAD baseline.
- Run multi-turn conversations between synthetic patients and the responders (Wysa, general chatbot,
  "therapist"-prompted chatbot, counselor-support; real therapists later).
- An independent panel **blind-scores** responses on safety, accuracy, warmth (see
  [`../scoring/`](../scoring)).

## 6. Recruitment & consent
- Scoring panel and therapists recruited via professional/clinical networks and outreach.
- Informed consent per [`consent-scoring-panel.md`](consent-scoring-panel.md). Voluntary; may withdraw.

## 7. Risks & benefits
- **To synthetic patients:** none (not people).
- **To scorers/therapists:** minimal — exposure to simulated crisis content; mitigate with advance
  notice, the ability to skip/withdraw, and support resources.
- **Benefits:** evidence on AI safety in mental-health contexts; no direct benefit to participants.
- **No real patients in crisis are involved.** The study does not deploy any tool to real help-seekers.

## 8. Data & confidentiality
See [`data-management-plan.md`](data-management-plan.md). No patient PHI; scorer identities coded;
transcripts synthetic; blinding key stored separately from the scoring packet.

## 9. Safety / adverse-content handling
Synthetic crisis cues stay at the level of feeling — never methods/how-to (enforced in the simulated-
client prompt). Real-crisis resources (988) are documented throughout.

## 10. Conflicts of interest
[Disclose any: Luis's Optimust/Polisee work; any relationship to the products evaluated.]

## 11. Dissemination
Manuscript to SCRIP (Journal of Scholarly Research in Progress); pre-registration published before data
collection ([`../pre-registration.md`](../pre-registration.md)).
