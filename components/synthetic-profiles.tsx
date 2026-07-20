"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { usePromptCompilations, useAnnotations } from "@/lib/hooks";
import type { Annotation, PromptCompilation } from "@/lib/api";
import { PanelTitle } from "./ui";

const DEMO_PROJECT_ID = "proj-anni-demo";

export function SyntheticProfiles() {
  const { data: profiles = [] } = usePromptCompilations(DEMO_PROJECT_ID);
  const { data: annotations = [] } = useAnnotations(DEMO_PROJECT_ID);
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = profiles.find((p) => p.id === activeId) ?? profiles[0] ?? null;

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <PanelTitle icon={<Sparkles size={18} />} title="Synthetic patient profiles" />
        <span className="hidden items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-xs font-medium text-ink md:inline-flex">
          <ShieldCheck size={13} /> Compiled from approved annotations only
        </span>
      </div>

      {profiles.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No compiled profiles yet. Approve annotations and compile a prompt to see synthetic patient profiles here.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                annotations={annotations}
                selected={active?.id === profile.id}
                onSelect={() => setActiveId(profile.id)}
              />
            ))}
          </div>
          {active && <CompiledPrompt profile={active} />}
        </div>
      )}
    </section>
  );
}

function ProfileCard({
  profile,
  annotations,
  selected,
  onSelect,
}: {
  profile: PromptCompilation;
  annotations: Annotation[];
  selected: boolean;
  onSelect: () => void;
}) {
  const traits = annotations.filter((a) => profile.annotation_ids.includes(a.id));
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition ${
        selected ? "border-accent bg-lilac shadow-sm" : "border-line bg-panel hover:border-accent/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold tracking-tight">{profile.name}</p>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs text-muted">
          {profile.annotation_ids.length} traits
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {traits.map((trait) => (
          <span key={trait.id} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-accent">
            {trait.ontology_label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        compiler v{profile.compiler_version} · ontology v{profile.ontology_version}
      </p>
    </button>
  );
}

function CompiledPrompt({ profile }: { profile: PromptCompilation }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(profile.system_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col rounded-lg border border-line bg-ink p-4 text-white">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white/70">Compiled system prompt · {profile.name}</p>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="scrollbar-thin max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-md bg-black/30 p-3 text-xs leading-6 text-white/90">
        {profile.system_prompt}
      </pre>
      <p className="mt-3 text-[11px] leading-5 text-white/50">
        Provenance embedded at compile time — this persona cannot exceed its approved behavioral profile.
      </p>
    </div>
  );
}
