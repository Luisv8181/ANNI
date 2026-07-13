"use client";

import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Check,
  CircleDot,
  Database,
  FileText,
  GitBranch,
  Loader2,
  Lock,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { testimonyParagraphs } from "@/lib/data";
import { useAnniStore } from "@/lib/store";
import {
  useAnnotations,
  useDecideSuggestion,
  useOntologyNodes,
  useSubmitAnnotation,
  useSubmitReadConfirmation,
  useSuggestions
} from "@/lib/hooks";
import { useCurrentUser } from "@/lib/identity";
import type { Annotation } from "@/lib/api";

const DEMO_PROJECT_ID = "proj-anni-demo";
const DEMO_SOURCE_ID = "T-DEMO-001";

const steps = [
  "Import",
  "Read",
  "Annotate",
  "ANNI review",
  "Human decision",
  "Knowledge",
  "Synthetic trait"
];

export default function Home() {
  const reviewerId = useCurrentUser();
  const {
    hasRead,
    setHasRead,
    selectedOntologyId,
    setSelectedOntologyId,
    readConfirmationId,
    setReadConfirmationId
  } = useAnniStore();

  const [span, setSpan] = useState("I waited until the pain was bad");
  const [note, setNote] = useState("Delayed disclosure should influence simulation behavior.");
  const [confidence, setConfidence] = useState(78);
  const [relationship, setRelationship] = useState<"supports" | "contradicts" | "qualifies" | "contextualizes">("supports");
  const [paragraphId, setParagraphId] = useState("p1");
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string | null>(null);

  const { data: ontologyNodes = [], isLoading: ontologyLoading } = useOntologyNodes();
  const { data: annotations = [] } = useAnnotations(DEMO_PROJECT_ID);
  const { data: suggestions = [] } = useSuggestions(focusedAnnotationId);

  const submitReadConfirmation = useSubmitReadConfirmation();
  const submitAnnotation = useSubmitAnnotation();
  const decideSuggestion = useDecideSuggestion();

  const selectedOntology = ontologyNodes.find((n) => n.id === selectedOntologyId) ?? ontologyNodes[0];

  async function handleReadToggle(checked: boolean) {
    setHasRead(checked);
    if (checked && !readConfirmationId && reviewerId) {
      try {
        const result = await submitReadConfirmation.mutateAsync(DEMO_SOURCE_ID);
        setReadConfirmationId(result.id);
      } catch {
        setHasRead(false);
      }
    }
  }

  async function submitAnnotationForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!span.trim() || !note.trim() || !readConfirmationId || !reviewerId) return;
    const paragraph = testimonyParagraphs.find((p) => p.id === paragraphId);
    const charStart = paragraph ? paragraph.text.indexOf(span) : 0;
    const charEnd = charStart >= 0 ? charStart + span.length : span.length;
    try {
      const annotation = await submitAnnotation.mutateAsync({
        project_id: DEMO_PROJECT_ID,
        ontology_node_id: selectedOntologyId,
        relationship,
        confidence,
        note,
        evidence: {
          source_id: DEMO_SOURCE_ID,
          paragraph_id: paragraphId,
          character_start: Math.max(0, charStart),
          character_end: Math.max(0, charEnd),
          quote: span
        },
        reviewer_id: reviewerId,
        read_confirmation_id: readConfirmationId
      });
      setFocusedAnnotationId(annotation.id);
      setSpan("");
      setNote("");
    } catch (err) {
      console.error("Annotation failed:", err);
    }
  }

  const pendingCount = annotations.filter((a: Annotation) => a.status === "submitted").length;
  const approvedCount = annotations.filter((a: Annotation) => a.status === "approved").length;
  const pendingSuggestions = suggestions.filter((s) => s.decision === "pending").length;

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-soft">
            <Network size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">ANNI</p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">Artificial Neural Annotation Intelligence</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-2 text-sm text-muted shadow-sm md:flex">
          <Lock size={15} />
          Local-first review pipeline
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-8 pt-4 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex min-h-[460px] flex-col justify-between rounded-lg border border-line bg-white/86 p-7 shadow-soft"
        >
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-lilac px-3 py-2 text-sm font-medium text-accent">
              <ShieldCheck size={16} />
              Human judgment first
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-ink md:text-6xl">
              Evidence-backed annotation for synthetic patient research.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              ANNI preserves the chain from testimony to human annotation, local AI review, final decision, and traceable
              synthetic patient traits.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <Metric label="Human annotations" value={annotations.length.toString()} icon={<Users size={18} />} />
            <Metric label="Pending review" value={pendingCount.toString()} icon={<CircleDot size={18} />} />
            <Metric label="Approved" value={approvedCount.toString()} icon={<Check size={18} />} />
          </div>
        </motion.div>

        <section className="rounded-lg border border-line bg-ink p-6 text-white shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">Provenance chain</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Nothing bypasses review.</h2>
            </div>
            <GitBranch className="text-white/70" />
          </div>
          <div className="mt-7 space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-lg bg-white/[0.06] p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white text-sm font-semibold text-ink">
                  {index + 1}
                </span>
                <span className="text-sm font-medium">{step}</span>
                {index < steps.length - 1 && <ArrowRight className="ml-auto text-white/35" size={16} />}
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <StageCard icon={<FileText />} title="Source Import" text="Allow-list, license, robots, metadata, and testimony segmentation." />
          <StageCard icon={<BookOpenCheck />} title="Reading Gate" text="Annotation stays locked until the reviewer confirms personal reading." />
          <StageCard icon={<Bot />} title="Local AI Review" text="Ollama runs after human submission and writes a structured second opinion." />
          <StageCard icon={<Database />} title="Citation Engine" text="Evidence spans, reviewer decisions, versions, and audit events stay attached." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Annotation workspace</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Read first. Annotate second.</h2>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-sm">
            <input
              type="checkbox"
              checked={hasRead}
              onChange={(event) => handleReadToggle(event.target.checked)}
              className="h-4 w-4 accent-accent"
              disabled={submitReadConfirmation.isPending}
            />
            {submitReadConfirmation.isPending ? (
              <span className="flex items-center gap-2 text-muted"><Loader2 size={14} className="animate-spin" /> Confirming...</span>
            ) : (
              "I confirm I personally read this testimony."
            )}
          </label>
        </div>

        <div className="grid min-h-[680px] gap-4 lg:grid-cols-[1.05fr_0.95fr_0.8fr]">
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <PanelTitle icon={<FileText size={18} />} title="Original testimony" />
            <div className="mt-4 space-y-4">
              {testimonyParagraphs.map((paragraph) => (
                <button
                  key={paragraph.id}
                  onClick={() => setParagraphId(paragraph.id)}
                  className={`w-full rounded-lg border p-4 text-left leading-7 transition ${
                    paragraphId === paragraph.id ? "border-accent bg-lilac" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Paragraph {paragraph.order}
                  </span>
                  {paragraph.text}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <PanelTitle icon={<Sparkles size={18} />} title="Human annotation" />
            {!hasRead && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber p-4 text-sm leading-6 text-[#75521d]">
                Confirm personal reading before adding annotations. ANNI stores this as part of the audit trail.
              </div>
            )}
            <form onSubmit={submitAnnotationForm} className={`mt-4 space-y-4 ${!hasRead ? "pointer-events-none opacity-45" : ""}`}>
              <label className="block">
                <span className="text-sm font-medium text-muted">Evidence quote or span</span>
                <textarea
                  value={span}
                  onChange={(event) => setSpan(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-line bg-panel p-3 outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-muted">Reviewer note</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-lg border border-line bg-panel p-3 outline-none focus:border-accent"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-muted">Relationship</span>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as typeof relationship)}
                    className="mt-2 w-full rounded-lg border border-line bg-panel p-3 outline-none focus:border-accent"
                  >
                    <option value="supports">supports</option>
                    <option value="contradicts">contradicts</option>
                    <option value="qualifies">qualifies</option>
                    <option value="contextualizes">contextualizes</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-muted">Confidence: {confidence}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(Number(e.target.value))}
                    className="mt-5 w-full accent-accent"
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={submitAnnotation.isPending || !readConfirmationId}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 font-medium text-white transition hover:bg-accent disabled:opacity-50"
              >
                {submitAnnotation.isPending ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                ) : (
                  <>Submit for ANNI review <ArrowRight size={18} /></>
                )}
              </button>
              {submitAnnotation.isError && (
                <p className="text-sm text-red-600">Submission failed. Is the backend running?</p>
              )}
            </form>

            <div className="mt-5 space-y-3">
              {annotations.slice(0, 3).map((annotation: Annotation) => (
                <button
                  key={annotation.id}
                  onClick={() => setFocusedAnnotationId(annotation.id)}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    focusedAnnotationId === annotation.id ? "border-accent bg-lilac" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  <p className="text-sm font-semibold">"{annotation.evidence_quote}"</p>
                  <p className="mt-1 text-xs text-muted">{annotation.ontology_label} · {annotation.status}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <PanelTitle icon={<Search size={18} />} title="Ontology browser" />
            {ontologyLoading ? (
              <div className="mt-6 flex justify-center"><Loader2 className="animate-spin text-muted" /></div>
            ) : (
              <div className="mt-4 max-h-[570px] space-y-2 overflow-auto pr-1 scrollbar-thin">
                {ontologyNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedOntologyId(node.id)}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedOntologyId === node.id ? "border-accent bg-lilac" : "border-line bg-white hover:bg-panel"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{node.group}</span>
                    <span className="mt-1 block font-semibold">{node.label}</span>
                    <span className="mt-1 block text-sm leading-5 text-muted">{node.description}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedOntology && (
              <div className="mt-4 rounded-lg bg-ink p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Selected node</p>
                <p className="mt-2 font-semibold">{selectedOntology.label}</p>
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <PanelTitle icon={<Bot size={18} />} title="Comparison dashboard" />
            <div className="rounded-full bg-mint px-3 py-2 text-sm font-medium text-[#206640]">
              {focusedAnnotationId
                ? pendingSuggestions === 0 && suggestions.length === 0
                  ? "Waiting for Ollama review..."
                  : `${pendingSuggestions} suggestion${pendingSuggestions !== 1 ? "s" : ""} pending`
                : "Select an annotation to view suggestions"}
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {suggestions.length === 0 && focusedAnnotationId && (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-panel p-4 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" />
                Ollama is reviewing this annotation...
              </div>
            )}
            {suggestions.map((suggestion) => {
              const ontology = ontologyNodes.find((n) => n.id === suggestion.ontology_node_id);
              const annotation = annotations.find((a: Annotation) => a.id === suggestion.annotation_id);
              return (
                <div key={suggestion.id} className="grid gap-3 rounded-lg border border-line bg-panel p-4 lg:grid-cols-[0.9fr_1.15fr_0.95fr]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Human</p>
                    <p className="mt-2 font-semibold">{annotation?.ontology_label ?? ontology?.label}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">Human annotation remains the baseline. AI cannot overwrite it.</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{suggestion.agent_name}</p>
                    <p className="mt-2 font-semibold">{suggestion.suggestion}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{suggestion.rationale}</p>
                    <p className="mt-2 text-sm">
                      Evidence: <span className="font-medium">"{suggestion.evidence_quote}"</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Final decision</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["accepted", "rejected", "modified", "merged"] as const).map((decision) => (
                        <button
                          key={decision}
                          onClick={() =>
                            decideSuggestion.mutate({
                              annotationId: suggestion.annotation_id,
                              suggestionId: suggestion.id,
                              decision,
                            })
                          }
                          className={`rounded-md border px-3 py-2 text-sm font-medium capitalize transition ${
                            suggestion.decision === decision
                              ? "border-accent bg-accent text-white"
                              : "border-line bg-white hover:border-accent"
                          }`}
                        >
                          {decision}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                      <Check size={16} />
                      Confidence {suggestion.confidence}% · {suggestion.decision}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-6 pb-12 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <PanelTitle icon={<GitBranch size={18} />} title="Citation engine" />
          <div className="mt-4 space-y-3">
            {annotations.slice(0, 4).map((annotation: Annotation) => {
              const paragraph = testimonyParagraphs.find((item) => item.id === annotation.paragraph_id);
              return (
                <div key={annotation.id} className="rounded-lg border border-line bg-panel p-4">
                  <p className="text-sm font-semibold">{annotation.ontology_label}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">"{annotation.evidence_quote}"</p>
                  <div className="mt-3 grid gap-2 text-xs text-muted md:grid-cols-3">
                    <span>Source: T-DEMO-001</span>
                    <span>Paragraph: {paragraph?.order}</span>
                    <span>Ontology version: v0.1</span>
                    <span>Reviewer: {annotation.reviewer_id.slice(0, 8)}…</span>
                    <span>Confidence: {annotation.confidence}%</span>
                    <span>Status: {annotation.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <PanelTitle icon={<Database size={18} />} title="Research dashboard" />
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ResearchMetric
              label="Total annotations"
              value={annotations.length.toString()}
            />
            <ResearchMetric
              label="Approved"
              value={approvedCount.toString()}
            />
            <ResearchMetric
              label="Ontology nodes used"
              value={new Set(annotations.map((a: Annotation) => a.ontology_node_id)).size.toString()}
            />
            <ResearchMetric
              label="Pending review"
              value={pendingCount.toString()}
            />
          </div>
          {approvedCount > 0 && (
            <div className="mt-5 rounded-lg border border-line bg-panel p-4">
              <p className="font-semibold">Approved annotation traits</p>
              <ul className="mt-2 space-y-1">
                {annotations
                  .filter((a: Annotation) => a.status === "approved")
                  .slice(0, 3)
                  .map((a: Annotation) => (
                    <li key={a.id} className="text-sm leading-6 text-muted">
                      · {a.ontology_label}: {a.note}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <div className="flex items-center justify-between text-muted">
        {icon}
        <span className="text-2xl font-semibold text-ink">{value}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

function StageCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-lilac text-accent">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-lilac text-accent">{icon}</div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
    </div>
  );
}

function ResearchMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
