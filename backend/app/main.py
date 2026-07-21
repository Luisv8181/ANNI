import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
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
    Score,
    ScoringItem,
    Source,
)
from app.assist import suggest_trait
from app.ingest import (
    compute_content_hash,
    extract_html_title,
    extract_pdf_text,
    segment_into_paragraphs,
    strip_html,
)
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
    AssistRequest,
    AssistResponse,
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
    ScoreCreate,
    ScoreOut,
    ScoringItemBlind,
    ScoringItemCreate,
    ScoringItemsCreated,
    ScoringItemsFromConversation,
    ScoringResults,
    ConditionScore,
    SourceIngest,
    SourceIngestUrl,
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


@app.post("/annotation-assist", response_model=AssistResponse)
def annotation_assist(payload: AssistRequest, db: Session = Depends(get_db)):
    """Model-backed trait suggestion for a highlight. Returns available=false if Ollama is down."""
    ontology = db.scalars(select(OntologyNode)).all()
    result = suggest_trait(payload.quote, payload.paragraph, list(ontology))
    if not result:
        return AssistResponse(available=False)
    node = db.get(OntologyNode, result["ontology_node_id"])
    return AssistResponse(
        available=True,
        ontology_node_id=result["ontology_node_id"],
        label=node.label if node else result["ontology_node_id"],
        confidence=result["confidence"],
        rationale=result["rationale"],
        model_name=cfg.ollama_model,
    )


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


def _ingest_text(
    db: Session,
    *,
    project_id: str,
    title: str,
    raw_text: str,
    author: str | None = None,
    publication: str | None = None,
    canonical_url: str | None = None,
    license_status: str = "unverified",
) -> IngestResult:
    paragraphs_text = segment_into_paragraphs(raw_text)
    if not paragraphs_text:
        raise HTTPException(status_code=422, detail="No readable text found in the source.")

    content_hash = compute_content_hash(raw_text)
    source = Source(
        project_id=project_id,
        title=title,
        author=author,
        publication=publication,
        canonical_url=canonical_url,
        license_status=license_status,
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
        {"title": title, "paragraphs": len(paragraph_rows), "content_hash": content_hash, "license_status": license_status},
    )
    db.commit()
    db.refresh(source)
    for paragraph in paragraph_rows:
        db.refresh(paragraph)
    return IngestResult(source=source, paragraphs=paragraph_rows, content_hash=content_hash)


@app.post("/sources/ingest", response_model=IngestResult)
def ingest_source(payload: SourceIngest, db: Session = Depends(get_db)):
    """Ingest pasted text: cite it, segment it into paragraphs, store it for the Lab Reader."""
    return _ingest_text(
        db,
        project_id=payload.project_id,
        title=payload.title,
        raw_text=payload.raw_text,
        author=payload.author,
        publication=payload.publication,
        canonical_url=payload.canonical_url,
        license_status=payload.license_status,
    )


@app.post("/sources/ingest-url", response_model=IngestResult)
def ingest_source_url(payload: SourceIngestUrl, db: Session = Depends(get_db)):
    """Fetch a URL, extract readable text, and ingest it. License gate still applies."""
    try:
        resp = httpx.get(payload.url, timeout=20.0, follow_redirects=True, headers={"User-Agent": "ANNI/0.2 research ingester"})
        resp.raise_for_status()
        raw_html = resp.text
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Couldn't fetch the URL: {exc}") from exc
    text = strip_html(raw_html)
    if len(text) < 40:
        raise HTTPException(status_code=422, detail="Fetched page had little readable text — paste the text instead.")
    title = payload.title or extract_html_title(raw_html) or payload.url
    return _ingest_text(
        db,
        project_id=payload.project_id,
        title=title,
        raw_text=text,
        author=payload.author,
        canonical_url=payload.url,
        license_status=payload.license_status,
    )


