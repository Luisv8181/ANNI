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
  canonical_url: string | null;
  license_status: string;
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

export type LabProfile = { id: string; name: string; trait_count: number };
export type LabRiskLevel = { id: string; label: string; blurb: string };
export type LabConfig = { profiles: LabProfile[]; risk_levels: LabRiskLevel[]; model_name: string };
export type LabMessage = { role: "user" | "assistant"; content: string };
export type LabChatResponse = { reply: string; model_name: string; persona_name: string; risk_level: string };

// ── API calls ────────────────────────────────────────────────────────────────

export const api = {
  // Ontology
  getOntologyNodes: () => request<OntologyNode[]>("/ontology-nodes"),

  // Projects
  getProjects: () => request<Project[]>("/projects"),

  // Sources
  getSources: (projectId?: string) =>
    request<Source[]>(`/sources${projectId ? `?project_id=${projectId}` : ""}`),

  getParagraphs: (sourceId: string) =>
    request<Paragraph[]>(`/sources/${sourceId}/paragraphs`),

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
    cue?: string | null;
    messages: LabMessage[];
  }) => request<LabChatResponse>("/synthetic-lab/message", { method: "POST", body: JSON.stringify(body) }),

  // Audit log
  getAuditLog: (limit = 50) => request<unknown[]>(`/audit-log?limit=${limit}`),
};
