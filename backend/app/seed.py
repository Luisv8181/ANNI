"""Idempotent demo seed for ANNI.

Seeds the ontology, a demo project, and three fully worked synthetic patient
profiles — each with public-testimony-style sources, a reviewer, read
confirmations, human annotations, local-AI second opinions, human decisions,
compiled synthetic-patient system prompts, and a tamper-evident audit chain.

The worked-example block is guarded on a marker annotation id so it runs once.
"""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    AISuggestion,
    Annotation,
    AnnotationDecision,
    OntologyNode,
    Paragraph,
    Project,
    PromptCompilation,
    PromptCompilationAnnotation,
    ReadConfirmation,
    Source,
    User,
)
from app.provenance import COMPILER_VERSION, compile_system_prompt, write_audit_event

DEMO_PROJECT_ID = "proj-anni-demo"
DEMO_SOURCE_ID = "T-DEMO-001"
DEMO_REVIEWER_ID = "user-demo-reviewer"
MARKER_ANNOTATION_ID = "ann-sp01-01"  # presence => worked example already seeded

ONTOLOGY_NODES = [
    {"id": "emotion-hesitation", "label": "Hesitates to disclose symptoms", "group": "Emotion", "description": "Signals reluctance, fear, shame, or uncertainty when sharing health concerns.", "version": "0.1"},
    {"id": "communication-indirect", "label": "Indirect communication", "group": "Communication", "description": "Uses softened, delayed, or non-explicit language when discussing needs.", "version": "0.1"},
    {"id": "healthcare-trust", "label": "Healthcare trust barrier", "group": "Healthcare", "description": "Shows limited trust in clinicians, institutions, systems, or advice.", "version": "0.1"},
    {"id": "support-family", "label": "Family support system", "group": "Support", "description": "Family members provide emotional, logistic, or decision-making support.", "version": "0.1"},
    {"id": "literacy-medical", "label": "Medical literacy gap", "group": "Health literacy", "description": "Difficulty understanding medical language, process, risk, or treatment options.", "version": "0.1"},
    {"id": "goals-autonomy", "label": "Autonomy goal", "group": "Goals", "description": "The person wants greater control over care decisions or daily functioning.", "version": "0.1"},
    {"id": "values-dignity", "label": "Dignity in care", "group": "Values", "description": "Care should preserve respect, privacy, identity, and agency.", "version": "0.1"},
    {"id": "education-objective", "label": "Learner objective", "group": "Educational objectives", "description": "A simulation target for learners, such as eliciting concerns or validating emotion.", "version": "0.1"},
]

# ── Sources & testimony ───────────────────────────────────────────────────────
# All testimony below is SYNTHETIC — composite, illustrative text authored for
# demonstration, not transcribed from any real person.

SOURCES = [
    {
        "id": DEMO_SOURCE_ID,
        "title": "Reluctant Discloser — synthetic testimony",
        "author": "Synthetic composite",
        "publication": "ANNI demonstration corpus",
        "canonical_url": "https://example.org/anni/synthetic/sp-01",
        "license_status": "demo-only",
        "allow_list_status": "approved",
        "version": "1",
        "paragraphs": [
            {"id": "p1", "order_index": 1, "text": "I waited until the pain was bad before I told anyone. I kept thinking it would sound dramatic if I complained again, so I smiled and said I was fine."},
            {"id": "p2", "order_index": 2, "text": "When the nurse asked direct questions I answered, but I did not know how to explain what scared me most. My sister noticed and helped me ask about the next steps."},
            {"id": "p3", "order_index": 3, "text": "The printed instructions were full of words I had heard before but did not really understand. I wanted someone to slow down and make sure I could repeat the plan back."},
        ],
    },
    {
        "id": "T-DEMO-002",
        "title": "Guarded Navigator — synthetic testimony",
        "author": "Synthetic composite",
        "publication": "ANNI demonstration corpus",
        "canonical_url": "https://example.org/anni/synthetic/sp-02",
        "license_status": "demo-only",
        "allow_list_status": "approved",
        "version": "1",
        "paragraphs": [
            {"id": "p2-1", "order_index": 1, "text": "The last time I felt like a person and not a chart was a long time ago. Now I ask a lot of questions before I agree to anything, and I know some of the staff find it tiring."},
            {"id": "p2-2", "order_index": 2, "text": "I am not trying to be difficult. I just need to understand the reason, and I need to be the one who makes the final decision. When someone explains why and leaves the choice to me, I almost always say yes."},
            {"id": "p2-3", "order_index": 3, "text": "I keep my own notes now — every medication, every date, every name. If something does not match what I am told, I say so. It is the only way I feel safe in there."},
        ],
    },
    {
        "id": "T-DEMO-003",
        "title": "Plain-Language Seeker — synthetic testimony",
        "author": "Synthetic composite",
        "publication": "ANNI demonstration corpus",
        "canonical_url": "https://example.org/anni/synthetic/sp-03",
        "license_status": "demo-only",
        "allow_list_status": "approved",
        "version": "1",
        "paragraphs": [
            {"id": "p3-1", "order_index": 1, "text": "My daughter comes to every appointment because the words go by too fast for me. She writes them down and at home we look them up together until they make sense."},
            {"id": "p3-2", "order_index": 2, "text": "The first time, I stopped the medication when I started to feel better. I thought that was the instruction. Nobody asked me to repeat the plan back, so nobody knew I had it wrong."},
            {"id": "p3-3", "order_index": 3, "text": "I am not slow. I just need it in plain language and a little time. When the pharmacist drew a simple picture, the whole thing finally made sense."},
        ],
    },
]

