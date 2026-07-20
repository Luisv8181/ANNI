"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Highlighter,
  Loader2,
  PartyPopper,
  Sparkles,
  Tag,
  Trophy,
} from "lucide-react";
import { useCurrentUser } from "@/lib/identity";
import {
  useAnnotations,
  useOntologyNodes,
  useParagraphs,
  useSources,
  useSubmitAnnotation,
  useSubmitReadConfirmation,
} from "@/lib/hooks";
import type { Annotation, OntologyNode, Paragraph, Source } from "@/lib/api";

const PROJECT_ID = "proj-anni-demo";

// Plain-language coaching for a first-time student annotator.
const FRIENDLY: Record<string, { emoji: string; look: string }> = {
  "emotion-hesitation": { emoji: "😟", look: "They hold back, downplay, or delay sharing how they really feel." },
  "communication-indirect": { emoji: "🌫️", look: "They hint, soften, or talk around the point instead of saying it plainly." },
  "healthcare-trust": { emoji: "🛡️", look: "They doubt or feel let down by doctors, hospitals, or the system." },
  "support-family": { emoji: "🤝", look: "A family member helps them cope, decide, or ask questions." },
  "literacy-medical": { emoji: "📖", look: "Medical words or instructions are confusing or hard to follow." },
  "goals-autonomy": { emoji: "🧭", look: "They want to stay in control of their own care and choices." },
  "values-dignity": { emoji: "💜", look: "They want to be treated with respect, privacy, and as a whole person." },
  "education-objective": { emoji: "🎯", look: "A lesson or skill a student could practice from this moment." },
};

const RELATIONSHIPS = [
  { value: "supports", label: "It's an example of the trait", hint: "The quote shows this trait happening." },
  { value: "contradicts", label: "It works against the trait", hint: "The quote pushes the other way." },
  { value: "qualifies", label: "It depends / it's mixed", hint: "True in some ways, not others." },
];

function confidenceLabel(value: number): { text: string; emoji: string } {
  if (value < 40) return { text: "Just a hunch", emoji: "🤔" };
  if (value < 65) return { text: "Fairly sure", emoji: "🙂" };
  if (value < 88) return { text: "Pretty confident", emoji: "😃" };
  return { text: "Very confident", emoji: "🌟" };
}

