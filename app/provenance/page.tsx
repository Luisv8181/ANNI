"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Link2, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useAuditLog, useAuditVerify } from "@/lib/hooks";
import type { AuditEvent } from "@/lib/api";

const ACTION_TONE: Record<string, string> = {
  create: "bg-mint text-emerald-700",
  ingest: "bg-lilac text-accent",
  decide: "bg-amber text-amber-700",
  compile: "bg-lilac text-accent",
  generate: "bg-lilac text-accent",
};

function toneFor(action: string): string {
  const key = Object.keys(ACTION_TONE).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_TONE[key] : "bg-panel text-muted";
}

export default function ProvenancePage() {
  const { data: events = [], isLoading } = useAuditLog();
  const { data: verify, isLoading: verifying } = useAuditVerify();

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white shadow-soft">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Provenance</p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">Tamper-evident audit chain</p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-accent hover:text-accent"
        >
          <ArrowLeft size={15} /> Home
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-5 pb-8">
        <VerifyBanner verify={verify} verifying={verifying} />

        <div className="mt-6 rounded-lg border border-line bg-white/86 shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Audit chain</h2>
              <p className="text-sm text-muted">
                Every write hashes into the one before it. Break a link and verification fails.
              </p>
            </div>
            <span className="rounded-full bg-panel px-3 py-1.5 text-sm font-medium text-muted">
              {events.length} events
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading chain…
            </div>
          ) : events.length === 0 ? (
            <p className="px-6 py-10 text-muted">No audit events yet. Ingest a source or save an annotation to start the chain.</p>
          ) : (
            <ol className="divide-y divide-line">
              {events.map((event, i) => (
                <EventRow key={event.id} event={event} isTip={i === 0} />
              ))}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}

function VerifyBanner({ verify, verifying }: { verify?: { valid: boolean; events: number; broken_at: string | null; tip: string | null }; verifying: boolean }) {
  if (verifying) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-6 py-5 text-muted shadow-soft">
        <Loader2 size={18} className="animate-spin" /> Verifying chain integrity…
      </div>
    );
  }
  if (!verify) return null;
  if (verify.valid) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-mint bg-mint/50 px-6 py-5 shadow-soft">
        <ShieldCheck className="text-emerald-600" size={28} />
        <div>
          <p className="text-lg font-semibold text-emerald-800">Chain verified · intact</p>
          <p className="text-sm text-emerald-700">
            {verify.events} events recomputed and matched. Tip hash{" "}
            <code className="rounded bg-white/70 px-1 py-0.5 text-xs">{verify.tip?.slice(0, 16)}…</code>
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-6 py-5 shadow-soft">
      <ShieldAlert className="text-red-600" size={28} />
      <div>
        <p className="text-lg font-semibold text-red-800">Chain broken</p>
        <p className="text-sm text-red-700">
          Verification failed at event <code className="rounded bg-white/70 px-1 py-0.5 text-xs">{verify.broken_at}</code>. The
          record was altered after it was written.
        </p>
      </div>
    </div>
  );
}

function EventRow({ event, isTip }: { event: AuditEvent; isTip: boolean }) {
  return (
    <li className="flex items-start gap-4 px-6 py-4">
      <div className="mt-0.5 flex flex-col items-center">
        <CheckCircle2 size={18} className="text-accent" />
        <span className="mt-1 h-full w-px bg-line" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${toneFor(event.action)}`}>{event.action}</span>
          <span className="text-sm font-medium text-ink">{event.entity_type}</span>
          <code className="truncate text-xs text-muted">{event.entity_id}</code>
          {isTip && <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">tip</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>actor: {event.actor_id}</span>
          <span>{new Date(event.created_at).toLocaleString()}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <Link2 size={12} className="shrink-0 text-muted" />
          <code className="truncate rounded bg-panel px-1.5 py-0.5 text-[11px] text-ink" title={event.event_hash}>
            {event.event_hash.slice(0, 24)}…
          </code>
          {event.previous_hash && (
            <>
              <span className="text-muted">←</span>
              <code className="truncate rounded bg-panel/60 px-1.5 py-0.5 text-[11px] text-muted" title={event.previous_hash}>
                {event.previous_hash.slice(0, 16)}…
              </code>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
