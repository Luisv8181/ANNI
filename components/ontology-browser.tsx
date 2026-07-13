"use client";

import { Loader2, Search } from "lucide-react";
import { useOntologyNodes } from "@/lib/hooks";
import { PanelTitle } from "./ui";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

export function OntologyBrowser({ selectedId, onSelect }: Props) {
  const { data: nodes = [], isLoading } = useOntologyNodes();
  const selected = nodes.find((n) => n.id === selectedId);

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <PanelTitle icon={<Search size={18} />} title="Ontology browser" />
      {isLoading ? (
        <div className="mt-6 flex justify-center">
          <Loader2 className="animate-spin text-muted" />
        </div>
      ) : (
        <div className="mt-4 max-h-[570px] space-y-2 overflow-auto pr-1 scrollbar-thin">
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => onSelect(node.id)}
              className={`w-full rounded-lg border p-3 text-left transition ${
                selectedId === node.id
                  ? "border-accent bg-lilac"
                  : "border-line bg-white hover:bg-panel"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                {node.group}
              </span>
              <span className="mt-1 block font-semibold">{node.label}</span>
              <span className="mt-1 block text-sm leading-5 text-muted">{node.description}</span>
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="mt-4 rounded-lg bg-ink p-4 text-white">
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">Selected node</p>
          <p className="mt-2 font-semibold">{selected.label}</p>
        </div>
      )}
    </section>
  );
}
