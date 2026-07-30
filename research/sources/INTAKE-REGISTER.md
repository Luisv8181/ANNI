# ANNI Source Intake Register

## Status Legend
- ✅ INGESTED — Full text extracted, paragraphs loaded, verified PMCID
- ❌ REJECTED — Irrelevant, protocol-only, or non-anxiety-focused
- 🚫 REMOVED — Previously synthetic composite, now purged

---

## 🚫 Removed Synthetic Composites (v1 seed — PURGED)

| Source ID | Title | Reason |
|-----------|-------|--------|
| T-DEMO-001 | Reluctant Discloser | Synthetic composite with fake PMCID (PMC8492011) |
| T-DEMO-002 | Guarded Navigator | Synthetic composite with fake PMCID (PMC8492012 = COVID paper) |
| T-DEMO-003 | Plain-Language Seeker | Synthetic composite with fake PMCID (PMC8492013) |
| SRC-PMC-910244 | Premature Termination in CBT | Fabricated paper — no such PMC article exists |

---

## ✅ Ingested Real Sources (v2 seed — CURRENT)

| # | PMCID | Title | Journal | Year | Method | Paragraphs |
|---|-------|-------|---------|------|--------|------------|
| 1 | [PMC13154385](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13154385/) | Sleepless hours: lived experience of chronic insomnia and anxiety | Frontiers in Public Health | 2026 | 29 semi-structured interviews | 8 |
| 2 | [PMC12118939](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12118939/) | Co-Designed Online Training Program for Worry Management | JMIR Formative Research | 2025 | Participatory design with lived experience panel | 8 |
| 3 | [PMC10075395](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10075395/) | Accessing mental health services for a child with anxiety: Parents' lived experience | PLoS ONE | 2023 | Hermeneutic phenomenology, 54 parent interviews | 8 |
| 4 | [PMC10129986](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10129986/) | Self-disclosure as an Active Ingredient in Interventions for Anxiety and Depression | Administration and Policy in Mental Health | 2023 | Systematic review + lived experience panel (n=7) | 8 |
| 5 | [PMC13155605](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13155605/) | Symptom presentation, perceived causes, and help-seeking in anxiety care in Nepal | PLoS ONE | 2026 | Qualitative study with thematic analysis | 10 |
| 6 | [PMC12678874](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12678874/) | Self-regulated learning for anxiety and stress management in severe mental disorders | Applied Psychology: Health and Well-Being | 2025 | Qualitative study | 10 |
| 7 | [PMC13279597](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC13279597/) | Understanding Needs of Adolescents with Subclinical Anxiety and Depression | School Mental Health | 2026 | Document analysis + qualitative interviews | 10 |
| 8 | [PMC12161304](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12161304/) | Remote consulting for anxiety and depression in UK general practice | BMJ Open | 2025 | Semi-structured qualitative interviews | 10 |

**Total: 8 sources, 72 paragraphs of real published text**

---

## ❌ Rejected During Curation

| PMCID | Title | Reason |
|-------|-------|--------|
| PMC13037166 | Psychosocial interventions for female adolescents in SSA | Protocol only — no primary data |
| PMC11925633 | Traumatic Stress Relief for leprosy | Protocol only — not anxiety-focused |
| PMC12957944 | Self-Management for Polycystic Ovary Syndrome | Not anxiety-related |
| PMC7683059 | Psychological Interventions for Huntington's Disease | Not anxiety-related |
| PMC12351197 | Harm from school-based mental health interventions | Scoping review, no patient data |
| PMC10052839 | CBT for maternal perinatal depression | Meta-analysis, not qualitative |
| PMC8487131 | CBT for anxiety in autism spectrum | Systematic review, no interviews |
| PMC13234537 | Restriction-Resumption Protocols on Mood | RCT, not qualitative |
| PMC13215575 | Virtual Exposure for OCD | OCD, not GAD |
| PMC13253621 | Penn State Worry Questionnaire validation | Psychometric study, no interviews |
| PMC13170457 | Personality disorder in psychotherapy | Depression-focused |

---

## Provenance Notes

- **Search Engine**: Europe PMC REST API (`europepmc.org/webservices/rest`)
- **Search Date**: 2026-07-30
- **Full Text Source**: PMC Open Access XML (`/fullTextXML`)
- **Paragraph Extraction**: `<p>` tags from full-text XML, cleaned of inline markup
- **Curation Method**: 3-round search with progressively tighter relevance filters
- **License**: All sources are from the PMC Open Access subset (CC-BY or equivalent — verify individual articles)
