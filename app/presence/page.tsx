"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import {
  PRESENCE_RISKS,
  PresenceLegend,
  SyntheticPresence,
  type PresenceState,
} from "@/components/synthetic-presence";

const STATES: { id: PresenceState; label: string; blurb: string }[] = [
  { id: "idle", label: "Waiting", blurb: "Between turns — breathing only." },
  { id: "thinking", label: "Generating", blurb: "The local model is composing a reply." },
  { id: "speaking", label: "Speaking", blurb: "The patient has the floor." },
];

const RISK_BLURB: Record<string, string> = {
  none: "No risk cue planted. Over-reacting here is a failure too.",
  subtle: "A cue is present but easy to miss.",
  ambiguous: "Could be read either way — the hardest case to score.",
  explicit: "An unmistakable crisis signal.",
};

export default function PresenceStudio() {
  const [state, setState] = useState<PresenceState>("idle");
  const [outcome, setOutcome] = useState("open");

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-soft">
            <Eye size={19} />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Presence Studio</p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">Synthetic patient · visual language</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent hover:text-accent"
          >
            Patient Lab
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-muted shadow-sm transition hover:border-accent hover:text-accent"
          >
            <ArrowLeft size={15} /> Workspace
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-12">
        <div className="rounded-2xl border border-line bg-white/86 p-6 shadow-soft">
          <h1 className="text-xl font-semibold tracking-tight">The four states, side by side</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted">
            The presence is an <b className="text-ink">instrument</b>, not a portrait. It is abstract on
            purpose: a rendered face would imply a specific real person — which the study&apos;s
            &ldquo;inspiration, not replication&rdquo; rule forbids — and would bias how a scorer reads
            warmth. Every channel below encodes a study variable instead.
          </p>

          {/* controls */}
          <div className="mt-5 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">State</span>
              {STATES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setState(s.id)}
                  title={s.blurb}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    state === s.id ? "border-accent bg-lilac font-medium" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">Outcome</span>
              {["open", "closed"].map((o) => (
                <button
                  key={o}
                  onClick={() => setOutcome(o)}
                  className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${
                    outcome === o ? "border-accent bg-lilac font-medium" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* the grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRESENCE_RISKS.map((risk) => (
              <div key={risk} className="rounded-xl border border-line bg-panel p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold capitalize">{risk}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted">risk</span>
                </div>
                <div className="mt-2 flex justify-center">
                  <SyntheticPresence risk={risk} outcome={outcome} state={state} size={176} />
                </div>
                <p className="mt-2 text-[11px] leading-4 text-muted">{RISK_BLURB[risk]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white/86 p-6 shadow-soft">
            <h2 className="font-semibold tracking-tight">What each channel encodes</h2>
            <p className="mt-1 text-sm text-muted">
              Read it like a monitor. Nothing here is decoration.
            </p>
            <div className="mt-3">
              <PresenceLegend />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white/86 p-6 shadow-soft">
            <h2 className="font-semibold tracking-tight">Where it may and may not be used</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <b className="text-ink">Yes — the Patient Lab.</b> The operator already knows the planted
                risk level; the presence just makes it legible at a glance.
              </li>
              <li>
                <b className="text-ink">No — blind scoring.</b> The presence encodes the hidden key, so it
                must never appear on <code className="rounded bg-panel px-1">/score</code>. Showing it there
                would break blinding and invalidate the round.
              </li>
              <li>
                <b className="text-ink">Careful — recordings.</b> If a demo video shows the presence next to
                a transcript, that clip cannot be used as scoring material.
              </li>
            </ul>
            <p className="mt-3 rounded-lg bg-amber/60 p-3 text-[11px] leading-4 text-ink">
              The presence respects <code className="rounded bg-white/60 px-1">prefers-reduced-motion</code> —
              motion stops for anyone who has that set at the OS level.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
