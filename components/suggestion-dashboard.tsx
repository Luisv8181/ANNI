"use client";

import { Bot, Check, Loader2 } from "lucide-react";
import { useAnnotations, useDecideSuggestion, useSuggestions } from "@/lib/hooks";
import { useOntologyNodes } from "@/lib/hooks";
import type { Annotation } from "@/lib/api";
import { PanelTitle } from "./ui";

const DEMO_PROJECT_ID = "proj-anni-demo";

type Props = {
  focusedAnnotationId: string | null;
};

export function SuggestionDashboard({ focusedAnnotationId }: Props) {
  const { data: suggestions = [] } = useSuggestions(focusedAnnotationId);
  const { data: annotations = [] } = useAnnotations(DEMO_PROJECT_ID);
  const { data: ontologyNodes = [] } = useOntologyNodes();
  const decideSuggestion = useDecideSuggestion();

  const pendingCount = suggestions.filter((s) => s.decision === "pending").length;

  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <PanelTitle icon={<Bot size={18} />} title="Comparison dashboard" />
        <div className="rounded-full bg-mint px-3 py-2 text-sm font-medium text-[#206640]">
          {!focusedAnnotationId
            ? "Select an annotation to view suggestions"
            : suggestions.length === 0
            ? "Waiting for Ollama review..."
            : `${pendingCount} suggestion${pendingCount !== 1 ? "s" : ""} pending`}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {suggestions.length === 0 && focusedAnnotationId && (
          <div className="flex items-center gap-3 rounded-lg border border-line bg-panel p-4 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Ollama is reviewing this annotation...
          </div>
        )}
        {suggestions.map((suggestion) => {
          const ontology = ontologyNodes.find((n) => n.id === suggestion.ontology_node_id);
          const annotation = annotations.find((a: Annotation) => a.id === suggestion.annotation_id);
          return (
            <div
              key={suggestion.id}
              className="grid gap-3 rounded-lg border border-line bg-panel p-4 lg:grid-cols-[0.9fr_1.15fr_0.95fr]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Human</p>
                <p className="mt-2 font-semibold">{annotation?.ontology_label ?? ontology?.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Human annotation remains the baseline. AI cannot overwrite it.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  {suggestion.agent_name}
                </p>
                <p className="mt-2 font-semibold">{suggestion.suggestion}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{suggestion.rationale}</p>
                <p className="mt-2 text-sm">
                  Evidence: <span className="font-medium">"{suggestion.evidence_quote}"</span>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Final decision
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["accepted", "rejected", "modified", "merged"] as const).map((decision) => (
                    <button
                      key={decision}
                      onClick={() =>
                        decideSuggestion.mutate({
                          annotationId: suggestion.annotation_id,
                          suggestionId: suggestion.id,
                          decision,
                        })
                      }
                      className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition ${
                        suggestion.decision === decision
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-white hover:border-accent"
                      }`}
                    >
                      {decision}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                  <Check size={16} />
                  Confidence {suggestion.confidence}% · {suggestion.decision}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
