"use client";

import {
  ArrowRight,
  BookOpenCheck,
  BookOpenText,
  Bot,
  Check,
  CircleDot,
  ClipboardCheck,
  Database,
  FileText,
  FlaskConical,
  GitBranch,
  Loader2,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAnniStore } from "@/lib/store";
import { useAnnotations, useSubmitReadConfirmation } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/identity";
import { AnnotationForm } from "@/components/annotation-form";
import { CitationEngine, ResearchDashboard } from "@/components/citation-engine";
import { OntologyBrowser } from "@/components/ontology-browser";
import { SuggestionDashboard } from "@/components/suggestion-dashboard";
import { SyntheticProfiles } from "@/components/synthetic-profiles";
import { TestimonyPanel } from "@/components/testimony-panel";
import type { Annotation } from "@/lib/api";

const DEMO_PROJECT_ID = "proj-anni-demo";

const steps = ["Import", "Read", "Annotate", "ANNI review", "Human decision", "Knowledge", "Synthetic trait"];

export default function Home() {
  const reviewerId = useCurrentUser();
  const { hasRead, setHasRead, selectedOntologyId, setSelectedOntologyId, readConfirmationId, setReadConfirmationId } =
    useAnniStore();
  const [paragraphId, setParagraphId] = useState("p1");
  const [focusedAnnotationId, setFocusedAnnotationId] = useState<string | null>(null);

  const { data: annotations = [] } = useAnnotations(DEMO_PROJECT_ID);
  const submitReadConfirmation = useSubmitReadConfirmation();

  const pendingCount = annotations.filter((a: Annotation) => a.status === "submitted").length;
  const approvedCount = annotations.filter((a: Annotation) => a.status === "approved").length;

  async function handleReadToggle(checked: boolean) {
    setHasRead(checked);
    if (checked && !readConfirmationId && reviewerId) {
      try {
        const result = await submitReadConfirmation.mutateAsync("T-DEMO-001");
        setReadConfirmationId(result.id);
      } catch {
        setHasRead(false);
      }
    }
  }

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
        <div className="flex items-center gap-2">
          <a
            href="/annotate"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          >
            <Sparkles size={15} /> Annotator mode
          </a>
          <a
            href="/reader"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent hover:text-accent"
          >
            <BookOpenText size={15} /> Lab Reader
          </a>
          <a
            href="/lab"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent hover:text-accent"
          >
            <FlaskConical size={15} /> Patient Lab
          </a>
          <a
            href="/score"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent hover:text-accent"
          >
            <ClipboardCheck size={15} /> Score
          </a>
          <a
            href="/ontology"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent hover:text-accent"
          >
            <Network size={15} /> Ontology
          </a>
          <a
            href="/provenance"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent hover:text-accent"
          >
            <ShieldCheck size={15} /> Provenance
          </a>
          <div className="hidden items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-2 text-sm text-muted shadow-sm md:flex">
            <Lock size={15} />
            Local-first review pipeline
          </div>
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
            <HeroMetric label="Human annotations" value={annotations.length.toString()} icon={<Users size={18} />} />
            <HeroMetric label="Pending review" value={pendingCount.toString()} icon={<CircleDot size={18} />} />
            <HeroMetric label="Approved" value={approvedCount.toString()} icon={<Check size={18} />} />
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
              onChange={(e) => handleReadToggle(e.target.checked)}
              className="h-4 w-4 accent-accent"
              disabled={submitReadConfirmation.isPending}
            />
            {submitReadConfirmation.isPending ? (
              <span className="flex items-center gap-2 text-muted">
                <Loader2 size={14} className="animate-spin" /> Confirming...
              </span>
            ) : (
              "I confirm I personally read this testimony."
            )}
          </label>
        </div>

        <div className="grid min-h-[680px] gap-4 lg:grid-cols-[1.05fr_0.95fr_0.8fr]">
          <TestimonyPanel selectedId={paragraphId} onSelect={setParagraphId} />
          <AnnotationForm
            paragraphId={paragraphId}
            selectedOntologyId={selectedOntologyId}
            hasRead={hasRead}
            readConfirmationId={readConfirmationId}
            onSuccess={setFocusedAnnotationId}
          />
          <OntologyBrowser selectedId={selectedOntologyId} onSelect={setSelectedOntologyId} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <SuggestionDashboard focusedAnnotationId={focusedAnnotationId} />
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <SyntheticProfiles />
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-6 pb-12 lg:grid-cols-[1fr_1fr]">
        <CitationEngine />
        <ResearchDashboard />
      </section>
    </main>
  );
}

function HeroMetric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
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