# ── Worked annotations ────────────────────────────────────────────────────────
# Each entry: a human annotation + the local-AI second opinion + the human
# decision that resolved it. `quote` must be a verbatim substring of the
# paragraph; character offsets are computed at seed time.

ANNOTATIONS = [
    # SP-01 — Reluctant Discloser
    {"id": "ann-sp01-01", "source_id": "T-DEMO-001", "paragraph_id": "p1", "ontology": "emotion-hesitation",
     "quote": "I waited until the pain was bad before I told anyone", "confidence": 91,
     "note": "Delays disclosure to avoid seeming dramatic; actively minimizes symptom severity.",
     "decision": "accepted", "decision_note": "Clear, well-evidenced.",
     "ai_conf": 88, "ai_suggestion": "Hesitates to disclose symptoms",
     "ai_rationale": "'Waited until the pain was bad' before telling anyone is a canonical delayed-disclosure marker."},
    {"id": "ann-sp01-02", "source_id": "T-DEMO-001", "paragraph_id": "p1", "ontology": "communication-indirect",
     "quote": "I smiled and said I was fine", "confidence": 84,
     "note": "Masks distress with reassurance; the verbal report contradicts the internal state.",
     "decision": "accepted", "decision_note": "Distinct from hesitation — this is the masking behavior itself.",
     "ai_conf": 80, "ai_suggestion": "Indirect communication",
     "ai_rationale": "Reassuring speech ('I was fine') paired with a smile masks the true concern."},
    {"id": "ann-sp01-03", "source_id": "T-DEMO-001", "paragraph_id": "p2", "ontology": "support-family",
     "quote": "My sister noticed and helped me ask about the next steps", "confidence": 86,
     "note": "Sister scaffolds the question-asking the patient cannot initiate alone.",
     "decision": "accepted", "decision_note": "Support role is explicit and load-bearing.",
     "ai_conf": 84, "ai_suggestion": "Family support system",
     "ai_rationale": "A named family member actively enables navigation of next steps."},
    {"id": "ann-sp01-04", "source_id": "T-DEMO-001", "paragraph_id": "p3", "ontology": "literacy-medical",
     "quote": "words I had heard before but did not really understand", "confidence": 82,
     "note": "Recognition without comprehension; explicitly wants teach-back.",
     "decision": "accepted", "decision_note": "Good example of recognition-vs-comprehension gap.",
     "ai_conf": 79, "ai_suggestion": "Medical literacy gap",
     "ai_rationale": "Familiar-but-not-understood vocabulary indicates a comprehension gap, not an access gap."},

    # SP-02 — Guarded Navigator
    {"id": "ann-sp02-01", "source_id": "T-DEMO-002", "paragraph_id": "p2-1", "ontology": "healthcare-trust",
     "quote": "I felt like a person and not a chart", "confidence": 88,
     "note": "Frames prior care as depersonalizing; low institutional trust is the driver, not hostility.",
     "decision": "accepted", "decision_note": "Person-vs-chart contrast is the trust marker.",
     "ai_conf": 82, "ai_suggestion": "Healthcare trust barrier",
     "ai_rationale": "'Person, not a chart' is a textbook depersonalization / eroded-trust signal."},
    {"id": "ann-sp02-02", "source_id": "T-DEMO-002", "paragraph_id": "p2-2", "ontology": "goals-autonomy",
     "quote": "I need to be the one who makes the final decision", "confidence": 92,
     "note": "Explicit autonomy goal; cooperation is conditional on being given the choice.",
     "decision": "accepted", "decision_note": "Direct first-person statement of decisional control.",
     "ai_conf": 90, "ai_suggestion": "Autonomy goal",
     "ai_rationale": "First-person insistence on holding the final decision — high confidence."},
    {"id": "ann-sp02-03", "source_id": "T-DEMO-002", "paragraph_id": "p2-3", "ontology": "values-dignity",
     "quote": "It is the only way I feel safe in there", "confidence": 79,
     "note": "Self-tracking is a dignity-and-safety strategy in a low-trust setting, not mistrust for its own sake.",
     "decision": "accepted", "decision_note": "Reviewer overrode the AI's Autonomy suggestion — the driver here is safety and respect, not control.",
     "ai_conf": 68, "ai_suggestion": "Autonomy goal",
     "ai_rationale": "Self-kept records could read as a control/autonomy behavior.",
     "ai_ontology": "goals-autonomy", "ai_decision": "rejected"},

    # SP-03 — Plain-Language Seeker
    {"id": "ann-sp03-01", "source_id": "T-DEMO-003", "paragraph_id": "p3-1", "ontology": "support-family",
     "quote": "My daughter comes to every appointment", "confidence": 90,
     "note": "Daughter is a consistent comprehension-and-navigation support at the point of care.",
     "decision": "accepted", "decision_note": "Consistent, load-bearing support.",
     "ai_conf": 87, "ai_suggestion": "Family support system",
     "ai_rationale": "Attends every appointment and co-processes information at home."},
    {"id": "ann-sp03-02", "source_id": "T-DEMO-003", "paragraph_id": "p3-2", "ontology": "literacy-medical",
     "quote": "Nobody asked me to repeat the plan back", "confidence": 85,
     "note": "Missing teach-back caused a real adherence error (stopped medication early).",
     "decision": "accepted", "decision_note": "Ties a literacy gap to a concrete safety outcome.",
     "ai_conf": 83, "ai_suggestion": "Medical literacy gap",
     "ai_rationale": "Absence of teach-back led to misunderstanding the stop criteria."},
    {"id": "ann-sp03-03", "source_id": "T-DEMO-003", "paragraph_id": "p3-3", "ontology": "values-dignity",
     "quote": "I am not slow. I just need it in plain language", "confidence": 88,
     "note": "Asserts dignity; the gap is in delivery, not in the patient's capacity.",
     "decision": "merged", "decision_note": "Kept Dignity as primary and merged the AI's literacy read as a linked secondary trait.",
     "ai_conf": 72, "ai_suggestion": "Medical literacy gap",
     "ai_rationale": "Request for plain language also signals a literacy-delivery gap.",
     "ai_ontology": "literacy-medical"},
]

