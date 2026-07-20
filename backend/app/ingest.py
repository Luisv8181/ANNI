"""Document ingestion for the Lab Reader.

Takes a raw source (pasted text), captures its citation metadata, segments it
into clean paragraphs, and stores it as a Source + Paragraphs so it can be read
and annotated in ANNI. Every ingested source is content-hashed for provenance.
"""

import hashlib
import re


def compute_content_hash(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text).strip()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def segment_into_paragraphs(text: str) -> list[str]:
    """Split source text into readable, annotatable paragraphs.

    Prefer blank-line boundaries; if the text has none, fall back to single
    newlines; if it's one long block, fall back to sentence grouping so no single
    paragraph is unmanageably long in the reader.
    """
    text = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if not text:
        return []

    blocks = [b.strip() for b in re.split(r"\n\s*\n", text) if b.strip()]
    if len(blocks) <= 1:
        # No blank lines — try single newlines.
        blocks = [b.strip() for b in text.split("\n") if b.strip()]

    paragraphs: list[str] = []
    for block in blocks:
        block = re.sub(r"[ \t]+", " ", block).strip()
        if len(block) <= 900:
            paragraphs.append(block)
            continue
        # Very long block: group sentences into ~600-char paragraphs.
        sentences = re.split(r"(?<=[.!?])\s+", block)
        current = ""
        for sentence in sentences:
            if current and len(current) + len(sentence) + 1 > 600:
                paragraphs.append(current.strip())
                current = sentence
            else:
                current = f"{current} {sentence}".strip()
        if current.strip():
            paragraphs.append(current.strip())

    return paragraphs
