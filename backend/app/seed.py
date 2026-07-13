from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import OntologyNode, Paragraph, Project, Source

DEMO_PROJECT_ID = "proj-anni-demo"
DEMO_SOURCE_ID = "T-DEMO-001"

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

DEMO_PARAGRAPHS = [
    {"id": "p1", "order_index": 1, "text": "I waited until the pain was bad before I told anyone. I kept thinking it would sound dramatic if I complained again, so I smiled and said I was fine."},
    {"id": "p2", "order_index": 2, "text": "When the nurse asked direct questions I answered, but I did not know how to explain what scared me most. My sister noticed and helped me ask about the next steps."},
    {"id": "p3", "order_index": 3, "text": "The printed instructions were full of words I had heard before but did not really understand. I wanted someone to slow down and make sure I could repeat the plan back."},
]


def seed_demo_data(db: Session) -> None:
    for node_data in ONTOLOGY_NODES:
        existing = db.scalar(select(OntologyNode).where(OntologyNode.id == node_data["id"]))
        if not existing:
            db.add(OntologyNode(**node_data))

    if not db.get(Project, DEMO_PROJECT_ID):
        db.add(Project(id=DEMO_PROJECT_ID, name="ANNI Demo", description="Demonstration project with sample patient testimony."))

    if not db.get(Source, DEMO_SOURCE_ID):
        db.add(Source(
            id=DEMO_SOURCE_ID,
            project_id=DEMO_PROJECT_ID,
            title="Public testimony demonstration",
            canonical_url="https://example.org/testimony-demo",
            license_status="demo-only",
            allow_list_status="approved",
            version="1",
        ))
        for para in DEMO_PARAGRAPHS:
            db.add(Paragraph(source_id=DEMO_SOURCE_ID, **para))

    db.commit()
