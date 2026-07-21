"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, Loader2, Network, Plus } from "lucide-react";
import { useCreateOntologyNode, useOntologyNodes } from "@/lib/hooks";
import type { OntologyNode } from "@/lib/api";

export default function OntologyPage() {
  const { data: nodes = [] } = useOntologyNodes();
  const create = useCreateOntologyNode();

  const [label, setLabel] = useState("");
  const [group, setGroup] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const groups = useMemo(() => {
    const by: Record<string, OntologyNode[]> = {};
    for (const n of nodes) (by[n.group] ??= []).push(n);
    return Object.entries(by).sort((a, b) => a[0].localeCompare(b[0]));
  }, [nodes]);
  const existingGroups = Array.from(new Set(nodes.map((n) => n.group)));

  async function add() {
    setErr(null);
    if (!label.trim() || !group.trim() || !description.trim()) return;
    try {
      await create.mutateAsync({ label: label.trim(), group: group.trim(), description: description.trim() });
      setLabel(""); setDescription("");
    } catch (e) {
      setErr(e instanceof Error ? shortErr(e.message) : "Couldn't add — is the backend running?");
    }
  }

  return (
    <main className="min-h-screen pb-16">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white shadow-soft"><Network size={17} /></div>
          <div>
            <p className="font-semibold tracking-tight">Ontology</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{nodes.length} traits · v0.1</p>
          </div>
        </div>
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-muted shadow-sm transition hover:border-accent hover:text-accent">
          <ArrowLeft size={15} /> Workspace
        </Link>
      </header>

      <div className="mx-auto grid max-w-4xl gap-5 px-5 lg:grid-cols-[1.3fr_1fr]">
        {/* existing traits */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h1 className="text-lg font-semibold tracking-tight">Traits</h1>
          <p className="mt-1 text-xs text-muted">The tag set used across annotation. Grouped by category.</p>
          <div className="mt-4 space-y-5">
            {groups.map(([g, list]) => (
              <div key={g}>
                <p className="text-[11px] font-medium uppercase tracking-wider text-accent">{g}</p>
                <div className="mt-2 space-y-2">
                  {list.map((n) => (
                    <div key={n.id} className="rounded-xl border border-line bg-panel p-3">
                      <p className="text-sm font-semibold">{n.label}</p>
                      <p className="mt-0.5 text-[13px] leading-6 text-muted">{n.description}</p>
                      <p className="mt-1 font-mono text-[10px] text-faint" style={{ color: "#98909f" }}>{n.id} · v{n.version}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* add trait */}
        <section className="h-fit rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-semibold tracking-tight"><Plus size={16} className="text-accent" /> Add a trait</h2>
          <p className="mt-1 text-xs leading-5 text-muted">
            Only add a trait the team has agreed on — it changes the coding scheme (adds are audited).
          </p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-muted">Label *</span>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Financial stress" className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">Group *</span>
              <input value={group} onChange={(e) => setGroup(e.target.value)} list="groups" placeholder="e.g. Life context" className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent" />
              <datalist id="groups">{existingGroups.map((g) => <option key={g} value={g} />)}</datalist>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted">Definition *</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="When to tag this — inclusion/exclusion in one or two sentences." className="mt-1.5 w-full rounded-lg border border-line bg-panel p-2.5 text-sm outline-none focus:border-accent" />
            </label>
            <button onClick={add} disabled={create.isPending || !label.trim() || !group.trim() || !description.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40">
              {create.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Add trait
            </button>
            {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
          <p className="mt-4 rounded-lg bg-panel p-3 text-[11px] leading-5 text-muted">
            After adding, update <b>annotation-codebook.md</b> with the trait&apos;s include/exclude rules and
            examples, and note the ontology version bump. The smart-highlighter cues won&apos;t cover a brand-new
            trait yet — pick it manually until cues are added.
          </p>
        </section>
      </div>
    </main>
  );
}

function shortErr(msg: string): string {
  const m = msg.match(/"detail":"([^"]+)"/);
  return m ? m[1] : "Couldn't add the trait.";
}