export default function AnnotatePage() {
  const reviewerId = useCurrentUser();
  const { data: sources = [] } = useSources(PROJECT_ID);
  const { data: ontology = [] } = useOntologyNodes();
  const { data: annotations = [] } = useAnnotations(PROJECT_ID);
  const submitReadConfirmation = useSubmitReadConfirmation();
  const submitAnnotation = useSubmitAnnotation(PROJECT_ID);

  const [sourceId, setSourceId] = useState("");
  useEffect(() => {
    if (!sourceId && sources.length) setSourceId(sources[0].id);
  }, [sources, sourceId]);

  const { data: paragraphs = [] } = useParagraphs(sourceId);

  const [confId, setConfId] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ paragraphId: string; quote: string; start: number; end: number } | null>(null);
  const [ontologyId, setOntologyId] = useState("");
  const [relationship, setRelationship] = useState("supports");
  const [confidence, setConfidence] = useState(75);
  const [note, setNote] = useState("");
  const [celebrate, setCelebrate] = useState(false);

  // Reset the working annotation when the student switches stories.
  function pickSource(id: string) {
    setSourceId(id);
    setConfId(null);
    setSelection(null);
    setOntologyId("");
    setNote("");
  }

  async function confirmRead() {
    if (confId || !reviewerId) return;
    try {
      const result = await submitReadConfirmation.mutateAsync(sourceId);
      setConfId(result.id);
    } catch {
      /* backend offline — surfaced below */
    }
  }

  function captureSelection(paragraph: Paragraph, container: HTMLElement) {
    const sel = window.getSelection();
    const text = sel?.toString().replace(/\s+/g, " ").trim() ?? "";
    if (text.length < 3) return;
    // only accept selections inside this paragraph
    if (!sel || !container.contains(sel.anchorNode)) return;
    const start = paragraph.text.indexOf(text);
    if (start < 0) return;
    setSelection({ paragraphId: paragraph.id, quote: text, start, end: start + text.length });
  }

  const readyToSave = !!(confId && selection && ontologyId && reviewerId);

  async function save() {
    if (!readyToSave || !selection) return;
    try {
      await submitAnnotation.mutateAsync({
        project_id: PROJECT_ID,
        ontology_node_id: ontologyId,
        relationship,
        confidence,
        note: note.trim() || "(no note added)",
        evidence: {
          source_id: sourceId,
          paragraph_id: selection.paragraphId,
          character_start: selection.start,
          character_end: selection.end,
          quote: selection.quote,
        },
        reviewer_id: reviewerId,
        read_confirmation_id: confId!,
      });
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2200);
      setSelection(null);
      setOntologyId("");
      setNote("");
      setConfidence(75);
    } catch {
      /* surfaced below */
    }
  }

  // ── progress ────────────────────────────────────────────────────────────────
  const myCount = annotations.length;
  const traitsUsed = new Set(annotations.map((a) => a.ontology_node_id)).size;
  const goal = 5;
  const pct = Math.min(100, Math.round((myCount / goal) * 100));

  const stepDone = { read: !!confId, highlight: !!selection, label: !!ontologyId };

  return (
    <main className="min-h-screen pb-20">
      <TopBar />

      {/* greeting + progress dashboard */}
      <section className="mx-auto max-w-5xl px-5 pt-6">
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
            <div className="inline-flex items-center gap-2 rounded-full bg-lilac px-3 py-1.5 text-sm font-medium text-accent">
              <Sparkles size={15} /> Annotator mode
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Find the human story in the words.
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
              Read a real-sounding patient story, highlight a phrase that stands out, and tag what it tells you.
              ANNI takes a second look at every tag you make — but you're the one who decides.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-ink p-6 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Your progress</p>
              <Trophy size={18} className="text-white/70" />
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-semibold tabular-nums">{myCount}</span>
              <span className="mb-1.5 text-sm text-white/60">/ {goal} tags today</span>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <div className="mt-4 flex gap-3 text-sm">
              <div className="flex-1 rounded-lg bg-white/[0.07] p-3">
                <p className="text-2xl font-semibold tabular-nums">{traitsUsed}</p>
                <p className="mt-1 text-xs text-white/55">traits explored</p>
              </div>
              <div className="flex-1 rounded-lg bg-white/[0.07] p-3">
                <p className="text-2xl font-semibold tabular-nums">{sources.length}</p>
                <p className="mt-1 text-xs text-white/55">stories available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* stepper */}
      <section className="mx-auto max-w-5xl px-5 pt-8">
        <Stepper done={stepDone} />
      </section>

      {/* Step 1 — choose a story */}
      <Panel n={1} icon={<BookOpen size={17} />} title="Choose a story to read" active>
        <div className="grid gap-3 sm:grid-cols-3">
          {sources.map((s: Source) => (
            <button
              key={s.id}
              onClick={() => pickSource(s.id)}
              className={`rounded-xl border p-4 text-left transition ${
                sourceId === s.id ? "border-accent bg-lilac shadow-sm" : "border-line bg-panel hover:border-accent/50"
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-faint" style={{ color: "#98909f" }}>
                {s.id}
              </p>
              <p className="mt-1.5 font-semibold leading-snug">{cleanTitle(s.title)}</p>
              {sourceId === s.id && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  <Check size={13} /> Reading this one
                </span>
              )}
            </button>
          ))}
        </div>
      </Panel>

      {/* Step 2 — read + confirm */}
      <Panel n={2} icon={<BookOpen size={17} />} title="Read it carefully" active={!!sourceId}>
        <div className="space-y-3">
          {paragraphs.map((p: Paragraph) => (
            <div key={p.id} className="rounded-xl border border-line bg-panel p-4">
              <p className="text-[15.5px] leading-8">{p.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={confirmRead}
            disabled={!!confId || submitReadConfirmation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 font-medium text-white transition hover:bg-accent disabled:cursor-default disabled:opacity-100"
          >
            {confId ? (
              <><CheckCircle2 size={18} /> Thanks for reading!</>
            ) : submitReadConfirmation.isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Saving…</>
            ) : (
              <>I've read this whole story</>
            )}
          </button>
          <p className="text-sm text-muted">
            {confId ? "Now you can highlight the part that stood out." : "This unlocks the highlighting step below."}
          </p>
        </div>
        {submitReadConfirmation.isError && (
          <p className="mt-3 text-sm text-red-600">Couldn't save — is the ANNI backend running on port 8000?</p>
        )}
      </Panel>

      {/* Step 3 — highlight */}
      <Panel n={3} icon={<Highlighter size={17} />} title="Highlight the evidence" active={!!confId} locked={!confId}>
        <p className="mb-3 text-sm text-muted">
          Use your mouse to <b>select the exact words</b> that show something about this person.
        </p>
        <div className="space-y-3">
          {paragraphs.map((p: Paragraph) => (
            <SelectableParagraph
              key={p.id}
              paragraph={p}
              selection={selection}
              onSelect={captureSelection}
              disabled={!confId}
            />
          ))}
        </div>
        <AnimatePresence>
          {selection && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-accent/40 bg-lilac p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-accent">You highlighted</p>
              <p className="mt-1.5 text-[15px] font-medium">“{selection.quote}”</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Panel>

      {/* Step 4 — pick a trait */}
      <Panel n={4} icon={<Tag size={17} />} title="What does it tell you?" active={!!selection} locked={!selection}>
        <div className="grid gap-3 sm:grid-cols-2">
          {ontology.map((node: OntologyNode) => {
            const meta = FRIENDLY[node.id] ?? { emoji: "🔎", look: node.description };
            const chosen = ontologyId === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setOntologyId(node.id)}
                disabled={!selection}
                className={`flex gap-3 rounded-xl border p-4 text-left transition disabled:opacity-50 ${
                  chosen ? "border-accent bg-lilac shadow-sm" : "border-line bg-panel hover:border-accent/50"
                }`}
              >
                <span className="text-2xl leading-none">{meta.emoji}</span>
                <span>
                  <span className="block font-semibold leading-snug">{node.label}</span>
                  <span className="mt-1 block text-[13px] leading-6 text-muted">{meta.look}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      {/* Step 5 — confidence, note, save */}
      <Panel n={5} icon={<Check size={17} />} title="How sure are you — and why?" active={!!ontologyId} locked={!ontologyId}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">How confident are you?</span>
              <span className="text-sm font-semibold">
                {confidenceLabel(confidence).emoji} {confidenceLabel(confidence).text}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              disabled={!ontologyId}
              className="mt-4 w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>Not sure</span>
              <span className="tabular-nums">{confidence}%</span>
              <span>Certain</span>
            </div>

            <p className="mt-6 text-sm font-medium text-muted">Does the quote show the trait, or go against it?</p>
            <div className="mt-2 space-y-2">
              {RELATIONSHIPS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRelationship(r.value)}
                  disabled={!ontologyId}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition disabled:opacity-50 ${
                    relationship === r.value ? "border-accent bg-lilac" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  <span className="font-medium">{r.label}</span>
                  <span className="ml-2 text-xs text-muted">{r.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-muted">Why did you pick this? (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              disabled={!ontologyId}
              placeholder="In your own words, what made you notice this?"
              className="mt-2 flex-1 rounded-xl border border-line bg-panel p-3 text-sm outline-none focus:border-accent disabled:opacity-50"
            />
            <button
              onClick={save}
              disabled={!readyToSave || submitAnnotation.isPending}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 font-medium text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {submitAnnotation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Saving your tag…</>
              ) : (
                <>Save my tag &amp; let ANNI review it</>
              )}
            </button>
            {submitAnnotation.isError && (
              <p className="mt-2 text-sm text-red-600">Couldn't save — is the backend running?</p>
            )}
          </div>
        </div>
      </Panel>

      {/* Your tags so far */}
      <section className="mx-auto max-w-5xl px-5 pt-6">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Tags you've made</h2>
        {annotations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line bg-panel p-6 text-center text-sm text-muted">
            None yet — finish the steps above to make your first one. 🎉
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {annotations.map((a: Annotation) => (
              <div key={a.id} className="rounded-xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-lilac px-2.5 py-1 text-xs font-medium text-accent">
                    {a.ontology_label ?? "Trait"}
                  </span>
                  <StatusPill status={a.status} />
                </div>
                <p className="mt-2.5 text-sm leading-6">“{a.evidence_quote}”</p>
                <p className="mt-2 text-xs text-muted">You were {a.confidence}% sure</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* celebration */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-8 z-50 mx-auto flex w-fit items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-white shadow-soft"
          >
            <PartyPopper size={20} className="text-accent" />
            <span className="font-medium">Nice! Your tag is saved — ANNI is taking a look.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// ── pieces ──────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white shadow-soft">
          <Sparkles size={17} />
        </div>
        <div>
          <p className="font-semibold tracking-tight">ANNI</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Annotator mode</p>
        </div>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-muted shadow-sm transition hover:border-accent hover:text-accent"
      >
        <ArrowLeft size={15} /> Expert workspace
      </Link>
    </header>
  );
}

function Stepper({ done }: { done: { read: boolean; highlight: boolean; label: boolean } }) {
  const steps = [
    { name: "Read", ok: done.read },
    { name: "Highlight", ok: done.highlight },
    { name: "Tag", ok: done.label },
    { name: "Save", ok: false },
  ];
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => (
        <div key={s.name} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
              s.ok ? "border-accent bg-accent text-white" : "border-line bg-white text-muted"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full text-xs ${
                s.ok ? "bg-white/25" : "bg-lilac text-accent"
              }`}
            >
              {s.ok ? <Check size={12} /> : i + 1}
            </span>
            {s.name}
          </div>
          {i < steps.length - 1 && <span className="text-line">—</span>}
        </div>
      ))}
    </div>
  );
}

