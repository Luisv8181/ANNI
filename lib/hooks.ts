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

export function useSubmitAnnotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createAnnotation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["annotations"] });
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
