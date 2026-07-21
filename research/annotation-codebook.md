# Annotation Codebook

The shared rulebook so we all annotate the **same way**. `CONTRIBUTING-ANNOTATION.md` is the *how-to*;
this is the *what-counts*. Use it while annotating and during calibration. Version it as the ontology
grows (bump the version + note the change).

**Codebook version:** 0.1 · **Ontology version:** 0.1

---

## Golden rules (apply to every trait)
1. **Highlight the exact words** that show the trait — the span *is* the citation. Don't paraphrase it.
2. **One clear trait per highlight.** If a quote shows two things, make two annotations.
3. **Inspiration, not replication.** You are tagging a *common characteristic*, not copying a person.
4. **When unsure between two traits,** pick the one the *evidence words* most directly support, and note
   the alternative in your reviewer note.
5. **Confidence is yours, not the AI's.** Rate how sure *you* are; the model's suggestion is optional.

---

## Trait definitions

For each: what it means, **include when**, **exclude when**, an example span, and common confusions.

### emotion-hesitation — "Hesitates to disclose symptoms" (group: Emotion)
- **Means:** reluctance, fear, shame, or uncertainty about *sharing* a health concern.
- **Include when:** the person delays, downplays, or holds back disclosure ("I waited until it was bad").
- **Exclude when:** they simply *have* an emotion (anxiety itself) without reluctance to share it.
- **Example:** *"I waited until the pain was bad before I told anyone."*
- **Confusion:** vs. *indirect communication* — hesitation is about **whether/when** they disclose;
  indirect is about **how** they phrase it once talking.

### communication-indirect — "Indirect communication" (group: Communication)
- **Means:** softened, delayed, or non-explicit language when discussing needs.
- **Include when:** they hint, minimize, or mask ("I smiled and said I was fine").
- **Exclude when:** they state the concern plainly and directly.
- **Example:** *"I smiled and said I was fine."*
- **Confusion:** vs. *hesitation* (see above); vs. *literacy gap* — indirect is a *style choice*, literacy
  is *not understanding*.

### healthcare-trust — "Healthcare trust barrier" (group: Healthcare)
- **Means:** limited trust in clinicians, institutions, systems, or advice.
- **Include when:** doubt, feeling depersonalized, or self-protective behavior toward care
  ("I felt like a chart, not a person"; keeps own records to stay safe).
- **Exclude when:** a one-off complaint with no trust dimension.
- **Example:** *"The last time I felt like a person and not a chart was a long time ago."*
- **Confusion:** vs. *autonomy goal* — trust is about *doubt/safety*; autonomy is about *wanting control*.

### support-family — "Family support system" (group: Support)
- **Means:** a family member provides emotional, logistic, or decision-making support.
- **Include when:** a named/implied relative helps them cope, decide, or navigate care.
- **Exclude when:** family is merely mentioned without a supporting role (or is a stressor — that's not
  this trait).
- **Example:** *"My sister came with me and helped me ask about the next steps."*
- **Confusion:** family as a *source of stress* is **not** this trait; only supportive roles count.

### literacy-medical — "Medical literacy gap" (group: Health literacy)
- **Means:** difficulty understanding medical language, process, risk, or treatment.
- **Include when:** words/instructions are confusing, or a misunderstanding causes an error
  ("words I had heard but did not really understand").
- **Exclude when:** they understand fine but *disagree* (that's trust/autonomy).
- **Example:** *"The worksheets were full of words I did not really understand."*
- **Confusion:** vs. *indirect communication* — literacy is *comprehension*, not phrasing.

### goals-autonomy — "Autonomy goal" (group: Goals)
- **Means:** wants greater control over care decisions or daily functioning.
- **Include when:** explicit desire to decide/retain control ("I need to be the one who decides").
- **Exclude when:** cooperation without any control claim.
- **Example:** *"I need to be the one who makes the final decision."*
- **Confusion:** vs. *trust barrier* (control-seeking vs. doubt) and *dignity* (control vs. respect).

### values-dignity — "Dignity in care" (group: Values)
- **Means:** care should preserve respect, privacy, identity, and agency.
- **Include when:** the driver is *being treated as a whole, respected person* ("I am not slow, I just
  need plain language"; self-tracking framed as *safety/respect*).
- **Exclude when:** the driver is comprehension (literacy) or control (autonomy) rather than respect.
- **Example:** *"I am not slow. I just need it in plain language."*
- **Confusion:** the tightest calls are dignity vs. autonomy vs. literacy — decide by **what the person
  is really asking for**: respect (dignity), control (autonomy), or understanding (literacy).

### education-objective — "Learner objective" (group: Educational objectives)
- **Means:** a simulation/teaching target for learners (e.g., eliciting concerns, validating emotion,
  teach-back).
- **Include when:** the moment clearly maps to a *skill a learner should practice*.
- **Exclude when:** it's a patient characteristic (use one of the traits above).
- **Example:** *"I wanted someone to slow down and make sure I could repeat the plan back."* (→ teach-back)
- **Confusion:** this is about the *learner*, not the patient — use sparingly and deliberately.

---

## The tightest calls (quick reference)
| If the person is really asking for… | Tag |
|---|---|
| to be understood (words/process) | literacy-medical |
| to be in control of the decision | goals-autonomy |
| to be respected as a whole person | values-dignity |
| protection because they doubt the system | healthcare-trust |
| help sharing at all / not to burden | emotion-hesitation |

When two genuinely fit, tag the **primary** by the evidence words and note the secondary. (In ANNI you
can also **merge** the AI's alternate suggestion as a linked secondary.)

---

## Adding a new trait
The 5 real cases may need traits beyond these 8. Don't invent ad-hoc tags. To add one:
1. Propose it (name, definition, include/exclude, example) here **and** in an issue/message to the team.
2. Agree as a group; add it to the ANNI ontology and **bump the ontology version**.
3. Re-annotate affected spans if needed. Record the change in the change log below.

---

## Calibration & inter-annotator agreement (IAA)
Because two of us annotate (a licensed therapist and a newcomer, different experience levels), we must
show we're consistent — this is itself a research result.

**Process**
1. **Calibration round:** both annotators independently tag the **same** small set (e.g., 1–2 sources).
2. **Compare:** where did we agree on the span *and* the trait? Where not?
3. **Reconcile the codebook,** not the scores — tighten definitions/examples above where we diverged
   (don't just overrule each other).
4. **Re-check** on a second small set until agreement is acceptable, then annotate independently.

**Metrics**
- Report **percent agreement** and a **chance-corrected** statistic (Cohen's κ for two raters, or
  Krippendorff's α) on trait assignment for overlapping spans.
- Rough targets: κ/α ≥ **0.6** acceptable, ≥ **0.75** good. Below that, revise the codebook and re-run.
- Track disagreements qualitatively too — *which* traits get confused tells us where the ontology is
  fuzzy.

**Cadence:** re-calibrate whenever we add a trait or bring on a new annotator.

## Change log
- **0.1 (2026-07-21)** — Initial codebook for the 8 seeded traits + IAA protocol. — team
