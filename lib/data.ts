import { AISuggestion, Annotation, CitationReference, OntologyNode, Paragraph } from "./types";

export const ontologyNodes: OntologyNode[] = [
  { id: "emotion-hesitation", label: "Hesitates to disclose symptoms", group: "Emotion", description: "Signals reluctance, fear, shame, or uncertainty when sharing health concerns.", version: "0.1" },
  { id: "communication-indirect", label: "Indirect communication", group: "Communication", description: "Uses softened, delayed, or non-explicit language when discussing needs.", version: "0.1" },
  { id: "healthcare-trust", label: "Healthcare trust barrier", group: "Healthcare", description: "Shows limited trust in clinicians, institutions, systems, or advice.", version: "0.1" },
  { id: "support-family", label: "Family support system", group: "Support", description: "Family members provide emotional, logistic, or decision-making support.", version: "0.1" },
  { id: "literacy-medical", label: "Medical literacy gap", group: "Health literacy", description: "Difficulty understanding medical language, process, risk, or treatment options.", version: "0.1" },
  { id: "goals-autonomy", label: "Autonomy goal", group: "Goals", description: "The person wants greater control over care decisions or daily functioning.", version: "0.1" },
  { id: "values-dignity", label: "Dignity in care", group: "Values", description: "Care should preserve respect, privacy, identity, and agency.", version: "0.1" },
  { id: "education-objective", label: "Learner objective", group: "Educational objectives", description: "A simulation target for learners, such as eliciting concerns or validating emotion.", version: "0.1" }
];

export const testimonyParagraphs: Paragraph[] = [
  { id: "p1", order: 1, text: "I waited until the pain was bad before I told anyone. I kept thinking it would sound dramatic if I complained again, so I smiled and said I was fine." },
  { id: "p2", order: 2, text: "When the nurse asked direct questions I answered, but I did not know how to explain what scared me most. My sister noticed and helped me ask about the next steps." },
  { id: "p3", order: 3, text: "The printed instructions were full of words I had heard before but did not really understand. I wanted someone to slow down and make sure I could repeat the plan back." }
];

export const citationReference: CitationReference = {
  sourceId: "T-DEMO-001",
  sourceTitle: "Public testimony demonstration",
  sourceUrl: "https://example.org/testimony-demo",
  sourceVersion: "1",
  licenseStatus: "demo-only - verify before use",
  paragraphOrder: 1,
  ontologyVersion: "0.1"
};

export const seedAnnotations: Annotation[] = [
  { id: "a1", paragraphId: "p1", span: "I smiled and said I was fine", note: "The speaker minimizes symptoms despite worsening pain.", ontologyId: "emotion-hesitation", confidence: 86, relationship: "supports", status: "approved", reviewer: "current user", createdAt: "2026-07-13T10:00:00.000Z" },
  { id: "a2", paragraphId: "p2", span: "My sister noticed and helped me ask", note: "Sister acts as a support and communication bridge.", ontologyId: "support-family", confidence: 91, relationship: "supports", status: "approved", reviewer: "current user", createdAt: "2026-07-13T10:02:00.000Z" },
  { id: "a3", paragraphId: "p3", span: "did not really understand", note: "Plain-language review and teach-back are needed.", ontologyId: "literacy-medical", confidence: 88, relationship: "supports", status: "approved", reviewer: "current user", createdAt: "2026-07-13T10:04:00.000Z" }
];

export const seedSuggestions: AISuggestion[] = [
  { id: "s1", annotationId: "a1", agent: "Emotion Agent", suggestion: "Map this to hesitation and fear of burdening clinicians.", ontologyId: "emotion-hesitation", confidence: 82, evidence: "I waited until the pain was bad before I told anyone.", rationale: "The testimony shows delayed disclosure and self-suppression, both relevant to emotional hesitation during care.", decision: "pending" },
  { id: "s2", annotationId: "a2", agent: "Communication Agent", suggestion: "Also tag indirect communication because the patient answers but does not volunteer core concerns.", ontologyId: "communication-indirect", confidence: 76, evidence: "I did not know how to explain what scared me most.", rationale: "The patient provides answers only after direct prompting and withholds the main fear until supported.", decision: "pending" },
  { id: "s3", annotationId: "a3", agent: "Education Agent", suggestion: "Add a learner objective: use teach-back to verify comprehension.", ontologyId: "education-objective", confidence: 89, evidence: "make sure I could repeat the plan back", rationale: "The quoted passage directly identifies a simulation objective for patient education and comprehension checks.", decision: "pending" }
];
