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
  Clock,
  Copy,
  Download,
  FilePlus2,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useCurrentUser } from "@/lib/identity";
import {
  useAnnotationAssist,
  useAnnotationStats,
  useAnnotations,
  useGeneratePrompt,
  useIngestFile,
  useIngestSource,
  useIngestUrl,
  useOntologyNodes,
  useParagraphs,
  useSources,
  useSubmitAnnotation,
  useSubmitReadConfirmation,
} from "@/lib/hooks";
import { suggestTraits, suggestedConfidence, type Suggestion } from "@/lib/smart-highlight";
import { getCurrentProjectId } from "@/lib/project";
import { ProjectPicker } from "@/components/project-picker";
import type { AssistResponse, Citation, GeneratePromptResponse, OntologyNode, Paragraph, Source } from "@/lib/api";

const PROJECT_ID = getCurrentProjectId();
type Sel = { paragraphId: string; quote: string; start: number; end: number };
type LogEntry = { id: string; trait: string; confidence: number; quote: string; source: string; at: number };

function fmtDuration(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

export default function ReaderPage() {
  const qc = useQueryClient();
  const reviewerId = useCurrentUser();
  const { data: sources = [] } = useSources(PROJECT_ID);
  const { data: ontology = [] } = useOntologyNodes();
  const { data: annotations = [] } = useAnnotations(PROJECT_ID);
  const { data: stats } = useAnnotationStats(PROJECT_ID);
  const confirmRead = useSubmitReadConfirmation();
  const submit = useSubmitAnnotation(PROJECT_ID);
  const generate = useGeneratePrompt();
  const assist = useAnnotationAssist();
  const [modelSuggestion, setModelSuggestion] = useState<AssistResponse | null>(null);

  const [sourceId, setSourceId] = useState("");
  const [confBySource, setConfBySource] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<Sel | null>(null);
  const [ontologyId, setOntologyId] = useState("");
  const [confidence, setConfidence] = useState(75);
  const [note, setNote] = useState("");
  const [showImport, setShowImport] = useState(false);

  // Session tracking (for the end-of-session summary + prompt generator)
  const sessionStart = useRef<number>(Date.now());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

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
    setModelSuggestion(null);
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
    setModelSuggestion(null);
    // instant offline heuristic
    const sugg = suggestTraits(text, p.text, ontology);
    if (sugg.length) {
      setOntologyId(sugg[0].node.id);
      setConfidence(suggestedConfidence(sugg));
    }
    // ask the model too (used if Ollama is up; ignored otherwise)
    assist
      .mutateAsync({ project_id: PROJECT_ID, quote: text, paragraph: p.text })
      .then((res) => setModelSuggestion(res.available ? res : null))
      .catch(() => setModelSuggestion(null));
  }

  async function addAnnotation() {
    if (!sel || !ontologyId || !confId || !reviewerId) return;
    const traitLabel = ontology.find((n) => n.id === ontologyId)?.label ?? "Trait";
    const quote = sel.quote;
    try {
      const created = await submit.mutateAsync({
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
          quote,
        },
        reviewer_id: reviewerId,
        read_confirmation_id: confId,
      });
      setLog((l) => [
        ...l,
        { id: created.id, trait: traitLabel, confidence, quote, source: cleanTitle(activeSource?.title ?? sourceId), at: Date.now() },
      ]);
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
        <div className="flex items-center gap-3">
          <ProjectPicker />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-muted shadow-sm transition hover:border-accent hover:text-accent"
          >
            <ArrowLeft size={15} /> Workspace
          </Link>
        </div>
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
              onIngested={(id) => {
                setShowImport(false);
                pickSource(id);
              }}
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
            modelSuggestion={modelSuggestion}
            modelPending={assist.isPending}
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

      <SessionSummary
        log={log}
        elapsedMs={now - sessionStart.current}
        defaultName={cleanTitle(activeSource?.title ?? "Synthetic Patient")}
        onGenerate={(body) => generate.mutateAsync(body)}
        generating={generate.isPending}
        result={generate.data ?? null}
      />
    </main>
  );
}

// ── Import form ───────────────────────────────────────────────────────────────

