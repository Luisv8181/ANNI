import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal, get_db

logger = logging.getLogger(__name__)
from app.models import (
    AISuggestion,
    Annotation,
    AnnotationDecision,
    AuditLog,
    OntologyNode,
    Paragraph,
    Project,
    PromptCompilation,
    PromptCompilationAnnotation,
    ReadConfirmation,
    Source,
)
from app.ingest import compute_content_hash, segment_into_paragraphs
from app.ollama import run_ollama_review
from app.provenance import COMPILER_VERSION, citation_report, compile_system_prompt, write_audit_event
from app.synthetic_lab import (
    DEFAULT_OUTCOME,
    DEFAULT_RISK,
    OUTCOME_MODES,
    RISK_LEVELS,
    build_patient_system_prompt,
    generate_patient_reply,
)
from app.schemas import (
    AISuggestionOut,
    AnnotationCreate,
    AnnotationOut,
    AnnotationStatsOut,
    AuditLogOut,
    GeneratePromptRequest,
    GeneratePromptResponse,
    IngestResult,
    LabeledCount,
    DecisionOut,
    OntologyNodeOut,
    ParagraphOut,
    LabChatRequest,
    LabChatResponse,
    LabConfigOut,
    LabOutcomeModeOut,
    LabProfileOut,
    LabRiskLevelOut,
    ProjectOut,
    PromptCompilationCreate,
    PromptCompilationOut,
    ReadConfirmationCreate,
    ReadConfirmationOut,
    ReviewDecision,
    SourceIngest,
    SourceOut,
    TraitCount,
)
from app.seed import seed_demo_data


@asynccontextmanager
async def lifespan(_: FastAPI):
    cfg = get_settings()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    # Check Ollama is reachable and the configured model is available
    try:
        resp = httpx.get(f"{cfg.ollama_url}/api/tags", timeout=5.0)
        resp.raise_for_status()
        available = [m["name"] for m in resp.json().get("models", [])]
        match = any(cfg.ollama_model in name for name in available)
        if match:
            logger.info("Ollama ready — model '%s' available. Models: %s", cfg.ollama_model, available)
        else:
            logger.warning(
                "Ollama is running but model '%s' was not found. Available: %s. "
                "Run: ollama pull %s",
                cfg.ollama_model, available, cfg.ollama_model,
            )
    except Exception as exc:
        logger.warning("Ollama not reachable at %s: %s. AI review will be skipped.", cfg.ollama_url, exc)
    yield


app = FastAPI(
    title="ANNI API",
    description="Local-first annotation and provenance API for Artificial Neural Annotation Intelligence.",
    version="0.2.0",
    lifespan=lifespan,
)

cfg = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ── Ontology ─────────────────────────────────────────────────────────────────

@app.get("/ontology-nodes", response_model=list[OntologyNodeOut])
def list_ontology_nodes(db: Session = Depends(get_db)):
    return db.scalars(select(OntologyNode).order_by(OntologyNode.group, OntologyNode.label)).all()


# ── Projects ─────────────────────────────────────────────────────────────────

@app.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.scalars(select(Project).order_by(Project.created_at)).all()


# ── Sources ──────────────────────────────────────────────────────────────────

@app.get("/sources", response_model=list[SourceOut])
def list_sources(project_id: str | None = Query(None), db: Session = Depends(get_db)):
    query = select(Source)
    if project_id:
        query = query.where(Source.project_id == project_id)
    return db.scalars(query.order_by(Source.created_at)).all()


@app.get("/sources/{source_id}/paragraphs", response_model=list[ParagraphOut])
def list_paragraphs(source_id: str, db: Session = Depends(get_db)):
    return db.scalars(
        select(Paragraph).where(Paragraph.source_id == source_id).order_by(Paragraph.order_index)
    ).all()


@app.post("/sources/ingest", response_model=IngestResult)
def ingest_source(payload: SourceIngest, db: Session = Depends(get_db)):
    """Ingest a raw source: cite it, segment it into paragraphs, and store it for the Lab Reader."""
    paragraphs_text = segment_into_paragraphs(payload.raw_text)
    if not paragraphs_text:
        raise HTTPException(status_code=422, detail="No readable text found in the source.")

    content_hash = compute_content_hash(payload.raw_text)
    source = Source(
        project_id=payload.project_id,
        title=payload.title,
        author=payload.author,
        publication=payload.publication,
        canonical_url=payload.canonical_url,
        license_status=payload.license_status,
        allow_list_status="pending",
        content_hash=content_hash,
        version="1",
    )
    db.add(source)
    db.flush()

    paragraph_rows = []
    for index, text in enumerate(paragraphs_text, start=1):
        paragraph = Paragraph(source_id=source.id, order_index=index, text=text)
        db.add(paragraph)
        paragraph_rows.append(paragraph)
    db.flush()

    write_audit_event(
        db, "ingestion", "source", source.id, "ingested",
        {"title": payload.title, "paragraphs": len(paragraph_rows), "content_hash": content_hash, "license_status": payload.license_status},
    )
    db.commit()
    db.refresh(source)
    for paragraph in paragraph_rows:
        db.refresh(paragraph)
    return IngestResult(source=source, paragraphs=paragraph_rows, content_hash=content_hash)


