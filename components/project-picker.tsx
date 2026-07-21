"use client";

import { useState } from "react";
import { Check, FolderPlus, Loader2 } from "lucide-react";
import { useCreateProject, useProjects } from "@/lib/hooks";
import { getCurrentProjectId, setCurrentProjectId } from "@/lib/project";
import type { Project } from "@/lib/api";

// A small project switcher for the study tools. Changing project reloads so all
// data (sources, annotations, profiles, scores) re-fetches for the new project.
export function ProjectPicker() {
  const { data: projects = [] } = useProjects();
  const create = useCreateProject();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const current = getCurrentProjectId();

  function switchTo(id: string) {
    if (id === current) return;
    setCurrentProjectId(id);
    window.location.reload();
  }

  async function add() {
    if (!name.trim()) return;
    const p = await create.mutateAsync({ name: name.trim() });
    setCurrentProjectId(p.id);
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={current}
        onChange={(e) => switchTo(e.target.value)}
        className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent"
        title="Current project"
      >
        {projects.map((p: Project) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
        {!projects.length && <option value={current}>Loading…</option>}
      </select>

      {adding ? (
        <span className="inline-flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="New project name"
            className="w-40 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button onClick={add} disabled={create.isPending || !name.trim()} className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white disabled:opacity-40" title="Create">
            {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
        </span>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm text-muted transition hover:border-accent hover:text-accent" title="New project">
          <FolderPlus size={14} /> New
        </button>
      )}
    </div>
  );
}
