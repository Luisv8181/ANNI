"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { getCurrentUser } from "./identity";

// ── Ontology ─────────────────────────────────────────────────────────────────

export function useOntologyNodes() {
  return useQuery({
    queryKey: ["ontology-nodes"],
    queryFn: api.getOntologyNodes,
    staleTime: Infinity,
  });
}

// ── Projects ─────────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
    staleTime: 60_000,
  });
}

// ── Sources & paragraphs ──────────────────────────────────────────────────────

export function useSources(projectId?: string) {
  return useQuery({
    queryKey: ["sources", projectId],
    queryFn: () => api.getSources(projectId),
    staleTime: 60_000,
  });
}

export function useParagraphs(sourceId: string) {
  return useQuery({
    queryKey: ["paragraphs", sourceId],
    queryFn: () => api.getParagraphs(sourceId),
    enabled: !!sourceId,
    staleTime: Infinity,
  });
}

// ── Read confirmation ─────────────────────────────────────────────────────────

export function useSubmitReadConfirmation() {
  return useMutation({
    mutationFn: (sourceId: string) =>
      api.createReadConfirmation({
        source_id: sourceId,
        reviewer_id: getCurrentUser(),
      }),
  });
}

// ── Annotations ───────────────────────────────────────────────────────────────

export function useAnnotations(projectId?: string) {
  return useQuery({
    queryKey: ["annotations", projectId],
    queryFn: () => api.getAnnotations(projectId),
    staleTime: 0,
  });
}

export function useSubmitAnnotation(projectId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAnnotation,
    onMutate: async (payload) => {
      const key = ["annotations", projectId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old: unknown[] = []) => [
        {
          id: `optimistic-${Date.now()}`,
          project_id: payload.project_id,
          paragraph_id: payload.evidence.paragraph_id,
          ontology_node_id: payload.ontology_node_id,
          ontology_label: null,
          reviewer_id: payload.reviewer_id,
          evidence_quote: payload.evidence.quote,
          confidence: payload.confidence,
          note: payload.note,
          status: "submitted",
          created_at: new Date().toISOString(),
          decisions: [],
        },
        ...old,
      ]);
      return { previous, key };
    },
    onError: (_err, _payload, context) => {
      if (context) qc.setQueryData(context.key, context.previous);
    },
    onSettled: (_data, _err, _payload, context) => {
      if (context) qc.invalidateQueries({ queryKey: context.key });
    },
  });
}

export function useDecideAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ annotationId, decision, note }: { annotationId: string; decision: string; note: string }) =>
      api.decideAnnotation(annotationId, {
        decision,
        review_note: note,
        decided_by: getCurrentUser(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annotations"] });
    },
  });
}

// ── Prompt compilations (synthetic patient profiles) ──────────────────────────

export function usePromptCompilations(projectId?: string) {
  return useQuery({
    queryKey: ["prompt-compilations", projectId],
    queryFn: () => api.getPromptCompilations(projectId),
    staleTime: 0,
  });
}

// ── Synthetic Patient Lab ─────────────────────────────────────────────────────

export function useLabConfig(projectId?: string) {
  return useQuery({
    queryKey: ["lab-config", projectId],
    queryFn: () => api.getLabConfig(projectId),
    staleTime: 60_000,
  });
}

export function useLabMessage() {
  return useMutation({ mutationFn: api.labMessage });
}

// ── AI Suggestions ────────────────────────────────────────────────────────────

export function useSuggestions(annotationId: string | null) {
  return useQuery({
    queryKey: ["suggestions", annotationId],
    queryFn: () => api.getSuggestions(annotationId!),
    enabled: !!annotationId,
    refetchInterval: (query) => {
      // keep polling until at least one suggestion arrives
      const data = query.state.data;
      return !data || data.length === 0 ? 3000 : false;
    },
  });
}

export function useDecideSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      annotationId,
      suggestionId,
      decision,
    }: {
      annotationId: string;
      suggestionId: string;
      decision: string;
    }) =>
      api.decideSuggestion(annotationId, suggestionId, {
        decision,
        review_note: "",
        decided_by: getCurrentUser(),
      }),
    onSuccess: (_data, { annotationId }) => {
      qc.invalidateQueries({ queryKey: ["suggestions", annotationId] });
    },
  });
}
