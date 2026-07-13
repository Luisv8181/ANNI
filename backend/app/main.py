from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.models import Annotation, AnnotationDecision, Base, PromptCompilation, PromptCompilationAnnotation, ReadConfirmation
from app.provenance import COMPILER_VERSION, citation_report, compile_system_prompt, write_audit_event
from app.schemas import AnnotationCreate, PromptCompilationCreate, ReadConfirmationCreate, ReviewDecision


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="ANNI API",
    description="Local-first annotation and provenance API for Artificial Neural Annotation Intelligence.",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/read-confirmations")
def create_read_confirmation(payload: ReadConfirmationCreate, db: Session = Depends(get_db)) -> dict[str, object]:
    confirmation = ReadConfirmation(**payload.model_dump())
    db.add(confirmation)
    db.flush()
    write_audit_event(db, payload.reviewer_id, "read_confirmation", confirmation.id, "created", payload.model_dump())
    db.commit()
    return {"id": confirmation.id, "confirmed_at": confirmation.confirmed_at}


@app.post("/annotations")
def create_annotation(payload: AnnotationCreate, db: Session = Depends(get_db)) -> dict[str, object]:
    confirmation = db.get(ReadConfirmation, payload.read_confirmation_id)
    if not confirmation or confirmation.reviewer_id != payload.reviewer_id:
        raise HTTPException(status_code=422, detail="A valid personal-reading confirmation is required.")
    annotation = Annotation(
        project_id=payload.project_id,
        paragraph_id=payload.evidence.paragraph_id,
        ontology_node_id=payload.ontology_node_id,
        reviewer_id=payload.reviewer_id,
        evidence_quote=payload.evidence.quote,
        character_start=payload.evidence.character_start,
        character_end=payload.evidence.character_end,
        confidence=payload.confidence,
        note=payload.note,
    )
    db.add(annotation)
    db.flush()
    write_audit_event(db, payload.reviewer_id, "annotation", annotation.id, "created", payload.model_dump(mode="json"))
    db.commit()
    return {"id": annotation.id, "status": annotation.status, "citation": citation_report(db, annotation)}


@app.post("/annotations/{annotation_id}/decisions")
def decide_annotation(annotation_id: str, payload: ReviewDecision, db: Session = Depends(get_db)) -> dict[str, object]:
    annotation = db.get(Annotation, annotation_id)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found.")
    decision = AnnotationDecision(
        annotation_id=annotation_id,
        decision=payload.decision,
        decision_note=payload.review_note,
        decided_by=payload.decided_by,
        created_at=payload.decided_at,
    )
    db.add(decision)
    annotation.status = "approved" if payload.decision in {"accepted", "merged"} else annotation.status
    db.flush()
    write_audit_event(db, payload.decided_by, "annotation", annotation_id, "decision_recorded", payload.model_dump(mode="json"))
    db.commit()
    return {"decision_id": decision.id, "citation": citation_report(db, annotation)}


@app.get("/annotations/{annotation_id}/citation")
def get_annotation_citation(annotation_id: str, db: Session = Depends(get_db)) -> dict:
    annotation = db.get(Annotation, annotation_id)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found.")
    return citation_report(db, annotation)


@app.post("/prompt-compilations")
def create_prompt_compilation(payload: PromptCompilationCreate, db: Session = Depends(get_db)) -> dict[str, object]:
    annotations = db.scalars(select(Annotation).where(Annotation.id.in_(payload.annotation_ids), Annotation.status == "approved")).all()
    if len(annotations) != len(payload.annotation_ids):
        raise HTTPException(status_code=422, detail="Prompt compilation accepts only approved annotations.")
    try:
        system_prompt, ontology_version = compile_system_prompt(db, annotations, payload.scenario, payload.learning_objective)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    compilation = PromptCompilation(
        project_id=payload.project_id,
        name=payload.name,
        system_prompt=system_prompt,
        ontology_version=ontology_version,
        compiler_version=COMPILER_VERSION,
        created_by=payload.created_by,
    )
    db.add(compilation)
    db.flush()
    for annotation in annotations:
        db.add(PromptCompilationAnnotation(compilation_id=compilation.id, annotation_id=annotation.id))
    write_audit_event(
        db,
        payload.created_by,
        "prompt_compilation",
        compilation.id,
        "created",
        {"annotation_ids": payload.annotation_ids, "compiler_version": COMPILER_VERSION, "ontology_version": ontology_version},
    )
    db.commit()
    return {
        "id": compilation.id,
        "name": compilation.name,
        "system_prompt": compilation.system_prompt,
        "compiler_version": compilation.compiler_version,
        "citations": [citation_report(db, annotation) for annotation in annotations],
    }
