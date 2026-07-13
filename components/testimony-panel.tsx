"use client";

import { FileText } from "lucide-react";
import { testimonyParagraphs } from "@/lib/data";
import { PanelTitle } from "./ui";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function TestimonyPanel({ selectedId, onSelect }: Props) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <PanelTitle icon={<FileText size={18} />} title="Original testimony" />
      <div className="mt-4 space-y-4">
        {testimonyParagraphs.map((paragraph) => (
          <button
            key={paragraph.id}
            onClick={() => onSelect(paragraph.id)}
            className={`w-full rounded-lg border p-4 text-left leading-7 transition ${
              selectedId === paragraph.id
                ? "border-accent bg-lilac"
                : "border-line bg-panel hover:border-accent/50"
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
  );
}