# ── Compiled synthetic-patient profiles ───────────────────────────────────────

PROFILES = [
    {"id": "pc-sp-01", "name": "SP-01 — Reluctant Discloser", "source_id": "T-DEMO-001",
     "annotation_ids": ["ann-sp01-01", "ann-sp01-02", "ann-sp01-03", "ann-sp01-04"],
     "scenario": "Primary-care visit for escalating abdominal pain the patient has minimized for weeks.",
     "learning_objective": "Elicit concerns from a patient who minimizes symptoms and defers to family."},
    {"id": "pc-sp-02", "name": "SP-02 — Guarded Navigator", "source_id": "T-DEMO-002",
     "annotation_ids": ["ann-sp02-01", "ann-sp02-02", "ann-sp02-03"],
     "scenario": "Follow-up visit to review a new medication the patient is hesitant to start.",
     "learning_objective": "Build trust and shared decision-making with a patient who needs to retain control."},
    {"id": "pc-sp-03", "name": "SP-03 — Plain-Language Seeker", "source_id": "T-DEMO-003",
     "annotation_ids": ["ann-sp03-01", "ann-sp03-02", "ann-sp03-03"],
     "scenario": "Discharge teaching for a multi-step medication regimen, caregiver present.",
     "learning_objective": "Practice teach-back and plain-language communication with a caregiver in the room."},
]


def seed_demo_data(db: Session) -> None:
    _seed_reference_data(db)
    if db.get(Annotation, MARKER_ANNOTATION_ID) is None:
        _seed_worked_example(db)
    db.commit()


def _seed_reference_data(db: Session) -> None:
    """Ontology, project, reviewer, sources, and paragraphs (idempotent)."""
    for node_data in ONTOLOGY_NODES:
        if not db.get(OntologyNode, node_data["id"]):
            db.add(OntologyNode(**node_data))

    if not db.get(Project, DEMO_PROJECT_ID):
        db.add(Project(id=DEMO_PROJECT_ID, name="ANNI Demo", description="Demonstration project with synthetic patient testimony and worked profiles."))

    if not db.get(User, DEMO_REVIEWER_ID):
        db.add(User(id=DEMO_REVIEWER_ID, email="reviewer@anni.local", name="Demo Reviewer", role="annotator"))

    for source in SOURCES:
        if not db.get(Source, source["id"]):
            db.add(Source(
                id=source["id"],
                project_id=DEMO_PROJECT_ID,
                title=source["title"],
                author=source["author"],
                publication=source["publication"],
                canonical_url=source["canonical_url"],
                license_status=source["license_status"],
                allow_list_status=source["allow_list_status"],
                version=source["version"],
            ))
            for para in source["paragraphs"]:
                db.add(Paragraph(id=para["id"], source_id=source["id"], order_index=para["order_index"], text=para["text"]))
    db.flush()