function ImportForm({ onIngested }: { onIngested: (sourceId: string) => void }) {
  const ingest = useIngestSource();
  const ingestUrl = useIngestUrl();
  const ingestFile = useIngestFile();

  const [mode, setMode] = useState<"paste" | "url" | "file">("paste");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");
  const [license, setLicense] = useState("unverified — check before use");
  const [raw, setRaw] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const pending = ingest.isPending || ingestUrl.isPending || ingestFile.isPending;

  async function run() {
    setErr(null);
    try {
      if (mode === "paste") {
        const res = await ingest.mutateAsync({
          project_id: PROJECT_ID,
          title: title.trim(),
          author: author.trim() || null,
          canonical_url: url.trim() || null,
          license_status: license.trim() || "unverified",
          raw_text: raw,
        });
        onIngested(res.source.id);
      } else if (mode === "url") {
        const res = await ingestUrl.mutateAsync({
          project_id: PROJECT_ID,
          url: url.trim(),
          title: title.trim() || null,
          author: author.trim() || null,
          license_status: license.trim() || "unverified",
        });
        onIngested(res.source.id);
      } else {
        if (!file) return;
        const form = new FormData();
        form.append("project_id", PROJECT_ID);
        if (title.trim()) form.append("title", title.trim());
        if (author.trim()) form.append("author", author.trim());
        form.append("license_status", license.trim() || "unverified");
        form.append("file", file);
        const res = await ingestFile.mutateAsync(form);
        onIngested(res.source.id);
      }
    } catch (e) {
      setErr(e instanceof Error ? shortErr(e.message) : "Ingest failed — is the backend running?");
    }
  }

  const canRun =
    mode === "paste" ? title.trim() && raw.trim().length >= 10 : mode === "url" ? url.trim().length > 6 : !!file;

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
      <div className="mt-3 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h2 className="flex items-center gap-2 font-semibold tracking-tight">
          <FilePlus2 size={16} className="text-accent" /> Ingest &amp; cite a source
        </h2>
        <p className="mt-1 text-xs text-muted">
          ANNI cites it, content-hashes it, and formats it into paragraphs. <b>Only ingest sources you&apos;re cleared to use.</b>
        </p>

        <div className="mt-3 inline-flex rounded-lg border border-line bg-panel p-0.5 text-sm">
          {(["paste", "url", "file"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 font-medium capitalize transition ${mode === m ? "bg-accent text-white" : "text-muted hover:text-ink"}`}
            >
              {m === "url" ? "From URL" : m === "file" ? "PDF / file" : "Paste text"}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label={mode === "paste" ? "Title *" : "Title (optional — auto-detected)"} value={title} onChange={setTitle} placeholder="My experience with GAD therapy" />
          <Field label="Author" value={author} onChange={setAuthor} placeholder="Anonymous blogger" />
          {mode !== "file" && <Field label={mode === "url" ? "Source URL *" : "Source URL"} value={url} onChange={setUrl} placeholder="https://…" />}
          <Field label="License / terms" value={license} onChange={setLicense} placeholder="CC-BY / permission…" />
        </div>

        {mode === "paste" && (
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
        )}
        {mode === "url" && (
          <p className="mt-3 rounded-lg bg-panel p-3 text-xs leading-5 text-muted">
            ANNI fetches the page and extracts the readable text. Messy pages may need cleanup — you can
            switch to <b>Paste text</b> and fix it by hand. The license gate still applies.
          </p>
        )}
        {mode === "file" && (
          <label className="mt-3 block">
            <span className="text-xs font-medium text-muted">PDF or .txt file *</span>
            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-lilac file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent"
            />
            <span className="mt-1 block text-[11px] text-muted">Scanned (image-only) PDFs won&apos;t extract — paste the text instead.</span>
          </label>
        )}

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={run}
            disabled={pending || !canRun}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {mode === "url" ? "Fetch & ingest" : mode === "file" ? "Upload & ingest" : "Ingest into the reader"}
          </button>
          {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
      </div>
    </motion.div>
  );
}

function shortErr(msg: string): string {
  const m = msg.match(/"detail":"([^"]+)"/);
  return m ? m[1] : msg.length > 120 ? "Ingest failed — is the backend running?" : msg;
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
  modelSuggestion,
  modelPending,
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
  modelSuggestion: AssistResponse | null;
  modelPending: boolean;
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

          {modelPending && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 size={12} className="animate-spin" /> asking the model…
            </div>
          )}
          {modelSuggestion?.available && modelSuggestion.ontology_node_id && (
            <div className="rounded-xl border border-accent/40 bg-lilac p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                <Wand2 size={12} /> Model suggestion · {modelSuggestion.model_name}
              </p>
              <p className="mt-1 text-sm font-medium">
                {modelSuggestion.label} · {modelSuggestion.confidence}%
              </p>
              {modelSuggestion.rationale && <p className="mt-1 text-xs leading-5 text-muted">{modelSuggestion.rationale}</p>}
              <button
                onClick={() => {
                  setOntologyId(modelSuggestion.ontology_node_id!);
                  if (modelSuggestion.confidence) setConfidence(modelSuggestion.confidence);
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
              >
                <Check size={12} /> Use this
              </button>
            </div>
          )}

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
              <Sparkles size={12} /> Suggested traits <span className="text-faint" style={{ color: "#98909f" }}>(offline)</span>
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

// ── Session summary + prompt generator ────────────────────────────────────────

const OUTCOMES = [
  { id: "open", label: "Open (free to improve or worsen)" },
  { id: "closed_failure", label: "Closed — treatment failure" },
];
const RISKS = [
  { id: "none", label: "None" },
  { id: "subtle", label: "Subtle" },
  { id: "ambiguous", label: "Ambiguous" },
  { id: "explicit", label: "Explicit" },
];

function SessionSummary({
  log,
  elapsedMs,
  defaultName,
  onGenerate,
  generating,
  result,
}: {
  log: LogEntry[];
  elapsedMs: number;
  defaultName: string;
  onGenerate: (body: { persona_name: string; annotation_ids: string[]; outcome_mode: string; risk_level: string; include_dsm5: boolean }) => Promise<unknown>;
  generating: boolean;
  result: GeneratePromptResponse | null;
}) {
  const [name, setName] = useState("");
  const [outcome, setOutcome] = useState("open");
  const [risk, setRisk] = useState("none");
  const [dsm5, setDsm5] = useState(true);

  const distinctTraits = new Set(log.map((l) => l.trait)).size;
  const distinctSources = new Set(log.map((l) => l.source)).size;
  const avgConf = log.length ? Math.round(log.reduce((a, l) => a + l.confidence, 0) / log.length) : 0;
  const avgPer = log.length ? fmtDuration(elapsedMs / log.length) : "0:00";

  return (
    <section className="mx-auto mt-6 max-w-6xl px-5">
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Clock size={17} className="text-accent" />
          <h2 className="text-lg font-semibold tracking-tight">Session summary</h2>
          <span className="ml-auto font-mono text-sm text-muted">elapsed {fmtDuration(elapsedMs)}</span>
        </div>

        {log.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Add annotations above — a summary of this session, its timing and logs, and a ready-to-paste
            synthetic-profile system prompt will appear here.
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-6">
              <Stat label="Session length" value={fmtDuration(elapsedMs)} />
              <Stat label="Annotations" value={log.length.toString()} />
              <Stat label="Sources" value={distinctSources.toString()} />
              <Stat label="Distinct traits" value={distinctTraits.toString()} />
              <Stat label="Avg confidence" value={`${avgConf}%`} />
              <Stat label="Avg / annotation" value={avgPer} />
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Δ</th>
                    <th className="py-2 pr-3">Trait</th>
                    <th className="py-2 pr-3">Conf.</th>
                    <th className="py-2">Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((l, i) => (
                    <tr key={l.id} className="border-b border-line/60">
                      <td className="py-2 pr-3 tabular-nums text-muted">{i + 1}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted">{new Date(l.at).toLocaleTimeString()}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted">{i === 0 ? "—" : `+${Math.round((l.at - log[i - 1].at) / 1000)}s`}</td>
                      <td className="py-2 pr-3 font-medium">{l.trait}</td>
                      <td className="py-2 pr-3 tabular-nums">{l.confidence}%</td>
                      <td className="max-w-md truncate py-2 text-muted">“{l.quote}”</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* generator controls */}
            <div className="mt-6 rounded-xl border border-line bg-panel p-4">
              <h3 className="flex items-center gap-2 font-semibold tracking-tight">
                <Wand2 size={15} className="text-accent" /> Generate synthetic-profile system prompt
              </h3>
              <p className="mt-1 text-xs text-muted">
                Compiles this session&apos;s {log.length} annotation{log.length === 1 ? "" : "s"} into a
                pasteable prompt — DSM-5 GAD baseline + your cited traits + the chosen trajectory.
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <label className="block md:col-span-2">
                  <span className="text-xs font-medium text-muted">Persona name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={defaultName}
                    className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted">Outcome mode</span>
                  <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent">
                    {OUTCOMES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted">Planted risk</span>
                  <select value={risk} onChange={(e) => setRisk(e.target.value)} className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent">
                    {RISKS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" checked={dsm5} onChange={(e) => setDsm5(e.target.checked)} className="h-4 w-4 accent-accent" />
                  Include DSM-5 GAD baseline
                </label>
                <button
                  onClick={() => onGenerate({ persona_name: name.trim() || defaultName, annotation_ids: log.map((l) => l.id), outcome_mode: outcome, risk_level: risk, include_dsm5: dsm5 })}
                  disabled={generating}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  Generate system prompt
                </button>
              </div>
            </div>

            {result && <PromptBox result={result} />}
          </>
        )}
      </div>
    </section>
  );
}

function PromptBox({ result }: { result: GeneratePromptResponse }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(result.system_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }
  function download() {
    const blob = new Blob([result.system_prompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `synthetic-profile__${result.persona_name.replace(/\W+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-line">
      <div className="flex items-center gap-2 bg-ink px-4 py-2.5 text-white">
        <Wand2 size={14} className="text-[#c9b6ff]" />
        <span className="font-mono text-xs">
          synthetic_profile · {result.persona_name} · {result.trait_count} traits · {result.outcome_mode} · risk {result.risk_level}
        </span>
        <div className="ml-auto flex gap-2">
          <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1.5 text-xs transition hover:bg-white/25">
            {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={download} className="inline-flex items-center gap-1.5 rounded-md bg-white/12 px-2.5 py-1.5 text-xs transition hover:bg-white/25">
            <Download size={13} /> .md
          </button>
        </div>
      </div>
      <pre className="scrollbar-thin max-h-[440px] overflow-auto whitespace-pre-wrap break-words bg-ink px-4 py-3 font-mono text-xs leading-6 text-white/90">
        {result.system_prompt}
      </pre>
      <p className="bg-panel px-4 py-2 text-[11px] text-muted">
        Paste this as the system prompt in the Patient Lab, ChatGPT, or Ollama. The provenance footer + citations below trace every trait to a cited quote.
      </p>
      {result.citations.length > 0 && <CitationsBlock citations={result.citations} />}
    </div>
  );
}

function CitationsBlock({ citations }: { citations: Citation[] }) {
  const [open, setOpen] = useState(false);
  function download() {
    const lines = citations.map((c, i) => {
      const s = c.source;
      return [
        `## [${i + 1}] ${c.ontology.label ?? "Trait"}`,
        `Quote: "${c.evidence.quote}"`,
        `Source: ${s.title ?? s.id ?? "?"}${s.url ? ` <${s.url}>` : ""}`,
        `License: ${s.license_status ?? "?"} · version ${s.version ?? "?"} · sha256:${(s.content_hash ?? "none").slice(0, 16)}`,
        `Evidence: paragraph ${c.evidence.paragraph_order ?? "?"}, chars ${c.evidence.character_start}–${c.evidence.character_end}`,
        `Reviewer: ${c.human_annotation.reviewer_id.slice(0, 8)} · confidence ${c.human_annotation.confidence}% · status ${c.human_annotation.status}`,
        c.decisions.length ? `Decisions: ${c.decisions.map((d) => d.decision).join(", ")}` : "",
        "",
      ].filter(Boolean).join("\n");
    });
    const blob = new Blob([`# Citations & provenance\n\n${lines.join("\n")}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "profile-citations.md"; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="border-t border-line bg-white">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition hover:bg-panel">
        <Sparkles size={14} className="text-accent" /> Citations &amp; provenance ({citations.length})
        <button onClick={(e) => { e.stopPropagation(); download(); }} className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-xs text-muted transition hover:border-accent hover:text-accent">
          <Download size={12} /> .md
        </button>
      </button>
      {open && (
        <div className="space-y-2 px-4 pb-4">
          {citations.map((c, i) => (
            <div key={c.annotation_id} className="rounded-lg border border-line bg-panel p-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="grid h-4 w-4 place-items-center rounded bg-accent text-[9px] font-bold text-white">{i + 1}</span>
                <span className="font-semibold">{c.ontology.label}</span>
                <span className="ml-auto text-muted">conf {c.human_annotation.confidence}% · {c.human_annotation.status}</span>
              </div>
              <p className="mt-1.5 italic text-muted">“{c.evidence.quote}”</p>
              <p className="mt-1.5 font-mono text-[10px] leading-5 text-faint" style={{ color: "#98909f" }}>
                {c.source.title ?? c.source.id} · {c.source.license_status ?? "?"} · v{c.source.version ?? "?"} · sha256:{(c.source.content_hash ?? "none").slice(0, 12)} · ¶{c.evidence.paragraph_order ?? "?"} [{c.evidence.character_start}–{c.evidence.character_end}]
                {c.decisions.length ? ` · ${c.decisions.map((d) => d.decision).join("/")}` : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cleanTitle(title: string): string {
  return title.replace(/ — synthetic testimony$/, "");
}
