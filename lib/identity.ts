"use client";

import { useEffect, useState } from "react";

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const KEY = "anni_reviewer_id";

export function useCurrentUser(): string {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    let stored = localStorage.getItem(KEY);
    if (!stored) {
      stored = generateId();
      localStorage.setItem(KEY, stored);
    }
    setId(stored);
  }, []);

  return id;
}

export function getCurrentUser(): string {
  if (typeof window === "undefined") return "";
  let stored = localStorage.getItem(KEY);
  if (!stored) {
    stored = generateId();
    localStorage.setItem(KEY, stored);
  }
  return stored;
}
