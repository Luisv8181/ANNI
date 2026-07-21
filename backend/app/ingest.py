"""Document ingestion for the Lab Reader.

Takes a raw source (pasted text), captures its citation metadata, segments it
into clean paragraphs, and stores it as a Source + Paragraphs so it can be read
and annotated in ANNI. Every ingested source is content-hashed for provenance.
"""

import hashlib
import html as html_lib
import re


def strip_html(raw: str) -> str:
    """Very light HTML → text: drop scripts/nav, turn <p>/<br> into breaks, unescape."""
    raw = re.sub(r"(?is)<(script|style|head|nav|footer|aside)[^>]*>.*?</\1>", " ", raw)
    text = re.sub(r"(?is)<br\s*/?>", "\n", raw)
    text = re.sub(r"(?is)</(p|div|h[1-6]|li)>", "\n\n", text)
    text = re.sub(r"(?is)<[^>]+>", " ", text)
    text = html_lib.unescape(text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_html_title(raw: str) -> str | None:
    match = re.search(r"(?is)<title[^>]*>(.*?)</title>", raw)
    return html_lib.unescape(match.group(1)).strip() if match else None


def extract_pdf_text(data: bytes) -> str:
    """Extract text from a PDF byte stream (requires pymupdf)."""
    import fitz  # pymupdf

    with fitz.open(stream=data, filetype="pdf") as doc:
        return "\n\n".join(page.get_text() for page in doc)


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
