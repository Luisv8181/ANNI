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


class SourceIngestUrl(BaseModel):
    project_id: str
    url: str
    title: str | None = None
    author: str | None = None
    license_status: str = "unverified"


class IngestResult(BaseModel):
    source: SourceOut
    paragraphs: list[ParagraphOut]
    content_hash: str


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


class SourceIngest(BaseModel):
    project_id: str
    title: str
    author: str | None = None
    publication: str | None = None
    canonical_url: str | None = None
    license_status: str = "unverified"
    raw_text: str


class TraitCount(BaseModel):
    ontology_node_id: str
    label: str
    count: int


class LabeledCount(BaseModel):
    label: str
    count: int


class AnnotationStatsOut(BaseModel):
    total: int
    approved: int
    submitted: int
    avg_confidence: float
    reviewers: int
    ai_reviewed: int
    ai_agreements: int
    by_trait: list[TraitCount]
    by_decision: list[LabeledCount]


class ScoringItemCreate(BaseModel):
    project_id: str
    item_code: str | None = None
    context_text: str = ""
    response_text: str
    true_condition: str | None = None
    true_risk: str | None = None
    true_source: str | None = None


class ScoringItemBlind(BaseModel):
    """What a scorer sees — no key fields."""
    id: str
    item_code: str
    context_text: str
    response_text: str


class ScoreCreate(BaseModel):
    item_id: str
    scorer_id: str
    safety: int = Field(ge=1, le=5)
    accuracy: int = Field(ge=1, le=5)
    warmth: int = Field(ge=1, le=5)
    perceived_risk: Literal["none", "subtle", "ambiguous", "explicit"]
    source_guess: Literal["human", "ai"]
    setup_guess: str | None = None
    note: str = ""


class ScoreOut(BaseModel):
    id: str
    item_id: str
    scorer_id: str
    safety: int
    accuracy: int
    warmth: int
    perceived_risk: str
    source_guess: str
    note: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConditionScore(BaseModel):
    condition: str
    n: int
    avg_safety: float
    avg_accuracy: float
    avg_warmth: float


class ScoringResults(BaseModel):
    items: int
    scores: int
    scorers: int
    by_condition: list[ConditionScore]
    source_guess_accuracy: float | None
    source_guess_n: int


class ConversationTurn(BaseModel):
    role: Literal["user", "assistant"]  # user = responder, assistant = patient
    content: str


class ScoringItemsFromConversation(BaseModel):
    project_id: str
    condition: str  # responder id/label (wysa, chatgpt, therapist, counselor-support)
    risk_level: str = "none"
    source: str = "ai"  # "ai" or "human"
    messages: list[ConversationTurn]


class ScoringItemsCreated(BaseModel):
    created: int
    item_codes: list[str]


class AssistRequest(BaseModel):
    project_id: str | None = None
    quote: str
    paragraph: str = ""


class AssistResponse(BaseModel):
    available: bool
    ontology_node_id: str | None = None
    label: str | None = None
    confidence: int | None = None
    rationale: str | None = None
    model_name: str | None = None


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


class GeneratePromptRequest(BaseModel):
    persona_name: str = "Synthetic Patient"
    annotation_ids: list[str]
    outcome_mode: str = "open"
    risk_level: str = "none"
    cue: str | None = None
    include_dsm5: bool = True


class GeneratePromptResponse(BaseModel):
    persona_name: str
    system_prompt: str
    trait_count: int
    outcome_mode: str
    risk_level: str


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
