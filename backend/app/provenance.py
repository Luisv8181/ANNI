import hashlib
import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Annotation, AnnotationDecision, AuditLog, OntologyNode, Paragraph, Source

COMPILER_VERSION = "0.1"


def write_audit_event(db: Session, actor_id: str, entity_type: str, entity_id: str, action: str, details: dict) -> AuditLog:
    previous = db.scalar(select(AuditLog).order_by(AuditLog.created_at.desc()))
    timestamp = datetime.utcnow().isoformat()
    serialized = json.dumps(details, sort_keys=True, separators=(",", ":"))
    event_hash = hashlib.sha256(
        f"{previous.event_hash if previous else ''}|{timestamp}|{actor_id}|{entity_type}|{entity_id}|{action}|{serialized}".encode()
    ).hexdigest()
    event = AuditLog(
        actor_id=actor_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        details=serialized,
        previous_hash=previous.event_hash if previous else None,
        event_hash=event_hash,
        created_at=datetime.fromisoformat(timestamp),
    )
    db.add(event)
    return event


def citation_report(db: Session, annotation: Annotation) -> dict:
    paragraph = db.get(Paragraph, annotation.paragraph_id)
    source = db.get(Source, paragraph.source_id) if paragraph else None
    ontology = db.get(OntologyNode, annotation.ontology_node_id)
    decisions = db.scalars(
        select(AnnotationDecision).where(AnnotationDecision.annotation_id == annotation.id).order_by(AnnotationDecision.created_at)
    ).all()
    return {
        "annotation_id": annotation.id,
        "source": {
            "id": source.id if source else None,
            "title": source.title if source else None,
            "url": source.canonical_url if source else None,
            "license_status": source.license_status if source else None,
            "content_hash": source.content_hash if source else None,
            "version": source.version if source else None,
        },
        "evidence": {
            "paragraph_id": annotation.paragraph_id,
            "paragraph_order": paragraph.order_index if paragraph else None,
            "character_start": annotation.character_start,
            "character_end": annotation.character_end,
            "quote": annotation.evidence_quote,
        },
        "ontology": {
            "id": ontology.id if ontology else None,
            "label": ontology.label if ontology else None,
            "version": ontology.version if ontology else None,
        },
        "human_annotation": {
            "reviewer_id": annotation.reviewer_id,
            "confidence": annotation.confidence,
            "note": annotation.note,
            "status": annotation.status,
            "created_at": annotation.created_at,
        },
        "decisions": [
            {"id": item.id, "decision": item.decision, "note": item.decision_note, "by": item.decided_by, "at": item.created_at}
            for item in decisions
        ],
    }


def profile_provenance_footer(db: Session, annotations: list[Annotation]) -> str:
    """A citation/provenance footer embedded in a compiled synthetic-patient prompt.

    Records the compiler + ontology versions, the exact annotation IDs, and each
    source with its version and content hash — so any profile traces back to
    cited, human-approved evidence.
    """
    onto_versions: set[str] = set()
    sources: dict[str, tuple[str, str | None]] = {}
    for annotation in annotations:
        ontology = db.get(OntologyNode, annotation.ontology_node_id)
        if ontology:
            onto_versions.add(ontology.version)
        paragraph = db.get(Paragraph, annotation.paragraph_id)
        source = db.get(Source, paragraph.source_id) if paragraph else None
        if source:
            sources[source.id] = (source.version, source.content_hash)
    source_str = ", ".join(
        f"{sid} v{ver} sha256:{(h or 'none')[:12]}" for sid, (ver, h) in sorted(sources.items())
    ) or "n/a"
    return "\n".join(
        [
            "— ANNI provenance —",
            "This profile compiles cited, human-approved annotations. Every trait traces to a quote.",
            f"compiler v{COMPILER_VERSION} | ontology v{', '.join(sorted(onto_versions)) or 'unversioned'}",
            f"annotations: {', '.join(a.id for a in annotations)}",
            f"sources: {source_str}",
        ]
    )


def compile_system_prompt(db: Session, annotations: list[Annotation], scenario: str, learning_objective: str) -> tuple[str, str]:
    if not annotations:
        raise ValueError("At least one approved annotation is required.")
    traits: list[str] = []
    versions: set[str] = set()
    for annotation in annotations:
        ontology = db.get(OntologyNode, annotation.ontology_node_id)
        if ontology:
            versions.add(ontology.version)
            traits.append(f"- {ontology.label}: {annotation.note}")
    prompt = "\n".join(
        [
            "You are a synthetic patient in an educational simulation.",
            "",
            "Role boundaries:",
            "- Do not claim to be a real person or describe source testimony.",
            "- Stay within the approved profile below.",
            "- Do not invent personal history, diagnoses, trauma, demographics, or motives not supplied.",
            "- When asked about an unsupported detail, say you are unsure or redirect naturally.",
            "",
            "Approved behavioral profile:",
            *traits,
            "",
            f"Scenario: {scenario}",
            f"Learning objective: {learning_objective}",
            "",
            "Behavioral guidance:",
            "- Reveal sensitive concerns gradually when the learner demonstrates trust, validation, and plain language.",
            "- Maintain internal consistency across the conversation.",
            "- Do not provide medical advice or break character to evaluate the learner.",
        ]
    )
    return prompt, ", ".join(sorted(versions)) or "unversioned"
