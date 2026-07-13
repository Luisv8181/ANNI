export type OntologyNode = {
  id: string;
  label: string;
  group: string;
  description: string;
  version: string;
};

export type Paragraph = {
  id: string;
  order: number;
  text: string;
};

export type Annotation = {
  id: string;
  paragraphId: string;
  span: string;
  note: string;
  ontologyId: string;
  confidence: number;
  relationship: string;
  status: "draft" | "submitted" | "approved";
  reviewer: string;
  createdAt: string;
};

export type AISuggestion = {
  id: string;
  annotationId: string;
  agent: string;
  suggestion: string;
  ontologyId: string;
  confidence: number;
  evidence: string;
  rationale: string;
  decision: "pending" | "accepted" | "rejected" | "modified" | "merged";
};

export type CitationReference = {
  sourceId: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceVersion: string;
  licenseStatus: string;
  paragraphOrder: number;
  ontologyVersion: string;
};

export type PromptCompilation = {
  id: string;
  createdAt: string;
  annotationIds: string[];
  systemPrompt: string;
  compilerVersion: string;
};