# ── Read confirmations ────────────────────────────────────────────────────────

@app.post("/read-confirmations", response_model=ReadConfirmationOut)
def create_read_confirmation(payload: ReadConfirmationCreate, db: Session = Depends(get_db)):
    confirmation = ReadConfirmation(**payload.model_dump())
    db.add(confirmation)
    db.flush()
    write_audit_event(db, payload.reviewer_id, "read_confirmation", confirmation.id, "created", payload.model_dump())
    db.commit()
    db.refresh(confirmation)
    return confirmation


# ── Annotations ───────────────────────────────────────────────────────────────

def _annotation_out(annotation: Annotation, db: Session) -> AnnotationOut:
    decisions = db.scalars(
        select(AnnotationDecision)
        .where(AnnotationDecision.annotation_id == annotation.id)
        .order_by(AnnotationDecision.created_at)
    ).all()
    ontology = db.get(OntologyNode, annotation.ontology_node_id)
    return AnnotationOut(
        id=annotation.id,
        project_id=annotation.project_id,
        paragraph_id=annotation.paragraph_id,
        ontology_node_id=annotation.ontology_node_id,
        reviewer_id=annotation.reviewer_id,
        evidence_quote=annotation.evidence_quote,
        confidence=annotation.confidence,
        note=annotation.note,
        status=annotation.status,
        created_at=annotation.created_at,
        ontology_label=ontology.label if ontology else None,
        decisions=[
            DecisionOut(
                id=d.id,
                decision=d.decision,
                decision_note=d.decision_note,
                decided_by=d.decided_by,
                created_at=d.created_at,
            )
            for d in decisions
        ],
    )


@app.get("/annotations", response_model=list[AnnotationOut])
def list_annotations(project_id: str | None = Query(None), db: Session = Depends(get_db)):
    query = select(Annotation)
    if project_id:
        query = query.where(Annotation.project_id == project_id)
    annotations = db.scalars(query.order_by(Annotation.created_at.desc())).all()
    return [_annotation_out(a, db) for a in annotations]


@app.get("/annotation-stats", response_model=AnnotationStatsOut)
def annotation_stats(project_id: str | None = Query(None), db: Session = Depends(get_db)):
    """How we annotate: trait distribution, confidence, decisions, and AI agreement."""
    query = select(Annotation)
    if project_id:
        query = query.where(Annotation.project_id == project_id)
    annotations = db.scalars(query).all()

    total = len(annotations)
    approved = sum(1 for a in annotations if a.status == "approved")
    submitted = total - approved
    avg_confidence = round(sum(a.confidence for a in annotations) / total, 1) if total else 0.0
    reviewers = len({a.reviewer_id for a in annotations})

    trait_counts: dict[str, int] = {}
    for annotation in annotations:
        trait_counts[annotation.ontology_node_id] = trait_counts.get(annotation.ontology_node_id, 0) + 1
    by_trait = []
    for node_id, count in sorted(trait_counts.items(), key=lambda item: item[1], reverse=True):
        node = db.get(OntologyNode, node_id)
        by_trait.append(TraitCount(ontology_node_id=node_id, label=node.label if node else node_id, count=count))

    decision_counts: dict[str, int] = {}
    ai_reviewed = 0
    ai_agreements = 0
    for annotation in annotations:
        for decision in db.scalars(
            select(AnnotationDecision).where(AnnotationDecision.annotation_id == annotation.id)
        ).all():
            decision_counts[decision.decision] = decision_counts.get(decision.decision, 0) + 1
        suggestion = db.scalar(select(AISuggestion).where(AISuggestion.annotation_id == annotation.id))
        if suggestion:
            ai_reviewed += 1
            if suggestion.ontology_node_id == annotation.ontology_node_id:
                ai_agreements += 1
    by_decision = [
        LabeledCount(label=label, count=count)
        for label, count in sorted(decision_counts.items(), key=lambda item: item[1], reverse=True)
    ]

    return AnnotationStatsOut(
        total=total,
        approved=approved,
        submitted=submitted,
        avg_confidence=avg_confidence,
        reviewers=reviewers,
        ai_reviewed=ai_reviewed,
        ai_agreements=ai_agreements,
        by_trait=by_trait,
        by_decision=by_decision,
    )


