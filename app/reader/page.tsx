"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpenText,
  Check,
  CheckCircle2,
  FilePlus2,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useCurrentUser } from "@/lib/identity";
import {
  useAnnotationStats,
  useAnnotations,
  useIngestSource,
  useOntologyNodes,
  useParagraphs,
  useSources,
  useSubmitAnnotation,
  useSubmitReadConfirmation,
} from "@/lib/hooks";
import { suggestTraits, suggestedConfidence, type Suggestion } from "@/lib/smart-highlight";
import type { OntologyNode, Paragraph, Source } from "@/lib/api";

const PROJECT_ID = "proj-anni-demo";
type Sel = { paragraphId: string; quote: string; start: number; end: number };

export default function ReaderPage() {
  const qc = useQueryClient();
  const reviewerId = useCurrentUser();
  const { data: sources = [] } = useSources(PROJECT_ID);
  const { data: ontology = [] } = useOntologyNodes();
  const { data: annotations = [] } = useAnnotations(PROJECT_ID);
  const { data: stats } = useAnnotationStats(PROJECT_ID);
  const ingest = useIngestSource();
  const confirmRead = useSubmitReadConfirmation();
  const submit = useSubmitAnnotation(PROJECT_ID);

  const [sourceId, setSourceId] = useState("");
  const [confBySource, setConfBySource] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<Sel | null>(null);
  const [ontologyId, setOntologyId] = useState("");
  const [confidence, setConfidence] = useState(75);
  const [note, setNote] = useState("");
  const [showImport, setShowImport] = useState(false);

  const { data: paragraphs = [] } = useParagraphs(sourceId);

  useEffect(() => {
    if (!sourceId && sources.length) setSourceId(sources[0].id);
  }, [sources, sourceId]);

  const confId = confBySource[sourceId] ?? null;
  const activeSource = sources.find((s) => s.id === sourceId);
  const selParagraph = paragraphs.find((p) => p.id === sel?.paragraphId);

  const suggestions: Suggestion[] = useMemo(() => {
    if (!sel || !selParagraph) return [];
    return suggestTraits(sel.quote, selParagraph.text, ontology);
  }, [sel, selParagraph, ontology]);

  function resetDraft() {
    setSel(null);
    setOntologyId("");
    setNote("");
    setConfidence(75);
  }

  function pickSource(id: string) {
    setSourceId(id);
    resetDraft();
  }

  async function handleConfirmRead() {
    if (confId || !reviewerId || !sourceId) return;
    try {
      const res = await confirmRead.mutateAsync(sourceId);
      setConfBySource((m) => ({ ...m, [sourceId]: res.id }));
    } catch {
      /* backend offline */
    }
  }

  function captureSelection(p: Paragraph, el: HTMLElement) {
    const s = window.getSelection();
    const text = s?.toString().replace(/\s+/g, " ").trim() ?? "";
    if (text.length < 3 || !s || !el.contains(s.anchorNode)) return;
    const start = p.text.indexOf(text);
    if (start < 0) return;
    setSel({ paragraphId: p.id, quote: text, start, end: start + text.length });
    setOntologyId("");
    setNote("");
    // pre-fill from the top smart suggestion
    const sugg = suggestTraits(text, p.text, ontology);
    if (sugg.length) {
      setOntologyId(sugg[0].node.id);
      setConfidence(suggestedConfidence(sugg));
    }
  }

  async function addAnnotation() {
    if (!sel || !ontologyId || !confId || !reviewerId) return;
    try {
      await submit.mutateAsync({
        project_id: PROJECT_ID,
        ontology_node_id: ontologyId,
        relationship: "supports",
        confidence,
        note: note.trim() || "(no note added)",
        evidence: {
          source_id: sourceId,
          paragraph_id: sel.paragraphId,
          character_start: sel.start,
          character_end: sel.end,
          quote: sel.quote,
        },
        reviewer_id: reviewerId,
        read_confirmation_id: confId,
      });
      qc.invalidateQueries({ queryKey: ["annotation-stats", PROJECT_ID] });
      resetDraft();
    } catch {
      /* surfaced by mutation state */
    }
  }

  return (
    <main className="min-h-screen pb-16">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white shadow-soft">
            <BookOpenText size={17} />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Lab Reader</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Ingest · cite · smart-annotate</p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-muted shadow-sm transition hover:border-accent hover:text-accent"
        >
          <ArrowLeft size={15} /> Workspace
        </Link>
      </header>

      {/* source bar */}
      <section className="mx-auto max-w-6xl px-5">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white p-3 shadow-soft">
          <span className="pl-1 text-xs font-medium uppercase tracking-wider text-muted">Source</span>
          <div className="flex flex-1 flex-wrap gap-2">
            {sources.map((s: Source) => (
              <button
                key={s.id}
                onClick={() => pickSource(s.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  sourceId === s.id ? "border-accent bg-lilac font-medium" : "border-line bg-panel hover:border-accent/50"
                }`}
              >
                {cleanTitle(s.title)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowImport((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white transition hover:bg-accent"
          >
            <FilePlus2 size={15} /> Import a source
          </button>
        </div>

        <AnimatePresence>
          {showImport && (
            <ImportForm
              onIngest={async (body) => {
                const res = await ingest.mutateAsync(body);
                setShowImport(false);
                pickSource(res.source.id);
              }}
              pending={ingest.isPending}
              error={ingest.isError}
            />
          )}
        </AnimatePresence>
      </section>

      <div className="mx-auto mt-4 grid max-w-6xl gap-5 px-5 lg:grid-cols-[1.4fr_1fr]">
        {/* reader */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{cleanTitle(activeSource?.title ?? "…")}</h1>
              <p className="mt-1 text-xs text-muted">
                {activeSource?.author ? `${activeSource.author} · ` : ""}
                {activeSource?.canonical_url ? (
                  <a href={activeSource.canonical_url} className="text-accent underline" target="_blank" rel="noreferrer">
                    source
                  </a>
                ) : "no link"}{" "}
                · license: {activeSource?.license_status ?? "—"}
              </p>
            </div>
            {confId ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-xs font-medium text-[#177a4d]">
                <CheckCircle2 size={13} /> Reading confirmed
              </span>
            ) : (
              <button
                onClick={handleConfirmRead}
                disabled={confirmRead.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-xs font-medium text-white transition hover:bg-accent disabled:opacity-50"
              >
                {confirmRead.isPending ? <Loader2 size={13} className="animate-spin" /> : null}
                I&apos;ve read this
              </button>
            )}
          </div>

          {!confId && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber p-3 text-xs leading-6 text-[#75521d]">
              Confirm you personally read the source before highlighting — ANNI records this in the audit trail.
            </p>
          )}

          <div className={`space-y-3 ${!confId ? "pointer-events-none opacity-50" : ""}`}>
            {paragraphs.map((p: Paragraph) => (
              <ReaderParagraph key={p.id} paragraph={p} sel={sel} onSelect={captureSelection} />
            ))}
            {paragraphs.length === 0 && <p className="text-sm text-muted">No text yet — import a source to read.</p>}
          </div>
        </section>

        {/* right column: smart assistant + tracker */}
        <div className="space-y-5">
          <SmartAssistant
            sel={sel}
            suggestions={suggestions}
            ontology={ontology}
            ontologyId={ontologyId}
            setOntologyId={setOntologyId}
            confidence={confidence}
            setConfidence={setConfidence}
            note={note}
            setNote={setNote}
            onAdd={addAnnotation}
            canAdd={!!(sel && ontologyId && confId)}
            pending={submit.isPending}
          />
          <TrackerPanel stats={stats} annotationCount={annotations.length} />
        </div>
      </div>
    </main>
  );
}

// ── Import form ───────────────────────────────────────────────────────────────

function ImportForm({
  onIngest,
  pending,
  error,
}: {
  onIngest: (body: {
    project_id: string;
    title: string;
    author?: string | null;
    canonical_url?: string | null;
    license_status?: string;
    raw_text: string;
  }) => void;
  pending: boolean;
  error: boolean;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [license, setLicense] = useState("unverified — check before use");
  const [raw, setRaw] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold tracking-tight">
          <FilePlus2 size={16} className="text-accent" /> Ingest &amp; cite a source
        </h2>
        <p className="mt-1 text-xs text-muted">
          Paste the text; ANNI cites it, content-hashes it, and formats it into paragraphs for the reader.
          <b> Only paste text you&apos;re cleared to use.</b>
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Title *" value={title} onChange={setTitle} placeholder="My experience with GAD therapy" />
          <Field label="Author" value={author} onChange={setAuthor} placeholder="Anonymous blogger" />
          <Field label="Source URL" value={url} onChange={setUrl} placeholder="https://…" />
          <Field label="License / terms" value={license} onChange={setLicense} placeholder="CC-BY / permission…" />
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">Source text *</span>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={6}
            placeholder="Paste the testimony or case text here. Blank lines become paragraph breaks."
            className="mt-1.5 w-full rounded-xl border border-line bg-panel p-3 text-sm outline-none focus:border-accent"
          />
        </label>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() =>
              onIngest({
                project_id: PROJECT_ID,
                title: title.trim(),
                author: author.trim() || null,
                canonical_url: url.trim() || null,
                license_status: license.trim() || "unverified",
                raw_text: raw,
              })
            }
            disabled={pending || !title.trim() || raw.trim().length < 10}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Ingest into the reader
          </button>
          {error && <span className="text-sm text-red-600">Ingest failed — is the backend running?</span>}
        </div>
      </div>
    </motion.div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

// ── Reader paragraph (selectable) ─────────────────────────────────────────────

function ReaderParagraph({ paragraph, sel, onSelect }: { paragraph: Paragraph; sel: Sel | null; onSelect: (p: Paragraph, el: HTMLElement) => void }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isThis = sel?.paragraphId === paragraph.id;
  const content = useMemo(() => {
    if (!isThis || !sel) return paragraph.text;
    return (
      <>
        {paragraph.text.slice(0, sel.start)}
        <mark className="rounded bg-accent/20 px-0.5 text-ink underline decoration-accent decoration-2">
          {paragraph.text.slice(sel.start, sel.end)}
        </mark>
        {paragraph.text.slice(sel.end)}
      </>
    );
  }, [isThis, sel, paragraph.text]);

  return (
    <p
      ref={ref}
      onMouseUp={() => ref.current && onSelect(paragraph, ref.current)}
      className={`cursor-text rounded-xl border p-4 text-[15.5px] leading-8 transition hover:border-accent/50 ${
        isThis ? "border-accent bg-lilac" : "border-line bg-panel"
      }`}
    >
      {content}
    </p>
  );
}

// ── Smart assistant ───────────────────────────────────────────────────────────

function SmartAssistant({
  sel,
  suggestions,
  ontology,
  ontologyId,
  setOntologyId,
  confidence,
  setConfidence,
  note,
  setNote,
  onAdd,
  canAdd,
  pending,
}: {
  sel: Sel | null;
  suggestions: Suggestion[];
  ontology: OntologyNode[];
  ontologyId: string;
  setOntologyId: (id: string) => void;
  confidence: number;
  setConfidence: (n: number) => void;
  note: string;
  setNote: (s: string) => void;
  onAdd: () => void;
  canAdd: boolean;
  pending: boolean;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <h2 className="flex items-center gap-2 font-semibold tracking-tight">
        <Wand2 size={16} className="text-accent" /> Smart highlighter
      </h2>
      {!sel ? (
        <p className="mt-2 text-sm text-muted">
          Select a phrase in the reader. The assistant will suggest the traits it most likely supports —
          you confirm.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="rounded-xl border border-accent/40 bg-lilac p-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-accent">Highlighted</p>
            <p className="mt-1 text-sm font-medium">“{sel.quote}”</p>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
              <Sparkles size={12} /> Suggested traits
            </p>
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted">No confident suggestion — pick a trait below.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s.node.id}
                    onClick={() => {
                      setOntologyId(s.node.id);
                      setConfidence(Math.round(50 + s.score * 45));
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      ontologyId === s.node.id ? "border-accent bg-accent text-white" : "border-line bg-panel text-ink hover:border-accent/60"
                    }`}
                    title={s.hits.length ? `matched: ${s.hits.join(", ")}` : ""}
                  >
                    {s.node.label} · {Math.round(s.score * 100)}%
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-xs font-medium text-muted">Trait (or override the suggestion)</span>
            <select
              value={ontologyId}
              onChange={(e) => setOntologyId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="">— choose a trait —</option>
              {ontology.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <div className="flex justify-between text-xs text-muted">
              <span>Your confidence</span>
              <span className="tabular-nums">{confidence}%</span>
            </div>
            <input type="range" min={0} max={100} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="mt-2 w-full accent-accent" />
          </div>

          <label className="block">
            <span className="text-xs font-medium text-muted">Why? (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-line bg-panel p-2.5 text-sm outline-none focus:border-accent"
            />
          </label>

          <button
            onClick={onAdd}
            disabled={!canAdd || pending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Add annotation
          </button>
        </div>
      )}
    </section>
  );
}

// ── Tracker ───────────────────────────────────────────────────────────────────

function TrackerPanel({ stats, annotationCount }: { stats?: { total: number; approved: number; submitted: number; avg_confidence: number; reviewers: number; ai_reviewed: number; ai_agreements: number; by_trait: { label: string; count: number }[]; by_decision: { label: string; count: number }[] }; annotationCount: number }) {
  const total = stats?.total ?? annotationCount;
  const agreePct = stats && stats.ai_reviewed ? Math.round((stats.ai_agreements / stats.ai_reviewed) * 100) : null;
  const peak = Math.max(1, ...(stats?.by_trait ?? []).map((t) => t.count));

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <h2 className="font-semibold tracking-tight">How we annotate</h2>
      <p className="mt-1 text-xs text-muted">Live tracker across the project.</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Annotations" value={total.toString()} />
        <Stat label="Approved" value={(stats?.approved ?? 0).toString()} />
        <Stat label="Avg confidence" value={`${stats?.avg_confidence ?? 0}%`} />
        <Stat label="AI agreement" value={agreePct === null ? "—" : `${agreePct}%`} />
      </div>

      {stats && stats.by_trait.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Trait distribution</p>
          <div className="space-y-1.5">
            {stats.by_trait.map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <span className="w-40 shrink-0 truncate text-xs">{t.label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-panel">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(t.count / peak) * 100}%` }} />
                </div>
                <span className="w-5 text-right text-xs tabular-nums text-muted">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && stats.by_decision.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Decisions</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.by_decision.map((d) => (
              <span key={d.label} className="rounded-full bg-panel px-2.5 py-1 text-xs">
                {d.label}: <b>{d.count}</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-3">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  );
}

function cleanTitle(title: string): string {
  return title.replace(/ — synthetic testimony$/, "");
}
