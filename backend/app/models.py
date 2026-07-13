from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def uuid() -> str:
    return str(uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default="annotator")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Source(Base):
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String)
    author: Mapped[str | None] = mapped_column(String, nullable=True)
    publication: Mapped[str | None] = mapped_column(String, nullable=True)
    canonical_url: Mapped[str | None] = mapped_column(String, nullable=True)
    license_status: Mapped[str] = mapped_column(String, default="unverified")
    allow_list_status: Mapped[str] = mapped_column(String, default="pending")
    content_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    version: Mapped[str] = mapped_column(String, default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Paragraph(Base):
    __tablename__ = "paragraphs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.id"))
    order_index: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)


class OntologyNode(Base):
    __tablename__ = "ontology_nodes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    label: Mapped[str] = mapped_column(String, index=True)
    group: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(Text)
    version: Mapped[str] = mapped_column(String, default="0.1")


class ReadConfirmation(Base):
    __tablename__ = "read_confirmations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    source_id: Mapped[str] = mapped_column(ForeignKey("sources.id"))
    reviewer_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    statement: Mapped[str] = mapped_column(Text)
    confirmed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Annotation(Base):
    __tablename__ = "annotations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    paragraph_id: Mapped[str] = mapped_column(ForeignKey("paragraphs.id"))
    ontology_node_id: Mapped[str] = mapped_column(ForeignKey("ontology_nodes.id"))
    reviewer_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    evidence_quote: Mapped[str] = mapped_column(Text)
    character_start: Mapped[int] = mapped_column(Integer)
    character_end: Mapped[int] = mapped_column(Integer)
    confidence: Mapped[int] = mapped_column(Integer)
    note: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String, default="submitted")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    ontology_node: Mapped[OntologyNode] = relationship()


class AnnotationDecision(Base):
    __tablename__ = "annotation_decisions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    annotation_id: Mapped[str] = mapped_column(ForeignKey("annotations.id"), index=True)
    decision: Mapped[str] = mapped_column(String)
    decision_note: Mapped[str] = mapped_column(Text, default="")
    decided_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AISuggestion(Base):
    __tablename__ = "ai_suggestions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    annotation_id: Mapped[str] = mapped_column(ForeignKey("annotations.id"))
    agent_name: Mapped[str] = mapped_column(String)
    model_name: Mapped[str] = mapped_column(String)
    ontology_node_id: Mapped[str] = mapped_column(ForeignKey("ontology_nodes.id"))
    confidence: Mapped[int] = mapped_column(Integer)
    evidence_quote: Mapped[str] = mapped_column(Text)
    suggestion: Mapped[str] = mapped_column(Text, default="")
    rationale: Mapped[str] = mapped_column(Text)
    decision: Mapped[str] = mapped_column(String, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    actor_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    entity_type: Mapped[str] = mapped_column(String)
    entity_id: Mapped[str] = mapped_column(String)
    action: Mapped[str] = mapped_column(String)
    details: Mapped[str] = mapped_column(Text, default="")
    previous_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    event_hash: Mapped[str] = mapped_column(String, unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PromptCompilation(Base):
    __tablename__ = "prompt_compilations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=uuid)
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"))
    name: Mapped[str] = mapped_column(String)
    system_prompt: Mapped[str] = mapped_column(Text)
    ontology_version: Mapped[str] = mapped_column(String)
    compiler_version: Mapped[str] = mapped_column(String, default="0.1")
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PromptCompilationAnnotation(Base):
    __tablename__ = "prompt_compilation_annotations"

    compilation_id: Mapped[str] = mapped_column(ForeignKey("prompt_compilations.id"), primary_key=True)
    annotation_id: Mapped[str] = mapped_column(ForeignKey("annotations.id"), primary_key=True)
