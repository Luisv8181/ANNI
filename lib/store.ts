"use client";

import { create } from "zustand";

type AnniState = {
  hasRead: boolean;
  selectedOntologyId: string;
  readConfirmationId: string | null;
  setHasRead: (value: boolean) => void;
  setSelectedOntologyId: (id: string) => void;
  setReadConfirmationId: (id: string) => void;
};

export const useAnniStore = create<AnniState>((set) => ({
  hasRead: false,
  selectedOntologyId: "emotion-hesitation",
  readConfirmationId: null,
  setHasRead: (value) => set({ hasRead: value }),
  setSelectedOntologyId: (id) => set({ selectedOntologyId: id }),
  setReadConfirmationId: (id) => set({ readConfirmationId: id }),
}));