function Panel({
  n,
  icon,
  title,
  children,
  active = false,
  locked = false,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  locked?: boolean;
}) {
  return (
    <section className="mx-auto max-w-5xl px-5 pt-5">
      <div className={`rounded-2xl border bg-white p-6 shadow-soft transition ${active ? "border-line" : "border-line opacity-60"}`}>
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-lilac text-accent">{icon}</span>
          <h2 className="text-lg font-semibold tracking-tight">
            <span className="mr-2 text-muted">Step {n}</span>
            {title}
          </h2>
          {locked && <span className="ml-auto text-xs text-muted">Finish the step above first</span>}
        </div>
        <div className={locked ? "pointer-events-none select-none opacity-45" : ""}>{children}</div>
      </div>
    </section>
  );
}

function SelectableParagraph({
  paragraph,
  selection,
  onSelect,
  disabled,
}: {
  paragraph: Paragraph;
  selection: { paragraphId: string; quote: string; start: number; end: number } | null;
  onSelect: (p: Paragraph, el: HTMLElement) => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const isThis = selection?.paragraphId === paragraph.id;

  // Render the chosen span highlighted, everything else plain.
  const content = useMemo(() => {
    if (!isThis || !selection) return paragraph.text;
    const { start, end } = selection;
    return (
      <>
        {paragraph.text.slice(0, start)}
        <mark className="rounded bg-accent/20 px-0.5 text-ink underline decoration-accent decoration-2">
          {paragraph.text.slice(start, end)}
        </mark>
        {paragraph.text.slice(end)}
      </>
    );
  }, [isThis, selection, paragraph.text]);

  return (
    <p
      ref={ref}
      onMouseUp={() => !disabled && ref.current && onSelect(paragraph, ref.current)}
      className={`cursor-text rounded-xl border p-4 text-[15.5px] leading-8 transition ${
        isThis ? "border-accent bg-lilac" : "border-line bg-panel"
      } ${disabled ? "" : "hover:border-accent/50"}`}
    >
      {content}
    </p>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: "Approved ✓", cls: "bg-mint text-[#177a4d]" },
    submitted: { label: "ANNI reviewing…", cls: "bg-amber text-[#8a5a06]" },
  };
  const s = map[status] ?? { label: status, cls: "bg-panel text-muted" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

function cleanTitle(title: string): string {
  return title.replace(/ — synthetic testimony$/, "");
}
