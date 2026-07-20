// Smart highlighter — a lightweight, offline annotation assistant.
//
// Given a highlighted quote (and its surrounding paragraph), it suggests which
// ontology traits the evidence most likely supports, by matching cue words to
// each trait. It runs client-side so it works without the model up; the human
// always confirms. (Upgrade path: swap this for an Ollama call.)

import type { OntologyNode } from "./api";

// Cue words per ontology node id. Tuned to the ANNI trait set; extend as the
// ontology grows.
const CUES: Record<string, string[]> = {
  "emotion-hesitation": [
    "waited", "told anyone", "dramatic", "complain", "i was fine", "hide", "scared",
    "afraid", "embarrassed", "shame", "reluctant", "minimize", "didn't want to", "burden",
  ],
  "communication-indirect": [
    "smiled", "said i was fine", "did not know how to explain", "hard to say", "hint",
    "soften", "around the point", "couldn't put into words", "downplay",
  ],
  "healthcare-trust": [
    "chart", "not a person", "distrust", "doubt", "the staff", "the system", "tiring",
    "let down", "don't trust", "difficult", "keep my own notes", "safe in there",
  ],
  "support-family": [
    "sister", "daughter", "son", "family", "mom", "mother", "dad", "father", "husband",
    "wife", "helped me", "came with", "together", "brother", "partner",
  ],
  "literacy-medical": [
    "words", "understand", "instructions", "worksheets", "repeat the plan", "plain language",
    "confusing", "jargon", "did not really understand", "explain it", "too fast",
  ],
  "goals-autonomy": [
    "control", "my decision", "the one who decides", "the choice", "independent", "autonomy",
    "in charge", "my own", "final decision",
  ],
  "values-dignity": [
    "respect", "dignity", "feel safe", "privacy", "as a person", "slow down", "not slow",
    "treated me", "listened to",
  ],
  "education-objective": [
    "learn", "practice", "objective", "teach-back", "skill", "repeat back", "check i understood",
  ],
};

export type Suggestion = {
  node: OntologyNode;
  score: number; // normalized 0..1
  hits: string[];
};

export function suggestTraits(
  quote: string,
  paragraph: string,
  ontology: OntologyNode[],
  max = 3,
): Suggestion[] {
  const hay = `${quote} ${quote} ${paragraph}`.toLowerCase(); // quote weighted 2x
  const results: Suggestion[] = [];

  for (const node of ontology) {
    const cues = CUES[node.id] ?? [];
    const hits: string[] = [];
    let raw = 0;
    for (const cue of cues) {
      if (hay.includes(cue)) {
        hits.push(cue);
        // longer / multi-word cues are stronger signals
        raw += cue.includes(" ") ? 2 : 1;
      }
    }
    // light backup: overlap with the node label words
    for (const word of node.label.toLowerCase().split(/\W+/)) {
      if (word.length > 4 && quote.toLowerCase().includes(word)) raw += 1;
    }
    if (raw > 0) results.push({ node, score: raw, hits });
  }

  results.sort((a, b) => b.score - a.score);
  const top = results.slice(0, max);
  const peak = top[0]?.score ?? 1;
  // normalize to a 0..1 confidence, capped so nothing reads as certainty
  return top.map((s) => ({ ...s, score: Math.min(0.95, s.score / (peak + 1) + 0.35) }));
}

// A default confidence (0-100) to pre-fill from the top suggestion.
export function suggestedConfidence(suggestions: Suggestion[]): number {
  if (!suggestions.length) return 70;
  return Math.round(50 + suggestions[0].score * 45);
}
