# Source Intake Register

The master list of every testimony/transcript source. **Log links here first.** Heath updates the
`Status` and `License` after review. Only `approved` sources get their text brought into ANNI.

> To add a row: click the pencil ✏️ (Edit) on GitHub, copy the last row, fill it in, and commit.
> Give each source an ID like `SRC-001`, `SRC-002`, …

| ID | Source name / description | Link | Found by | Date added | License / terms | Status | Notes |
|----|---------------------------|------|----------|------------|-----------------|--------|-------|
| SRC-000 | _Example row — delete or keep as reference_ | https://example.org/testimony | Luis | 2026-07-20 | Public, CC-BY (verify) | proposed | Template row showing the format |
| SRC-001 | _Rahmat's found testimony — paste link_ | _link_ | Rahmat | _date_ | _pending_ | proposed | From Jul 9 email: "send over the testimony you found" |
| SRC-002 | **healthtalk.org / DIPEx** — in-depth patient experience narratives (mental health: depression, young people, psychosis, antidepressants, ECT). Consented for research/teaching/publication. | https://healthtalk.org | Team research | 2026-07-20 | ⚠️ Copyright DIPEx charity. Personal use free; **institutional use asks a support fee** + **written consent to copy/republish**. Participants consented to research use. | license-check | Strong fit (real, consented, text). Heath: contact DIPEx re: institutional/research license. |
| SRC-003 | **CC-BY open-access qualitative studies** with quoted anxiety/GAD patient testimony (e.g., PMC, Journal of Anxiety Disorders OA). | https://www.ncbi.nlm.nih.gov/pmc/ (filter: open access, CC-BY) | Team research | 2026-07-20 | ✅ Likely reusable **with attribution** under CC-BY — verify each article's license individually. | proposed | Probably the cleanest path: quote testimony embedded in CC-BY papers. Pick specific articles → new rows. |
| SRC-004 | **DSM-5-TR Clinical Cases** — clinician-authored psychiatric narratives (APA). | https://www.appi.org | Team research | 2026-07-20 | ⛔ Copyrighted (APA). Purchase to read; redistribution restricted. | license-check | Useful as reference/realism check, but likely can't ingest text into the repo. Heath to confirm. |
| SRC-005 | **DEPAC corpus** — depression & anxiety detection from speech; includes prompted narrative/journaling tasks (3,543 participants). | https://arxiv.org/abs/2306.12443 (dataset via authors) | Team research | 2026-07-20 | ⚠️ Research corpus — **Data Use Agreement** required; primarily audio. | license-check | Text transcripts may be usable under DUA. Heath: request access terms. |
| SRC-006 | **CLPsych / Reddit mental-health datasets** (e.g., RSDD, SMHD) — online first-person distress text. | https://clpsych.org | Team research | 2026-07-20 | ⚠️ **DUA + ethics review** required; sensitive social-media data. | license-check | Ecologically real but ethically heavy; only if IRB explicitly covers it. Heath/IRB call. |
|    |                           |      |          |            |                 |        |       |

## Legend
- **Status:** `proposed` → `license-check` → `approved` / `rejected` (see [`README.md`](README.md)).
- **License / terms:** note the license and whether it permits our research use. When unsure, leave
  `pending` and let Heath resolve it.
- Keep `rejected` rows (with a reason) so we don't re-litigate the same source later.