def _seed_worked_example(db: Session) -> None:
    """Read confirmations, annotations, AI suggestions, decisions, compiled
    profiles, and the audit chain that ties them together."""
    paragraphs = {p.id: p for p in db.scalars(select(Paragraph)).all()}

    # One read confirmation per source — the reading gate, satisfied.
    confirmations: dict[str, ReadConfirmation] = {}
    for source in SOURCES:
        confirmation = ReadConfirmation(
            source_id=source["id"],
            reviewer_id=DEMO_REVIEWER_ID,
            statement="I confirm I personally read this testimony and these annotations reflect my own judgment.",
        )
        db.add(confirmation)
        db.flush()
        confirmations[source["id"]] = confirmation
        write_audit_event(db, DEMO_REVIEWER_ID, "read_confirmation", confirmation.id, "created",
                          {"source_id": source["id"], "reviewer_id": DEMO_REVIEWER_ID})

    # Annotations + AI second opinion + human decision.
    for spec in ANNOTATIONS:
        paragraph = paragraphs[spec["paragraph_id"]]
        start = paragraph.text.index(spec["quote"])
        end = start + len(spec["quote"])
        approved = spec["decision"] in {"accepted", "merged"}

        annotation = Annotation(
            id=spec["id"],
            project_id=DEMO_PROJECT_ID,
            paragraph_id=spec["paragraph_id"],
            ontology_node_id=spec["ontology"],
            reviewer_id=DEMO_REVIEWER_ID,
            evidence_quote=spec["quote"],
            character_start=start,
            character_end=end,
            confidence=spec["confidence"],
            note=spec["note"],
            status="approved" if approved else "submitted",
        )
        db.add(annotation)
        db.flush()
        write_audit_event(db, DEMO_REVIEWER_ID, "annotation", annotation.id, "created",
                          {"ontology_node_id": spec["ontology"], "confidence": spec["confidence"], "quote": spec["quote"]})

        suggestion = AISuggestion(
            annotation_id=annotation.id,
            agent_name="ANNI-Reviewer",
            model_name="llama3",
            ontology_node_id=spec.get("ai_ontology", spec["ontology"]),
            confidence=spec["ai_conf"],
            evidence_quote=spec["quote"],
            suggestion=spec["ai_suggestion"],
            rationale=spec["ai_rationale"],
            decision=spec.get("ai_decision", spec["decision"]),
        )
        db.add(suggestion)
        db.flush()
        write_audit_event(db, "ANNI-Reviewer", "ai_suggestion", suggestion.id, "created",
                          {"annotation_id": annotation.id, "confidence": spec["ai_conf"], "suggestion": spec["ai_suggestion"]})

        decision = AnnotationDecision(
            annotation_id=annotation.id,
            decision=spec["decision"],
            decision_note=spec["decision_note"],
            decided_by=DEMO_REVIEWER_ID,
        )
        db.add(decision)
        db.flush()
        write_audit_event(db, DEMO_REVIEWER_ID, "annotation", annotation.id, "decision_recorded",
                          {"decision": spec["decision"], "note": spec["decision_note"]})

    # Compile the approved annotations of each profile into a system prompt.
    for profile in PROFILES:
        annotations = db.scalars(
            select(Annotation).where(
                Annotation.id.in_(profile["annotation_ids"]),
                Annotation.status == "approved",
            )
        ).all()
        if not annotations:
            continue
        system_prompt, ontology_version = compile_system_prompt(
            db, list(annotations), profile["scenario"], profile["learning_objective"]
        )
        compilation = PromptCompilation(
            id=profile["id"],
            project_id=DEMO_PROJECT_ID,
            name=profile["name"],
            system_prompt=system_prompt,
            ontology_version=ontology_version,
            compiler_version=COMPILER_VERSION,
            created_by=DEMO_REVIEWER_ID,
        )
        db.add(compilation)
        db.flush()
        for annotation in annotations:
            db.add(PromptCompilationAnnotation(compilation_id=compilation.id, annotation_id=annotation.id))
        write_audit_event(db, DEMO_REVIEWER_ID, "prompt_compilation", compilation.id, "created",
                          {"annotation_ids": [a.id for a in annotations], "compiler_version": COMPILER_VERSION, "ontology_version": ontology_version})
