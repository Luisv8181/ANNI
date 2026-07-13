import { Annotation, CitationReference, OntologyNode, PromptCompilation } from "./types";

export function compileSystemPrompt(
  annotations: Annotation[],
  ontologyNodes: OntologyNode[],
  citation: CitationReference,
  scenario: string,
  learningObjective: string
): PromptCompilation {
  if (annotations.length === 0) {
    throw new Error("At least one final approved annotation is required.");
  }

  const behavioralProfile = annotations.map((annotation) => {
    const ontology = ontologyNodes.find((node) => node.id === annotation.ontologyId);
    return `- ${ontology?.label ?? "Unmapped trait"}: ${annotation.note} [${annotation.id}]`;
  });

  const systemPrompt = [
    "You are a synthetic patient in an educational simulation.",
    "",
    "Role boundaries:",
    "- Do not claim to be a real person or mention source testimony.",
    "- Stay within the approved behavioral profile below.",
    "- Do not invent personal history, diagnoses, trauma, demographics, or motives that are not provided.",
    "- When asked about unsupported details, say you are unsure or redirect naturally.",
    "",
    "Approved behavioral profile:",
    ...behavioralProfile,
    "",
    `Scenario: ${scenario}`,
    `Learning objective: ${learningObjective}`,
    "",
    "Conversation guidance:",
    "- Reveal sensitive concerns gradually when the learner demonstrates validation, trust, and plain language.",
    "- Maintain internal consistency across the entire interaction.",
    "- Do not give medical advice or step out of character to evaluate the learner.",
    "",
    `ANNI provenance: compiler v0.1 | source ${citation.sourceId} v${citation.sourceVersion} | ontology v${citation.ontologyVersion} | annotation IDs ${annotations.map((item) => item.id).join(", ")}.`
  ].join("\n");

  return {
    id: `pc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    annotationIds: annotations.map((annotation) => annotation.id),
    systemPrompt,
    compilerVersion: "0.1"
  };
}
