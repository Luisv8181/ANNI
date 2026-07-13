"use client";

import { create } from "zustand";
import { seedAnnotations, seedSuggestions } from "./data";
import { AISuggestion, Annotation, PromptCompilation } from "./types";

type AnniState = {
  hasRead: boolean;
  annotations: Annotation[];
  suggestions: AISuggestion[];
  selectedOntologyId: string;
  compilations: PromptCompilation[];
  setHasRead: (value: boolean) => void;
  setSelectedOntologyId: (id: string) => void;
  addAnnotation: (annotation: Omit<Annotation, "id" | "status" | "reviewer" | "createdAt">) => void;
  setAnnotationStatus: (id: string, status: Annotation["status"]) => void;
  decideSuggestion: (id: string, decision: AISuggestion["decision"]) => void;
  addCompilation: (compilation: PromptCompilation) => void;
};

export const useAnniStore = create<AnniState>((set) => ({
  hasRead: false,
  annotations: seedAnnotations,
  suggestions: seedSuggestions,
  selectedOntologyId: "emotion-hesitation",
  compilations: [],
  setHasRead: (value) => set({ hasRead: value }),
  setSelectedOntologyId: (id) => set({ selectedOntologyId: id }),
  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [
        {
          ...annotation,
          id: `a${state.annotations.length + 1}`,
          status: "submitted",
          reviewer: "current user",
          createdAt: new Date().toISOString()
        },
        ...state.annotations
      ]
    })),
  setAnnotationStatus: (id, status) =>
    set((state) => ({
      annotations: state.annotations.map((annotation) => (annotation.id === id ? { ...annotation, status } : annotation))
    })),
  decideSuggestion: (id, decision) =>
    set((state) => ({
      suggestions: state.suggestions.map((suggestion) =>
        suggestion.id === id ? { ...suggestion, decision } : suggestion
      )
    })),
  addCompilation: (compilation) => set((state) => ({ compilations: [compilation, ...state.compilations] }))
}));
