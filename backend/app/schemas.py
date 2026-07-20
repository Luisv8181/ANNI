from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class EvidenceSpan(BaseModel):
    source_id: str
    paragraph_id: str
    sentence_id: str | None = None
    character_start: int = Field(ge=0)
    character_end: int = Field(ge=0)
    quote: str


class AnnotationCreate(BaseModel):
    project_id: str
    ontology_node_id: str
    relationship: Literal["supports", "contradicts", "qualifies", "contextualizes"]
    confidence: int = Field(ge=0, le=100)
    note: str
    evidence: EvidenceSpan
    reviewer_id: str
    read_confirmation_id: str


class ReviewDecision(BaseModel):
    decision: Literal["accepted", "rejected", "modified", "merged"]
    review_note: str
    decided_by: str
    decided_at: datetime = Field(default_factory=datetime.utcnow)


class ReadConfirmationCreate(BaseModel):
    source_id: str
    reviewer_id: str
    statement: str = "I confirm I personally read this testimony and these annotations reflect my own judgment."


class PromptCompilationCreate(BaseModel):
    project_id: str
    name: str
    annotation_ids: list[str]
    scenario: str
    learning_objective: str
    created_by: str


# ── Response schemas ─────────────────────────────────────────────────────────

class OntologyNodeOut(BaseModel):
    id: str
    label: str
    group: str
    description: str
    version: str

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: str
    name: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


class SourceOut(BaseModel):
    id: str
    project_id: str
    title: str
    author: str | None
    canonical_url: str | None
    license_status: str
    allow_list_status: str
    version: str
    created_at: datetime

    class Config:
        from_attributes = True


class ParagraphOut(BaseModel):
    id: str
    source_id: str
    order_index: int
    text: str

    class Config:
        from_attributes = True


class DecisionOut(BaseModel):
    id: str
    decision: str
    decision_note: str
    decided_by: str
    created_at: datetime

    class Config:
        from_attributes = True


class AnnotationOut(BaseModel):
    id: str
    project_id: str
    paragraph_id: str
    ontology_node_id: str
    reviewer_id: str
    evidence_quote: str
    confidence: int
    note: str
    status: str
    created_at: datetime
    ontology_label: str | None = None
    decisions: list[DecisionOut] = []

    class Config:
        from_attributes = True


class AISuggestionOut(BaseModel):
    id: str
    annotation_id: str
    agent_name: str
    model_name: str
    ontology_node_id: str
    confidence: int
    evidence_quote: str
    suggestion: str
    rationale: str
    decision: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReadConfirmationOut(BaseModel):
    id: str
    confirmed_at: datetime

    class Config:
        from_attributes = True


class PromptCompilationOut(BaseModel):
    id: str
    project_id: str
    name: str
    system_prompt: str
    ontology_version: str
    compiler_version: str
    created_by: str
    created_at: datetime
    annotation_ids: list[str] = []

    class Config:
        from_attributes = True


class LabMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class LabChatRequest(BaseModel):
    compilation_id: str
    risk_level: str = "none"
    outcome_mode: str = "open"
    cue: str | None = None
    messages: list[LabMessage] = []


class LabChatResponse(BaseModel):
    reply: str
    model_name: str
    persona_name: str
    risk_level: str
    outcome_mode: str


class LabProfileOut(BaseModel):
    id: str
    name: str
    trait_count: int


class LabRiskLevelOut(BaseModel):
    id: str
    label: str
    blurb: str


class LabOutcomeModeOut(BaseModel):
    id: str
    label: str
    blurb: str


class LabConfigOut(BaseModel):
    profiles: list[LabProfileOut]
    risk_levels: list[LabRiskLevelOut]
    outcome_modes: list[LabOutcomeModeOut]
    model_name: str


class AuditLogOut(BaseModel):
    id: str
    actor_id: str
    entity_type: str
    entity_id: str
    action: str
    event_hash: str
    previous_hash: str | None
    created_at: datetime

    class Config:
        from_attributes = True
