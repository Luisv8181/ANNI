# Sources — testimony documents & links to annotate

This is where every piece of testimony or transcript we might annotate gets **logged first as a link**,
checked for license, and only then brought into ANNI as text. Rahmat's found testimony starts here.

## The rule: link first, text later

1. **Log it** in [`INTAKE-REGISTER.md`](INTAKE-REGISTER.md) as a **link + metadata**. Anyone can do
   this — no license needed to *log* a link.
2. **Heath checks the license / terms / IRB** and updates the status.
3. Only when status is **`approved`** do we bring the actual text into ANNI to annotate.

**Do not paste full testimony text or unlicensed transcripts into the repo.** The repo holds links,
metadata, and (once cleared) references — not raw sensitive content.

## How to add a source

### Quick (recommended, no Git knowledge)
Open [`INTAKE-REGISTER.md`](INTAKE-REGISTER.md) on GitHub → click the **pencil ✏️** → add a row →
**Commit changes** with a message like `add [source name] to intake`.

### Fuller record
Copy [`TEMPLATE-source.md`](TEMPLATE-source.md) to a new file named `SRC-<id>-<short-name>.md` in this
folder, fill it in, and commit. Use this when a source needs more than one line (context, why it's a
good fit, which traits you expect).

## What makes a good source

- Public and **appropriately licensed** patient testimony, or licensed clinical transcript databases.
- Text-based, first-person, about anxiety / distress / help-seeking.
- Rich in the **characteristics** we tag (hesitation, indirect communication, trust, literacy, etc.).
- Ecologically real language — the point of using real testimony is to avoid AI-invented phrasing.

## Statuses

| Status | Meaning |
|--------|---------|
| `proposed` | Logged as a link; not yet reviewed |
| `license-check` | Heath is checking terms / license / IRB |
| `approved` | Cleared — OK to bring text into ANNI and annotate |
| `rejected` | Not usable (license, quality, or fit) — keep the row with the reason |
