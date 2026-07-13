"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAnnotations, useSubmitAnnotation } from "@/lib/hooks";
import { useCurrentUser } from "@/lib/identity";
import { annotationFormSchema, type AnnotationFormValues } from "@/lib/schemas";
import { testimonyParagraphs } from "@/lib/data";
import type { Annotation } from "@/lib/api";
import { PanelTitle } from "./ui";

const DEMO_PROJECT_ID = "proj-anni-demo";
const DEMO_SOURCE_ID = "T-DEMO-001";

type Props = {
  paragraphId: string;
  selectedOntologyId: string;
  hasRead: boolean;
  readConfirmationId: string | null;
  onSuccess: (annotationId: string) => void;
};

export function AnnotationForm({
  paragraphId,
  selectedOntologyId,
  hasRead,
  readConfirmationId,
  onSuccess,
}: Props) {
  const reviewerId = useCurrentUser();
  const { data: annotations = [] } = useAnnotations(DEMO_PROJECT_ID);
  const submitAnnotation = useSubmitAnnotation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AnnotationFormValues>({
    resolver: zodResolver(annotationFormSchema),
    defaultValues: {
      span: "I waited until the pain was bad",
      note: "Delayed disclosure should influence simulation behavior.",
      confidence: 78,
      relationship: "supports",
    },
  });

  const confidence = watch("confidence");

  async function onSubmit(values: AnnotationFormValues) {
    if (!readConfirmationId || !reviewerId) return;
    const paragraph = testimonyParagraphs.find((p) => p.id === paragraphId);
    const charStart = paragraph ? paragraph.text.indexOf(values.span) : 0;
    const charEnd = charStart >= 0 ? charStart + values.span.length : values.span.length;
    const annotation = await submitAnnotation.mutateAsync({
      project_id: DEMO_PROJECT_ID,
      ontology_node_id: selectedOntologyId,
      relationship: values.relationship,
      confidence: values.confidence,
      note: values.note,
      evidence: {
        source_id: DEMO_SOURCE_ID,
        paragraph_id: paragraphId,
        character_start: Math.max(0, charStart),
        character_end: Math.max(0, charEnd),
        quote: values.span,
      },
      reviewer_id: reviewerId,
      read_confirmation_id: readConfirmationId,
    });
    onSuccess(annotation.id);
    reset({ span: "", note: "", confidence: 78, relationship: "supports" });
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <PanelTitle icon={<Sparkles size={18} />} title="Human annotation" />

      {!hasRead && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber p-4 text-sm leading-6 text-[#75521d]">
          Confirm personal reading before adding annotations. ANNI stores this as part of the audit trail.
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`mt-4 space-y-4 ${!hasRead ? "pointer-events-none opacity-45" : ""}`}
      >
        <label className="block">
          <span className="text-sm font-medium text-muted">Evidence quote or span</span>
          <textarea
            {...register("span")}
            rows={3}
            className="mt-2 w-full rounded-lg border border-line bg-panel p-3 outline-none focus:border-accent"
          />
          {errors.span && <p className="mt-1 text-xs text-red-500">{errors.span.message}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-muted">Reviewer note</span>
          <textarea
            {...register("note")}
            rows={4}
            className="mt-2 w-full rounded-lg border border-line bg-panel p-3 outline-none focus:border-accent"
          />
          {errors.note && <p className="mt-1 text-xs text-red-500">{errors.note.message}</p>}
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-muted">Relationship</span>
            <select
              {...register("relationship")}
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
              {...register("confidence", { valueAsNumber: true })}
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
          <div key={annotation.id} className="rounded-lg border border-line bg-panel p-3">
            <p className="text-sm font-semibold">"{annotation.evidence_quote}"</p>
            <p className="mt-1 text-xs text-muted">
              {annotation.ontology_label} · {annotation.status}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
