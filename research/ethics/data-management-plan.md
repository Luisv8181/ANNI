# Data Management Plan (draft)

Heath/team to finalize. Bracketed items need a decision.

## What data we hold
| Data | Sensitivity | Where |
|------|-------------|-------|
| Source testimony (licensed/public) | Low–med (per license) | ANNI DB / cited links in intake register |
| Annotations + provenance (spans, traits, notes, audit log) | Low (synthetic-derived) | ANNI DB |
| Synthetic patient profiles / prompts | Low (synthetic) | repo + ANNI DB |
| Conversation transcripts (synthetic ↔ responders) | Low–med | `research/transcripts/` (working) + a blinded packet |
| Scoring data (ratings) | Low; scorer identity = **coded** | scoring sheets |
| Blinding key (item_id → true labels) | Access-controlled | **separate** from the packet, team-only |

## Principles
- **No PHI / no real patient identifiers** anywhere — ever.
- **Synthetic ≠ real:** transcripts and profiles are synthetic; never represent them as a real person.
- **License-gated ingestion:** only sources cleared in the intake register enter ANNI.
- **Separation:** the blinding key is stored apart from the scoring packet; scorer identities are coded.

## Storage & access
- **Local-first:** ANNI runs on team machines; the model (Ollama) runs on-device. [If a cloud instance
  is ever used, revisit this section — esp. anything sent to a hosted model API.]
- Repo: GitHub `luisv8181/ANNI` (private). Access = team collaborators only.
- Manuscript/citations: the shared Google Drive folder.
- [Decide a canonical store for raw transcripts + scoring sheets — repo folder vs. a shared drive.]

## Retention & disposal
- Keep study data through publication + [X years per Geisinger policy].
- Dispose of anything not needed; keep synthetic artifacts as they carry no personal data.

## Backups
- GitHub holds code + docs. [Decide a backup for transcripts/scoring not stored in git.]

## Access control checklist before any sharing
- [ ] Blinding key is NOT in the packet.
- [ ] No identifiers in transcripts.
- [ ] Only licensed source text is included.
- [ ] Repo remains private; collaborators reviewed.
