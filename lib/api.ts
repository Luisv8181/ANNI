const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Types (mirrors backend response schemas) ─────────────────────────────────

export type OntologyNode = {
  id: string;
  label: string;
  group: string;
  description: string;
  version: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Source = {
  id: string;
  project_id: string;
  title: string;
  author: string | null;
  publication: string | null;
  canonical_url: string | null;
  license_status: string;
  allow_list_status: string;
  version: string;
};

export type Paragraph = {
  id: string;
  source_id: string;
  order_index: number;
  text: string;
};

export type Decision = {
  id: string;
  decision: string;
  decision_note: string;
  decided_by: string;
  created_at: string;
};

export type Annotation = {
  id: string;
  project_id: string;
  paragraph_id: string;
  ontology_node_id: string;
  ontology_label: string | null;
  reviewer_id: string;
  evidence_quote: string;
  confidence: number;
  note: string;
  status: string;
  created_at: string;
  decisions: Decision[];
};

export type AISuggestion = {
  id: string;
  annotation_id: string;
  agent_name: string;
  model_name: string;
  ontology_node_id: string;
  confidence: number;
  evidence_quote: string;
  suggestion: string;
  rationale: string;
  decision: string;
  created_at: string;
};

export type ReadConfirmation = {
  id: string;
  confirmed_at: string;
};

export type PromptCompilation = {
  id: string;
  project_id: string;
  name: string;
  system_prompt: string;
  ontology_version: string;
  compiler_version: string;
  created_by: string;
  created_at: string;
  annotation_ids: string[];
};

export type LabTrait = { id: string; label: string; group: string };
export type LabProfile = { id: string; name: string; trait_count: number; traits: LabTrait[] };
/** The patient model's own per-turn self-report. Telemetry, never a scoring input. */
export type PatientState = { distress: number; disclosure: number };
export type LabRiskLevel = { id: string; label: string; blurb: string };
export type LabOutcomeMode = { id: string; label: string; blurb: string };
export type LabConfig = {
  profiles: LabProfile[];
  risk_levels: LabRiskLevel[];
  outcome_modes: LabOutcomeMode[];
  model_name: string;
};
export type LabMessage = { role: "user" | "assistant"; content: string };
export type LabChatResponse = {
  reply: string;
  model_name: string;
  persona_name: string;
  risk_level: string;
  outcome_mode: string;
  patient_state: PatientState | null;
};
export type Citation = {
  annotation_id: string;
  source: { id: string | null; title: string | null; url: string | null; license_status: string | null; content_hash: string | null; version: string | null };
  evidence: { paragraph_id: string; paragraph_order: number | null; character_start: number; character_end: number; quote: string };
  ontology: { id: string | null; label: string | null; version: string | null };
  human_annotation: { reviewer_id: string; confidence: number; note: string; status: string; created_at: string };
  decisions: { id: string; decision: string; note: string; by: string; at: string }[];
};
export type GeneratePromptResponse = {
  persona_name: string;
  system_prompt: string;
  trait_count: number;
  outcome_mode: string;
  risk_level: string;
  provenance: string;
  citations: Citation[];
};
export type AuditEvent = {
  id: string; actor_id: string; entity_type: string; entity_id: string; action: string;
  event_hash: string; previous_hash: string | null; created_at: string;
};
export type AuditVerify = { valid: boolean; events: number; broken_at: string | null; tip: string | null };

export type IngestResult = {
  source: Source;
  paragraphs: Paragraph[];
  content_hash: string;
};

export type AssistResponse = {
  available: boolean;
  ontology_node_id?: string | null;
  label?: string | null;
  confidence?: number | null;
  rationale?: string | null;
  model_name?: string | null;
};

export type TraitCount = { ontology_node_id: string; label: string; count: number };
export type LabeledCount = { label: string; count: number };
export type AnnotationStats = {
  total: number;
  approved: number;
  submitted: number;
  avg_confidence: number;
  reviewers: number;
  ai_reviewed: number;
  ai_agreements: number;
  by_trait: TraitCount[];
  by_decision: LabeledCount[];
};

export type ScoringItem = { id: string; item_code: string; context_text: string; response_text: string };
export type Score = {
  id: string; item_id: string; scorer_id: string; safety: number; accuracy: number; warmth: number;
  perceived_risk: string; source_guess: string; note: string; created_at: string;
};
export type ConditionScore = { condition: string; n: number; avg_safety: number; avg_accuracy: number; avg_warmth: number };
export type ScoringResults = {
  items: number; scores: number; scorers: number;
  by_condition: ConditionScore[]; source_guess_accuracy: number | null; source_guess_n: number;
};

// ── API calls ────────────────────────────────────────────────────────────────

export const api = {
  // Ontology
  getOntologyNodes: () => request<OntologyNode[]>("/ontology-nodes"),

  // Projects
  getProjects: () => request<Project[]>("/projects"),
  createProject: (body: { name: string; description?: string }) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(body) }),

  // Ontology editing
  createOntologyNode: (body: { label: string; group: string; description: string; version?: string }) =>
    request<OntologyNode>("/ontology-nodes", { method: "POST", body: JSON.stringify(body) }),

  // Sources
  getSources: (projectId?: string) =>
    request<Source[]>(`/sources${projectId ? `?project_id=${projectId}` : ""}`),

  getParagraphs: (sourceId: string) =>
    request<Paragraph[]>(`/sources/${sourceId}/paragraphs`),

  ingestSource: (body: {
    project_id: string;
    title: string;
    author?: string | null;
    publication?: string | null;
    canonical_url?: string | null;
    license_status?: string;
    raw_text: string;
  }) => request<IngestResult>("/sources/ingest", { method: "POST", body: JSON.stringify(body) }),

  ingestSourceUrl: (body: {
    project_id: string;
    url: string;
    title?: string | null;
    author?: string | null;
    license_status?: string;
  }) => request<IngestResult>("/sources/ingest-url", { method: "POST", body: JSON.stringify(body) }),

  ingestSourceFile: async (form: FormData): Promise<IngestResult> => {
    const res = await fetch("/api/sources/ingest-file", { method: "POST", body: form });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
    return res.json() as Promise<IngestResult>;
  },

  getAnnotationStats: (projectId?: string) =>
    request<AnnotationStats>(`/annotation-stats${projectId ? `?project_id=${projectId}` : ""}`),

  annotationAssist: (body: { project_id?: string; quote: string; paragraph: string }) =>
    request<AssistResponse>("/annotation-assist", { method: "POST", body: JSON.stringify(body) }),

  generateProfilePrompt: (body: {
    persona_name: string;
    annotation_ids: string[];
    outcome_mode: string;
    risk_level: string;
    include_dsm5: boolean;
  }) => request<GeneratePromptResponse>("/synthetic-lab/generate-prompt", { method: "POST", body: JSON.stringify(body) }),

  // Read confirmations
  createReadConfirmation: (body: { source_id: string; reviewer_id: string }) =>
    request<ReadConfirmation>("/read-confirmations", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Annotations
  getAnnotations: (projectId?: string) =>
    request<Annotation[]>(`/annotations${projectId ? `?project_id=${projectId}` : ""}`),

  createAnnotation: (body: {
    project_id: string;
    ontology_node_id: string;
    relationship: string;
    confidence: number;
    note: string;
    evidence: {
      source_id: string;
      paragraph_id: string;
      character_start: number;
      character_end: number;
      quote: string;
    };
    reviewer_id: string;
    read_confirmation_id: string;
  }) =>
    request<Annotation>("/annotations", { method: "POST", body: JSON.stringify(body) }),

  // Suggestions
  getSuggestions: (annotationId: string) =>
    request<AISuggestion[]>(`/annotations/${annotationId}/suggestions`),

  decideSuggestion: (
    annotationId: string,
    suggestionId: string,
    body: { decision: string; review_note: string; decided_by: string }
  ) =>
    request<AISuggestion>(`/annotations/${annotationId}/suggestions/${suggestionId}/decide`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Decisions on annotations
  decideAnnotation: (
    annotationId: string,
    body: { decision: string; review_note: string; decided_by: string }
  ) =>
    request<Annotation>(`/annotations/${annotationId}/decisions`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Prompt compilations (synthetic patient profiles)
  getPromptCompilations: (projectId?: string) =>
    request<PromptCompilation[]>(`/prompt-compilations${projectId ? `?project_id=${projectId}` : ""}`),

  // Synthetic Patient Lab
  getLabConfig: (projectId?: string) =>
    request<LabConfig>(`/synthetic-lab/config${projectId ? `?project_id=${projectId}` : ""}`),

  labMessage: (body: {
    compilation_id: string;
    risk_level: string;
    outcome_mode: string;
    cue?: string | null;
    messages: LabMessage[];
  }) => request<LabChatResponse>("/synthetic-lab/message", { method: "POST", body: JSON.stringify(body) }),

  // Blind scoring
  getScoringItems: (projectId?: string) =>
    request<ScoringItem[]>(`/scoring-items${projectId ? `?project_id=${projectId}` : ""}`),
  getMyScores: (scorerId: string) => request<Score[]>(`/scores?scorer_id=${scorerId}`),
  submitScore: (body: {
    item_id: string; scorer_id: string; safety: number; accuracy: number; warmth: number;
    perceived_risk: string; source_guess: string; setup_guess?: string | null; note?: string;
  }) => request<Score>("/scores", { method: "POST", body: JSON.stringify(body) }),
  getScoringResults: (projectId?: string) =>
    request<ScoringResults>(`/scoring-results${projectId ? `?project_id=${projectId}` : ""}`),

  scoringItemsFromConversation: (body: {
    project_id: string; condition: string; risk_level: string; source: string;
    messages: { role: "user" | "assistant"; content: string }[];
  }) => request<{ created: number; item_codes: string[] }>("/scoring-items/from-conversation", { method: "POST", body: JSON.stringify(body) }),

  // Audit log / provenance
  getAuditLog: (limit = 100) => request<AuditEvent[]>(`/audit-log?limit=${limit}`),
  verifyAuditChain: () => request<AuditVerify>("/audit-log/verify"),
  getAnnotationCitation: (annotationId: string) => request<Citation>(`/annotations/${annotationId}/citation`),
};
