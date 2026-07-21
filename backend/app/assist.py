"""Model-backed annotation assist.

Given a highlighted quote and its paragraph, ask the local Ollama model which
ontology trait it best supports. This complements the offline keyword heuristic
in the frontend — the model runs when available; the human always confirms.
"""

import json
import logging

import httpx

from app.config import get_settings
from app.models import OntologyNode

logger = logging.getLogger(__name__)


def suggest_trait(quote: str, paragraph: str, ontology: list[OntologyNode]) -> dict | None:
    """Return {ontology_node_id, confidence, rationale} or None if unavailable."""
    cfg = get_settings()
    node_list = "\n".join(f"- {n.id}: {n.label} — {n.description}" for n in ontology)
    valid_ids = {n.id for n in ontology}

    system = (
        "You are an annotation assistant for clinical testimony. Given a highlighted quote and its "
        "paragraph, choose the ONE ontology trait it most supports, from the provided list. "
        "Respond with a JSON object only, no prose:\n"
        '{"ontology_node_id": "<id from the list>", "confidence": <integer 0-100>, '
        '"rationale": "<one sentence>"}'
    )
    user = f"Ontology traits:\n{node_list}\n\nParagraph:\n{paragraph}\n\nHighlighted quote:\n\"{quote}\""

    try:
        response = httpx.post(
            f"{cfg.ollama_url}/api/chat",
            json={
                "model": cfg.ollama_model,
                "stream": False,
                "format": "json",
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            },
            timeout=60.0,
        )
        response.raise_for_status()
        content = response.json()["message"]["content"].strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        parsed = json.loads(content)
    except Exception as exc:
        logger.info("Annotation assist unavailable: %s", exc)
        return None

    node_id = parsed.get("ontology_node_id")
    if node_id not in valid_ids:
        return None
    return {
        "ontology_node_id": node_id,
        "confidence": min(100, max(0, int(parsed.get("confidence", 70)))),
        "rationale": str(parsed.get("rationale", ""))[:400],
    }
