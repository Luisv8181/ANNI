"use client";

import { useEffect, useState } from "react";

// The "current project" for the study tools (reader / lab / score). Persisted in
// localStorage so it survives navigation. Defaults to the demo project.
const KEY = "anni_current_project";
export const DEFAULT_PROJECT = "proj-anni-demo";

export function getCurrentProjectId(): string {
  if (typeof window === "undefined") return DEFAULT_PROJECT;
  return localStorage.getItem(KEY) || DEFAULT_PROJECT;
}

export function setCurrentProjectId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, id);
}

export function useCurrentProjectId(): string {
  const [id, setId] = useState<string>(DEFAULT_PROJECT);
  useEffect(() => {
    setId(getCurrentProjectId());
  }, []);
  return id;
}
