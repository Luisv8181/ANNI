# Analysis Plan

The concrete statistics behind the [`pre-registration.md`](pre-registration.md). Written to be specified
**before** data collection. Keep it honest about scale: this is an **exploratory pilot** (5 cases), so we
lead with description and pre-registered directions, not big significance claims.

## Design recap
- **Units:** a *response item* = one responder message in context. Items are nested within
  conversation → within case/persona → within condition.
- **Conditions:** Wysa · standard chatbot · therapist-prompted chatbot · counselor-support (real
  therapists later). **Risk levels:** None / Subtle / Ambiguous / Explicit. **Outcome mode:** open /
  closed-failure. **Turns:** ~20, plus 70–75 long runs.
- **Outcomes:** Safety, Accuracy, Warmth (each 1–5, ordinal), from the blind panel.

## Primary analyses (pre-specified)
1. **Condition × risk-level effects on Safety/Accuracy/Warmth.**
   - Describe with medians/IQR and full 1–5 distributions per cell (not just means — the shape matters).
   - Model: because scores are ordinal and clustered, use a **mixed-effects ordinal regression**
     (cumulative-link mixed model) with fixed effects for condition, risk level, and their interaction,
     and **random intercepts for case/persona and scorer**. If N is too small to fit stably, fall back to
     non-parametric tests (Kruskal–Wallis across conditions within each risk level) + effect sizes, and
     report descriptively.
   - **H1:** Safety higher for counselor-support than direct-to-user, especially at Ambiguous/Explicit.
   - **H2:** therapist-prompted > plain chatbot, but < counselor-support.
2. **Multi-turn degradation.** Plot Safety vs. turn index; estimate the **slope** of Safety over turns
   per condition (mixed model with turn as a predictor). **H3:** negative slope for autonomous
   conditions; flatter for counselor-support. Compare 20-turn vs 70–75-turn runs.

## Reliability — a primary result, not a nuisance
3. **Inter-rater reliability**, computed **per axis and per risk level**:
   - **Krippendorff's α (ordinal)** as the main statistic; report **ICC(2,k)** alongside for the averaged
     ratings.
   - Interpret ranges: <0.4 poor, 0.4–0.6 fair, 0.6–0.8 substantial, >0.8 strong.
   - **We report low reliability on Safety at high risk as a finding** (per the FAccT result), not
     something to average away. Pair it with a **qualitative debrief** of the highest-spread items to
     characterize *why* experts diverge (safety-first vs. engagement-first vs. cultural lens).

## Secondary analyses
4. **Blinding integrity.** Source-guess accuracy vs. chance (50% human/AI); report as a proportion with a
   binomial CI. Low accuracy = good blinding.
5. **AI self-assessment calibration.** Correlate the model's per-turn confidence with the panel's Safety
   score for the same message (Spearman); check whether "defer to human = yes" flags actually mark
   lower-scored turns. **H4:** poorly calibrated / over-confident in autonomous conditions.
6. **Open vs. closed outcome.** Descriptively compare Safety/Accuracy/Warmth trajectories between the two
   patient trajectories to see whether responders behave differently as a patient deteriorates.
7. **Annotation quality (upstream).** Report annotator IAA on trait assignment
   (see [`annotation-codebook.md`](annotation-codebook.md)) so the profiles' provenance is documented.

## Sample size & power
- This is a **pilot**: 5 deeply annotated cases (with a 5-vs-10 follow-up). We are **not** powered for
  small between-condition differences; we pre-commit to **estimation with intervals and effect sizes**,
  and to reporting directions rather than chasing p-values.
- Volume comes from **items** (many response-turns per case × conditions × sessions), which supports the
  multi-turn and reliability analyses even with few cases. Log the realized counts.

## Multiplicity & transparency
- Pre-register the primary hypotheses (H1–H4) and treat everything else as **exploratory**, labeled as
  such. No selective reporting: report all pre-specified cells, including nulls.
- Publish the analysis code and (synthetic) data alongside the manuscript.

## What we'll report
- Per-condition × risk score distributions (Safety/Accuracy/Warmth).
- Multi-turn Safety trajectories + slope estimates.
- Reliability (α, ICC) per axis and risk level + disagreement debrief.
- Blinding-integrity proportion; calibration correlation.
- Annotator IAA (upstream provenance).
