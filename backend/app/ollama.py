import json
import logging
import os

import httpx
from sqlalchemy import select

from app.database import SessionLocal
from app.models import AISuggestion, Annotation, OntologyNode, Paragraph
from app.provenance import write_audit_event

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "llama3")

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are an expert clinical annotation reviewer. You will receive a human annotation that maps a patient testimony excerpt to a clinical ontology node. Your job is to provide a structured second opinion.

Respond with a JSON object only (no markdown, no explanation outside the JSON):
{
  "suggestion": "<one sentence: what the annotation should say or emphasise>",
  "rationale": "<two to three sentences: why this evidence supports or refines the human annotation>",
  "confidence": <integer 0-100>
}
"""


def run_ollama_review(annotation_id: str) -> None:
    db = SessionLocal()
    try:
        annotation = db.get(Annotation, annotation_id)
        if not annotation:
            return
        paragraph = db.get(Paragraph, annotation.paragraph_id)
        ontology = db.get(OntologyNode, annotation.ontology_node_id)
        if not paragraph or not ontology:
            return

        user_message = (
            f"Ontology node: {ontology.label} — {ontology.description}\n\n"
            f"Testimony paragraph:\n{paragraph.text}\n\n"
            f"Human annotation:\n"
            f"  Evidence quote: \"{annotation.evidence_quote}\"\n"
            f"  Reviewer note: {annotation.note}\n"
            f"  Confidence: {annotation.confidence}%"
        )

        try:
            response = httpx.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": MODEL,
                    "stream": False,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": user_message},
                    ],
                },
                timeout=120.0,
            )
            response.raise_for_status()
            content = response.json()["message"]["content"].strip()
            # strip markdown code fences if model includes them
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            parsed = json.loads(content)
        except Exception as exc:
            logger.error("Ollama review failed for annotation %s: %s", annotation_id, exc)
            return

        suggestion = AISuggestion(
            annotation_id=annotation_id,
            agent_name="ANNI Reviewer",
            model_name=MODEL,
            ontology_node_id=annotation.ontology_node_id,
            confidence=min(100, max(0, int(parsed.get("confidence", 75)))),
            evidence_quote=annotation.evidence_quote,
            suggestion=parsed.get("suggestion", ""),
            rationale=parsed.get("rationale", ""),
            decision="pending",
        )
        db.add(suggestion)
        db.flush()
        write_audit_event(db, annotation.reviewer_id, "ai_suggestion", suggestion.id, "created", {"annotation_id": annotation_id, "model": MODEL})
        db.commit()
    finally:
        db.close()
