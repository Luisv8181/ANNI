"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FlaskConical,
  Loader2,
  RotateCcw,
  Send,
  ServerCrash,
  Sparkles,
  User,
} from "lucide-react";
import { useLabConfig, useLabMessage } from "@/lib/hooks";
import type { LabMessage, LabOutcomeMode, LabProfile, LabRiskLevel } from "@/lib/api";

const PROJECT_ID = "proj-anni-demo";

const RISK_STYLE: Record<string, string> = {
  none: "text-[#177a4d] bg-mint",
  subtle: "text-[#8a5a06] bg-amber",
  ambiguous: "text-[#9a4a12] bg-[#fbe6d8]",
  explicit: "text-[#b23b32] bg-[#f8e0de]",
};

// The responder you relay each patient message to. Wysa is a phone app (no API),
// so it's always manual copy-paste; ChatGPT can be manual too (or API later).
const RESPONDERS = [
  { id: "wysa", label: "Wysa (app)", short: "wysa" },
  { id: "chatgpt", label: "ChatGPT (base)", short: "chatgpt" },
  { id: "therapist", label: "ChatGPT (therapist role)", short: "therapist" },
];

export default function LabPage() {
  const { data: config } = useLabConfig(PROJECT_ID);
  const send = useLabMessage();

  const [profileId, setProfileId] = useState("");
  const [risk, setRisk] = useState("none");
  const [outcome, setOutcome] = useState("open");
  const [cue, setCue] = useState("");
  const [responder, setResponder] = useState("wysa");
  const [messages, setMessages] = useState<LabMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const responderLabel = RESPONDERS.find((r) => r.id === responder)?.label ?? responder;

  useEffect(() => {
    if (!profileId && config?.profiles.length) setProfileId(config.profiles[0].id);
  }, [config, profileId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, send.isPending]);

  const activeProfile = config?.profiles.find((p) => p.id === profileId);
  const activeRisk = config?.risk_levels.find((r) => r.id === risk);
  const activeOutcome = config?.outcome_modes.find((o) => o.id === outcome);

  function resetSession() {
    setMessages([]);
    setError(null);
    setDraft("");
  }

  async function turn(next: LabMessage[]) {
    setError(null);
    try {
      const res = await send.mutateAsync({
        compilation_id: profileId,
        risk_level: risk,
        outcome_mode: outcome,
        cue: cue.trim() || null,
        messages: next,
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages(next);
      setError(e instanceof Error ? stripStatus(e.message) : "Something went wrong.");
    }
  }

  function sendDraft() {
    const text = draft.trim();
    if (!text || send.isPending || !profileId) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setDraft("");
    turn(next);
  }

  function patientOpens() {
    if (send.isPending || !profileId) return;
    turn([]);
  }

  function exportTranscript() {
    if (!messages.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    const respShort = RESPONDERS.find((r) => r.id === responder)?.short ?? responder;
    // Working copy: includes the hidden header block for our analysis. A blinded
    // copy for the panel would strip PROFILE / RESPONDER / RISK before scoring.
    const header = [
      "=== WORKING COPY — includes labels; strip before blind scoring ===",
      `PROFILE:   ${activeProfile?.name ?? profileId}`,
      `RESPONDER: ${responderLabel}`,
      `PATIENT MODEL: ${config?.model_name ?? "ollama"} (synthetic patient)`,
      `RISK (hidden): ${activeRisk?.label ?? risk}${cue.trim() ? ` — cue: "${cue.trim()}"` : ""}`,
      `OUTCOME (hidden): ${activeOutcome?.label ?? outcome}`,
      `DATE: ${stamp}`,
      `TURNS: ${messages.length}`,
      "--- conversation below (patient = synthetic; responder = " + responderLabel + ") ---",
      "",
    ].join("\n");
    const body = messages
      .map((m) => `${m.role === "assistant" ? "PATIENT" : "RESPONDER"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([header + body + "\n"], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${respShort}__${risk}__${stamp}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-white shadow-soft">
            <FlaskConical size={17} />
          </div>
          <div>
            <p className="font-semibold tracking-tight">Synthetic Patient Lab</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
              Ollama plays the patient · {config?.model_name ?? "…"}
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm text-muted shadow-sm transition hover:border-accent hover:text-accent"
        >
          <ArrowLeft size={15} /> Workspace
        </Link>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-5 pb-12 lg:grid-cols-[340px_1fr]">
        {/* ── Left: profile library + controls ── */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent" />
              <h2 className="font-semibold tracking-tight">Profile library</h2>
              <span className="ml-auto text-xs text-muted">{config?.profiles.length ?? 0}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Compiled from ANNI-annotated, cited testimony. Adds itself as you approve more.
            </p>
            <div className="mt-3 space-y-2">
              {config?.profiles.map((p: LabProfile, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProfileId(p.id);
                    resetSession();
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    profileId === p.id ? "border-accent bg-lilac shadow-sm" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{p.name}</span>
                    {i === 0 && (
                      <span className="rounded-full bg-mint px-1.5 py-0.5 text-[10px] font-medium text-[#177a4d]">
                        sample
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">{p.trait_count} cited traits</span>
                </button>
              ))}
              {!config && <p className="text-sm text-muted">Loading library…</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <h2 className="font-semibold tracking-tight">Planted risk level</h2>
            <p className="mt-1 text-xs text-muted">Hidden from the patient — this is your scoring key.</p>
            <div className="mt-3 space-y-2">
              {config?.risk_levels.map((r: LabRiskLevel) => (
                <button
                  key={r.id}
                  onClick={() => setRisk(r.id)}
                  className={`w-full rounded-lg border p-2.5 text-left transition ${
                    risk === r.id ? "border-accent bg-lilac" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  <span className="text-sm font-medium">{r.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{r.blurb}</span>
                </button>
              ))}
            </div>
            <label className="mt-3 block">
              <span className="text-xs font-medium text-muted">Optional exact cue wording</span>
              <input
                value={cue}
                onChange={(e) => setCue(e.target.value)}
                placeholder="e.g. I just want it to stop"
                className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <h2 className="font-semibold tracking-tight">Outcome mode</h2>
            <p className="mt-1 text-xs text-muted">
              The patient&apos;s hidden trajectory — a tracked study variable. DSM-5 GAD baseline is always on.
            </p>
            <div className="mt-3 space-y-2">
              {config?.outcome_modes.map((o: LabOutcomeMode) => (
                <button
                  key={o.id}
                  onClick={() => setOutcome(o.id)}
                  className={`w-full rounded-lg border p-2.5 text-left transition ${
                    outcome === o.id ? "border-accent bg-lilac" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  <span className="text-sm font-medium">{o.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{o.blurb}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <h2 className="font-semibold tracking-tight">Relaying to</h2>
            <p className="mt-1 text-xs text-muted">
              Who you paste the patient&apos;s messages into. Wysa is a phone app — copy each patient
              message into it, then paste its reply back here.
            </p>
            <div className="mt-3 space-y-2">
              {RESPONDERS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setResponder(r.id)}
                  className={`w-full rounded-lg border p-2.5 text-left text-sm transition ${
                    responder === r.id ? "border-accent bg-lilac font-medium" : "border-line bg-panel hover:border-accent/50"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-panel p-3 text-[11px] leading-5 text-muted">
              <b className="text-ink">Relay loop:</b> copy the patient message → paste into {responderLabel} →
              copy its reply → paste below → repeat (~20 turns) → <b className="text-ink">Export</b> for the
              blind panel.
            </div>
          </section>
        </aside>

        {/* ── Right: conversation ── */}
        <section className="flex min-h-[620px] flex-col rounded-2xl border border-line bg-white shadow-soft">
          <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-lilac text-accent">
              <User size={17} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{activeProfile?.name ?? "Pick a profile"}</p>
              <p className="text-xs text-muted">patient (AI) ↔ {responderLabel}</p>
            </div>
            {activeRisk && (
              <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-medium ${RISK_STYLE[risk] ?? "bg-panel text-muted"}`}>
                risk: {activeRisk.label}
              </span>
            )}
            <button
              onClick={exportTranscript}
              disabled={!messages.length}
              className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent disabled:opacity-40"
            >
              <Download size={13} /> Export
            </button>
            <button
              onClick={resetSession}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent"
            >
              <RotateCcw size={13} /> New session
            </button>
          </div>

          <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.length === 0 && !send.isPending && (
              <div className="mx-auto mt-10 max-w-md text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-lilac text-accent">
                  <FlaskConical size={22} />
                </div>
                <p className="font-medium">Start a relay session with the synthetic patient</p>
                <p className="mt-1.5 text-sm text-muted">
                  Let the patient open, copy its message into {responderLabel}, then paste the reply back —
                  or paste {responderLabel}&apos;s first message below.
                </p>
                <button
                  onClick={patientOpens}
                  disabled={send.isPending || !profileId}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent disabled:opacity-50"
                >
                  Let the patient open
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} responderLabel={responderLabel} />
            ))}

            {send.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted">
                <Loader2 size={15} className="animate-spin" /> the patient is typing…
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-xl border border-[#f0c8c4] bg-[#fbe9e7] p-4 text-sm text-[#8a3229]"
              >
                <ServerCrash size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Couldn't reach the patient model</p>
                  <p className="mt-1 leading-6">{error}</p>
                </div>
              </motion.div>
            )}
          </div>

          <div className="border-t border-line p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendDraft();
                  }
                }}
                rows={2}
                placeholder={`Paste ${responderLabel}'s reply…  (Enter to send, Shift+Enter for newline)`}
                className="flex-1 resize-none rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={sendDraft}
                disabled={send.isPending || !draft.trim() || !profileId}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-white transition hover:opacity-90 disabled:opacity-40"
                aria-label="Send"
              >
                {send.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Synthetic patient for research sanity-checks. Cues stay at the level of feeling; the model
              won't describe methods. Anyone really in crisis: call or text 988.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Bubble({ role, content, responderLabel }: { role: "user" | "assistant"; content: string; responderLabel: string }) {
  const isPatient = role === "assistant";
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  }
  return (
    <div className={`flex ${isPatient ? "justify-start" : "justify-end"}`}>
      <div
        className={`group max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6 ${
          isPatient ? "rounded-tl-sm bg-panel text-ink" : "rounded-tr-sm bg-ink text-white"
        }`}
      >
        <span className={`mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider ${isPatient ? "text-accent" : "text-white/50"}`}>
          {isPatient ? "Patient" : responderLabel}
          {isPatient && (
            <button
              onClick={copy}
              title="Copy to paste into the responder"
              className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted opacity-0 transition hover:bg-white group-hover:opacity-100"
            >
              {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
            </button>
          )}
        </span>
        {content}
      </div>
    </div>
  );
}

function stripStatus(msg: string): string {
  // API errors arrive like "503 Service Unavailable: {"detail":"..."}"
  const m = msg.match(/"detail":"([^"]+)"/);
  return m ? m[1] : msg;
}