@app.post("/sources/ingest-file", response_model=IngestResult)
async def ingest_source_file(
    project_id: str = Form(...),
    title: str | None = Form(None),
    author: str | None = Form(None),
    license_status: str = Form("unverified"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a PDF (or .txt), extract its text, and ingest it."""
    data = await file.read()
    name = file.filename or "uploaded"
    try:
        if name.lower().endswith(".pdf") or (file.content_type or "").endswith("pdf"):
            text = extract_pdf_text(data)
        else:
            text = data.decode("utf-8", errors="ignore")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Couldn't read the file: {exc}") from exc
    if len(text.strip()) < 40:
        raise HTTPException(status_code=422, detail="No extractable text found (scanned PDF?). Paste the text instead.")
    return _ingest_text(
        db,
        project_id=project_id,
        title=title or name,
        raw_text=text,
        author=author,
        license_status=license_status,
    )


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


# ── Blind scoring ─────────────────────────────────────────────────────────────

@app.post("/scoring-items", response_model=ScoringItemBlind)
def create_scoring_item(payload: ScoringItemCreate, db: Session = Depends(get_db)):
    """Add an item to the blind scoring queue (team side). Hidden key stays server-side."""
    count = db.scalar(select(func.count()).select_from(ScoringItem)) or 0
    item = ScoringItem(
        project_id=payload.project_id,
        item_code=payload.item_code or f"ITEM-{count + 1:03d}",
        context_text=payload.context_text,
        response_text=payload.response_text,
        true_condition=payload.true_condition,
        true_risk=payload.true_risk,
        true_source=payload.true_source,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ScoringItemBlind(id=item.id, item_code=item.item_code, context_text=item.context_text, response_text=item.response_text)


@app.post("/scoring-items/from-conversation", response_model=ScoringItemsCreated)
def scoring_items_from_conversation(payload: ScoringItemsFromConversation, db: Session = Depends(get_db)):
    """Turn a lab conversation into scoring items — one per responder message, with the hidden key.

    Roles: 'user' = the responder under study (Wysa/ChatGPT/therapist/counselor-support),
    'assistant' = the synthetic patient. We score the responder's messages.
    """
    count = db.scalar(select(func.count()).select_from(ScoringItem)) or 0
    created: list[str] = []
    history: list = []
    for message in payload.messages:
        if message.role == "user":
            context = "\n\n".join(
                f"{'Patient' if h.role == 'assistant' else 'Responder'}: {h.content}" for h in history
            ) or "(start of conversation)"
            count += 1
            code = f"ITEM-{count:03d}"
            db.add(ScoringItem(
                project_id=payload.project_id,
                item_code=code,
                context_text=context,
                response_text=message.content,
                true_condition=payload.condition,
                true_risk=payload.risk_level,
                true_source=payload.source,
            ))
            created.append(code)
        history.append(message)
    if not created:
        raise HTTPException(status_code=422, detail="No responder messages found to score.")
    db.flush()
    write_audit_event(db, "lab", "scoring_batch", created[0], "created_from_conversation",
                      {"condition": payload.condition, "risk_level": payload.risk_level, "count": len(created)})
    db.commit()
    return ScoringItemsCreated(created=len(created), item_codes=created)


@app.get("/scoring-items", response_model=list[ScoringItemBlind])
def list_scoring_items(project_id: str | None = Query(None), db: Session = Depends(get_db)):
    """Blinded queue — no condition/risk/source labels ever leave the server here."""
    query = select(ScoringItem)
    if project_id:
        query = query.where(ScoringItem.project_id == project_id)
    items = db.scalars(query.order_by(ScoringItem.created_at)).all()
    return [
        ScoringItemBlind(id=i.id, item_code=i.item_code, context_text=i.context_text, response_text=i.response_text)
        for i in items
    ]


@app.post("/scores", response_model=ScoreOut)
def submit_score(payload: ScoreCreate, db: Session = Depends(get_db)):
    item = db.get(ScoringItem, payload.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Scoring item not found.")
    score = Score(**payload.model_dump())
    db.add(score)
    db.flush()
    write_audit_event(db, payload.scorer_id, "score", score.id, "submitted", {"item_id": payload.item_id})
    db.commit()
    db.refresh(score)
    return score


@app.get("/scores", response_model=list[ScoreOut])
def list_scores(scorer_id: str | None = Query(None), db: Session = Depends(get_db)):
    query = select(Score)
    if scorer_id:
        query = query.where(Score.scorer_id == scorer_id)
    return db.scalars(query.order_by(Score.created_at)).all()


@app.get("/scoring-results", response_model=ScoringResults)
def scoring_results(project_id: str | None = Query(None), db: Session = Depends(get_db)):
    """Team view: joins scores to the hidden key. Not for the blind panel."""
    item_query = select(ScoringItem)
    if project_id:
        item_query = item_query.where(ScoringItem.project_id == project_id)
    items = {i.id: i for i in db.scalars(item_query).all()}
    scores = db.scalars(select(Score).where(Score.item_id.in_(items.keys()))).all() if items else []

    by_cond: dict[str, list[Score]] = {}
    correct = 0
    guessed = 0
    for score in scores:
        item = items.get(score.item_id)
        if not item:
            continue
        cond = item.true_condition or "unlabeled"
        by_cond.setdefault(cond, []).append(score)
        if item.true_source in ("human", "ai"):
            guessed += 1
            if score.source_guess == item.true_source:
                correct += 1

    by_condition = []
    for cond, group in sorted(by_cond.items()):
        n = len(group)
        by_condition.append(
            ConditionScore(
                condition=cond,
                n=n,
                avg_safety=round(sum(s.safety for s in group) / n, 2),
                avg_accuracy=round(sum(s.accuracy for s in group) / n, 2),
                avg_warmth=round(sum(s.warmth for s in group) / n, 2),
            )
        )

    return ScoringResults(
        items=len(items),
        scores=len(scores),
        scorers=len({s.scorer_id for s in scores}),
        by_condition=by_condition,
        source_guess_accuracy=round(correct / guessed, 2) if guessed else None,
        source_guess_n=guessed,
    )


# ── Audit log ─────────────────────────────────────────────────────────────────

@app.get("/audit-log", response_model=list[AuditLogOut])
def list_audit_log(limit: int = Query(50, le=200), offset: int = Query(0), db: Session = Depends(get_db)):
    return db.scalars(
        select(AuditLog).order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    ).all()
