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