@app.post("/annotations", response_model=AnnotationOut)
def create_annotation(payload: AnnotationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    confirmation = db.get(ReadConfirmation, payload.read_confirmation_id)
    if not confirmation or confirmation.reviewer_id != payload.reviewer_id:
        raise HTTPException(status_code=422, detail="A valid personal-reading confirmation is required.")
    if confirmation.source_id != payload.evidence.source_id:
        raise HTTPException(status_code=422, detail="Read confirmation source does not match the annotation source.")
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
    background_tasks.add_task(run_ollama_review, annotation.id)
    return _annotation_out(annotation, db)


@app.post("/annotations/{annotation_id}/decisions", response_model=AnnotationOut)
def decide_annotation(annotation_id: str, payload: ReviewDecision, db: Session = Depends(get_db)):
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
    if payload.decision in {"accepted", "merged"}:
        annotation.status = "approved"
    db.flush()
    write_audit_event(db, payload.decided_by, "annotation", annotation_id, "decision_recorded", payload.model_dump(mode="json"))
    db.commit()
    return _annotation_out(annotation, db)


@app.get("/annotations/{annotation_id}/citation")
def get_annotation_citation(annotation_id: str, db: Session = Depends(get_db)) -> dict:
    annotation = db.get(Annotation, annotation_id)
    if not annotation:
        raise HTTPException(status_code=404, detail="Annotation not found.")
    return citation_report(db, annotation)


@app.get("/annotations/{annotation_id}/suggestions", response_model=list[AISuggestionOut])
def list_suggestions(annotation_id: str, db: Session = Depends(get_db)):
    return db.scalars(
        select(AISuggestion)
        .where(AISuggestion.annotation_id == annotation_id)
        .order_by(AISuggestion.created_at)
    ).all()


@app.post("/annotations/{annotation_id}/suggestions/{suggestion_id}/decide", response_model=AISuggestionOut)
def decide_suggestion(annotation_id: str, suggestion_id: str, payload: ReviewDecision, db: Session = Depends(get_db)):
    suggestion = db.get(AISuggestion, suggestion_id)
    if not suggestion or suggestion.annotation_id != annotation_id:
        raise HTTPException(status_code=404, detail="Suggestion not found.")
    suggestion.decision = payload.decision
    db.flush()
    write_audit_event(db, payload.decided_by, "ai_suggestion", suggestion_id, "decision_recorded", payload.model_dump(mode="json"))
    db.commit()
    db.refresh(suggestion)
    return suggestion


# ── Prompt compilations ───────────────────────────────────────────────────────

@app.get("/prompt-compilations", response_model=list[PromptCompilationOut])
def list_prompt_compilations(project_id: str | None = Query(None), db: Session = Depends(get_db)):
    query = select(PromptCompilation)
    if project_id:
        query = query.where(PromptCompilation.project_id == project_id)
    compilations = db.scalars(query.order_by(PromptCompilation.created_at)).all()
    result = []
    for compilation in compilations:
        annotation_ids = db.scalars(
            select(PromptCompilationAnnotation.annotation_id).where(
                PromptCompilationAnnotation.compilation_id == compilation.id
            )
        ).all()
        result.append(
            PromptCompilationOut(
                id=compilation.id,
                project_id=compilation.project_id,
                name=compilation.name,
                system_prompt=compilation.system_prompt,
                ontology_version=compilation.ontology_version,
                compiler_version=compilation.compiler_version,
                created_by=compilation.created_by,
                created_at=compilation.created_at,
                annotation_ids=list(annotation_ids),
            )
        )
    return result


@app.post("/prompt-compilations")
def create_prompt_compilation(payload: PromptCompilationCreate, db: Session = Depends(get_db)) -> dict[str, object]:
    annotations = db.scalars(
        select(Annotation).where(Annotation.id.in_(payload.annotation_ids), Annotation.status == "approved")
    ).all()
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


# ── Synthetic Patient Lab ─────────────────────────────────────────────────────

def _profile_traits(db: Session, compilation: PromptCompilation) -> list[tuple[str, str]]:
    """(ontology label, reviewer note) for each annotation in a compiled profile."""
    annotation_ids = db.scalars(
        select(PromptCompilationAnnotation.annotation_id).where(
            PromptCompilationAnnotation.compilation_id == compilation.id
        )
    ).all()
    traits: list[tuple[str, str]] = []
    for annotation_id in annotation_ids:
        annotation = db.get(Annotation, annotation_id)
        if not annotation:
            continue
        ontology = db.get(OntologyNode, annotation.ontology_node_id)
        traits.append((ontology.label if ontology else "Trait", annotation.note))
    return traits


@app.get("/synthetic-lab/config", response_model=LabConfigOut)
def synthetic_lab_config(project_id: str | None = Query(None), db: Session = Depends(get_db)):
    """The profile library + available risk levels for the lab."""
    query = select(PromptCompilation)
    if project_id:
        query = query.where(PromptCompilation.project_id == project_id)
    compilations = db.scalars(query.order_by(PromptCompilation.created_at)).all()
    profiles = [
        LabProfileOut(id=c.id, name=c.name, trait_count=len(_profile_traits(db, c)))
        for c in compilations
    ]
    risk_levels = [
        LabRiskLevelOut(id=key, label=value["label"], blurb=value["blurb"])
        for key, value in RISK_LEVELS.items()
    ]
    outcome_modes = [
        LabOutcomeModeOut(id=key, label=value["label"], blurb=value["blurb"])
        for key, value in OUTCOME_MODES.items()
    ]
    return LabConfigOut(
        profiles=profiles, risk_levels=risk_levels, outcome_modes=outcome_modes, model_name=cfg.ollama_model
    )


@app.post("/synthetic-lab/generate-prompt", response_model=GeneratePromptResponse)
def generate_profile_prompt(payload: GeneratePromptRequest, db: Session = Depends(get_db)):
    """Compile a set of annotations into a pasteable synthetic-patient system prompt."""
    traits: list[tuple[str, str]] = []
    for annotation_id in payload.annotation_ids:
        annotation = db.get(Annotation, annotation_id)
        if not annotation:
            continue
        ontology = db.get(OntologyNode, annotation.ontology_node_id)
        traits.append((ontology.label if ontology else "Trait", annotation.note))
    if not traits:
        raise HTTPException(status_code=422, detail="No annotations to compile into a profile.")

    risk = payload.risk_level if payload.risk_level in RISK_LEVELS else DEFAULT_RISK
    outcome = payload.outcome_mode if payload.outcome_mode in OUTCOME_MODES else DEFAULT_OUTCOME
    system_prompt = build_patient_system_prompt(
        persona_name=payload.persona_name,
        traits=traits,
        risk_level=risk,
        cue=payload.cue,
        outcome_mode=outcome,
        include_dsm5=payload.include_dsm5,
    )
    return GeneratePromptResponse(
        persona_name=payload.persona_name,
        system_prompt=system_prompt,
        trait_count=len(traits),
        outcome_mode=outcome,
        risk_level=risk,
    )


@app.post("/synthetic-lab/message", response_model=LabChatResponse)
def synthetic_lab_message(payload: LabChatRequest, db: Session = Depends(get_db)):
    """Generate the simulated patient's next message via a local Ollama model."""
    compilation = db.get(PromptCompilation, payload.compilation_id)
    if not compilation:
        raise HTTPException(status_code=404, detail="Profile not found.")
    if payload.risk_level not in RISK_LEVELS:
        payload.risk_level = DEFAULT_RISK
    if payload.outcome_mode not in OUTCOME_MODES:
        payload.outcome_mode = DEFAULT_OUTCOME

    traits = _profile_traits(db, compilation)
    system_prompt = build_patient_system_prompt(
        persona_name=compilation.name,
        traits=traits,
        risk_level=payload.risk_level,
        cue=payload.cue,
        outcome_mode=payload.outcome_mode,
    )
    messages = [{"role": m.role, "content": m.content} for m in payload.messages]
    try:
        reply = generate_patient_reply(system_prompt, messages)
    except Exception as exc:  # Ollama unreachable / model missing / bad response
        logger.warning("Synthetic lab generation failed: %s", exc)
        raise HTTPException(
            status_code=503,
            detail=(
                f"The patient model (Ollama) isn't reachable at {cfg.ollama_url}. "
                f"Start Ollama and pull the model (ollama pull {cfg.ollama_model}) to run the lab."
            ),
        ) from exc

    return LabChatResponse(
        reply=reply,
        model_name=cfg.ollama_model,
        persona_name=compilation.name,
        risk_level=payload.risk_level,
        outcome_mode=payload.outcome_mode,
    )


# ── Audit log ─────────────────────────────────────────────────────────────────

@app.get("/audit-log", response_model=list[AuditLogOut])
def list_audit_log(limit: int = Query(50, le=200), offset: int = Query(0), db: Session = Depends(get_db)):
    return db.scalars(
        select(AuditLog).order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    ).all()
