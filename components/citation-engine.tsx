"use client";

import { Database, GitBranch } from "lucide-react";
import { testimonyParagraphs } from "@/lib/data";
import { useAnnotations } from "@/lib/hooks";
import type { Annotation } from "@/lib/api";
import { PanelTitle } from "./ui";

const DEMO_PROJECT_ID = "proj-anni-demo";

export function CitationEngine() {
  const { data: annotations = [] } = useAnnotations(DEMO_PROJECT_ID);

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <PanelTitle icon={<GitBranch size={18} />} title="Citation engine" />
      <div className="mt-4 space-y-3">
        {annotations.slice(0, 4).map((annotation: Annotation) => {
          const paragraph = testimonyParagraphs.find((p) => p.id === annotation.paragraph_id);
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
        {annotations.length === 0 && (
          <p className="text-sm text-muted">No annotations yet. Submit one above to see the citation record.</p>
        )}
      </div>
    </section>
  );
}

export function ResearchDashboard() {
  const { data: annotations = [] } = useAnnotations(DEMO_PROJECT_ID);
  const approved = annotations.filter((a: Annotation) => a.status === "approved");
  const ontologyCount = new Set(annotations.map((a: Annotation) => a.ontology_node_id)).size;

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <PanelTitle icon={<Database size={18} />} title="Research dashboard" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Metric label="Total annotations" value={annotations.length.toString()} />
        <Metric label="Approved" value={approved.length.toString()} />
        <Metric label="Ontology nodes used" value={ontologyCount.toString()} />
        <Metric label="Pending review" value={(annotations.length - approved.length).toString()} />
      </div>
      {approved.length > 0 && (
        <div className="mt-5 rounded-lg border border-line bg-panel p-4">
          <p className="font-semibold">Approved annotation traits</p>
          <ul className="mt-2 space-y-1">
            {approved.slice(0, 3).map((a: Annotation) => (
              <li key={a.id} className="text-sm leading-6 text-muted">
                · {a.ontology_label}: {a.note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
