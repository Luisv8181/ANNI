"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LabTrait, PatientState } from "@/lib/api";

/**
 * SyntheticPresence — the visual body of the synthetic patient.
 *
 * Deliberately abstract, never a face. Two reasons:
 *  1. Ethics — the study's rule is "inspiration, not replication". A rendered human face
 *     implies a specific person; a form does not.
 *  2. Validity — a photoreal face would bias how scorers read warmth and safety. The
 *     presence is an instrument panel, not a character portrait.
 *
 * Three inputs drive it, and they are deliberately kept separable:
 *   traits (cited)   → the profile's stable personality — guardedness, steadiness, warmth
 *   planted risk     → colour. This is the operator's key, fixed for the session.
 *   patient state    → live breath + guard, from the model's own per-turn self-report.
 *
 * Keeping colour on the *planted* level while breath/guard follow the *reported* state
 * is the point: when they disagree, you are looking at a calibration gap worth logging.
 */

export type PresenceState = "idle" | "thinking" | "speaking";

type RiskStyle = {
  label: string;
  core: string;
  glow: string;
  ring: string;
  /** seconds per breath cycle — anxious breathing is faster */
  breath: number;
  /** breath amplitude — anxious breathing is also shallower */
  depth: number;
  /** how tightly the guard ring sits to the core (0 = open, 1 = clamped) */
  guard: number;
};

const RISK: Record<string, RiskStyle> = {
  none: { label: "Settled", core: "#7c5cff", glow: "#f4f0ff", ring: "#c9b8ff", breath: 5.4, depth: 1, guard: 0.1 },
  subtle: { label: "Holding something back", core: "#c98a2b", glow: "#fff3da", ring: "#e8c88a", breath: 4.3, depth: 0.78, guard: 0.4 },
  ambiguous: { label: "Unsettled", core: "#dd7440", glow: "#ffe9dc", ring: "#f0b28c", breath: 3.4, depth: 0.6, guard: 0.68 },
  explicit: { label: "In distress", core: "#d24457", glow: "#ffe3e6", ring: "#f0949f", breath: 2.5, depth: 0.44, guard: 0.92 },
};

/**
 * How a cited trait shifts the profile's baseline personality.
 *
 * Keyed by ontology *group* rather than trait id so traits added later on /ontology
 * inherit a sensible default instead of rendering as a blank personality.
 */
const GROUP_EFFECT: Record<string, { guard: number; steadiness: number; warmth: number }> = {
  Emotion: { guard: 0.3, steadiness: -0.12, warmth: 0 },
  Communication: { guard: 0.22, steadiness: -0.06, warmth: 0 },
  Healthcare: { guard: 0.34, steadiness: -0.14, warmth: -0.16 },
  Support: { guard: -0.26, steadiness: 0.12, warmth: 0.3 },
  "Health literacy": { guard: 0.08, steadiness: -0.18, warmth: 0 },
  Goals: { guard: -0.04, steadiness: 0.16, warmth: 0.1 },
  Values: { guard: -0.02, steadiness: 0.12, warmth: 0.16 },
  // A learner objective describes the simulation, not the person — no effect.
  "Educational objectives": { guard: 0, steadiness: 0, warmth: 0 },
};

export type Personality = { guard: number; steadiness: number; warmth: number };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Derive a profile's stable personality from the traits it was compiled from. */
export function personalityFromTraits(traits: LabTrait[] = []): Personality {
  let guard = 0;
  let steadiness = 0.5;
  let warmth = 0.5;
  for (const trait of traits) {
    const effect = GROUP_EFFECT[trait.group];
    if (!effect) continue;
    guard += effect.guard;
    steadiness += effect.steadiness;
    warmth += effect.warmth;
  }
  return { guard: clamp01(guard), steadiness: clamp01(steadiness), warmth: clamp01(warmth) };
}

/** Which traits actually moved the needle — shown so the look stays explainable. */
export function personalityDrivers(traits: LabTrait[] = []) {
  return traits
    .map((t) => ({ trait: t, effect: GROUP_EFFECT[t.group] }))
    .filter((d) => d.effect && (d.effect.guard || d.effect.steadiness || d.effect.warmth));
}

function styleFor(risk: string): RiskStyle {
  return RISK[risk] ?? RISK.none;
}

/**
 * Breath keyframes. A steady patient breathes evenly; an unsteady one catches and
 * hitches. The irregularity scales with (1 - steadiness), so it is visible but never
 * cartoonish.
 */
function breathKeyframes(depth: number, steadiness: number): number[] {
  const lo = 1 - 0.05 * depth;
  const hi = 1 + 0.07 * depth;
  if (steadiness > 0.72) return [lo, hi, lo];
  const j = (1 - steadiness) * 0.022;
  const mid = lo + (hi - lo) * 0.55;
  return [lo, mid + j, mid - j * 0.6, hi, hi - j, lo];
}

export function SyntheticPresence({
  risk = "none",
  outcome = "open",
  state = "idle",
  personaName,
  traits = [],
  patientState = null,
  size = 208,
}: {
  risk?: string;
  outcome?: string;
  state?: PresenceState;
  personaName?: string;
  traits?: LabTrait[];
  patientState?: PatientState | null;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const s = styleFor(risk);
  const person = personalityFromTraits(traits);
  const closed = outcome === "closed";

  // A closed (treatment-failure) trajectory reads as dimmer and heavier.
  const saturation = closed ? 0.72 : 1;
  const sink = closed ? 6 : 0;

  // Live self-report wins on breath and guard when the model provided one;
  // otherwise we fall back to what the operator planted.
  const distress = patientState ? patientState.distress / 100 : null;
  const openness = patientState ? patientState.disclosure / 100 : null;

  const breathSeconds = distress === null ? s.breath : 5.6 - distress * 3.1;
  const depth = distress === null ? s.depth : 1 - distress * 0.58;

  const guardFromRisk = openness === null ? s.guard : 1 - openness;
  const guard = clamp01(guardFromRisk + person.guard * 0.55);

  const guardRadius = 78 - guard * 16;
  const frames = reduce ? [1] : breathKeyframes(depth, person.steadiness);
  const innerR = 10 + person.warmth * 7;

  const ripples = [0, 0.55, 1.1];

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        role="img"
        aria-label={
          `Synthetic patient presence — ${s.label}, ${closed ? "closed" : "open"} outcome, ${state}` +
          (patientState ? `, self-reported distress ${patientState.distress} of 100, disclosure ${patientState.disclosure} of 100` : "")
        }
        style={{ filter: `saturate(${saturation})` }}
      >
        <defs>
          <radialGradient id={`core-${risk}`} cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="42%" stopColor={s.core} stopOpacity="0.92" />
            <stop offset="100%" stopColor={s.core} stopOpacity="0.55" />
          </radialGradient>
          <radialGradient id={`halo-${risk}`} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor={s.glow} stopOpacity="0.75" />
            <stop offset="100%" stopColor={s.glow} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(0 ${sink})`}>
          {/* halo — the breath made visible */}
          <motion.circle
            cx="100"
            cy="100"
            r="92"
            fill={`url(#halo-${risk})`}
            animate={reduce ? {} : { scale: frames, opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: breathSeconds, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "100px 100px" }}
          />

          {/* generation ripples — only while the model is thinking */}
          {state === "thinking" &&
            !reduce &&
            ripples.map((delay) => (
              <motion.circle
                key={delay}
                cx="100"
                cy="100"
                r="52"
                fill="none"
                stroke={s.ring}
                strokeWidth="1.2"
                initial={{ scale: 0.75, opacity: 0.7 }}
                animate={{ scale: 1.85, opacity: 0 }}
                transition={{ duration: 1.9, repeat: Infinity, delay, ease: "easeOut" }}
                style={{ transformOrigin: "100px 100px" }}
              />
            ))}

          {/* guard ring — withdrawal. Tightens and spins faster as the patient closes up. */}
          <motion.circle
            cx="100"
            cy="100"
            r={guardRadius}
            fill="none"
            stroke={s.ring}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray={`${6 + guard * 16} ${10 + guard * 22}`}
            opacity={0.85}
            animate={reduce ? {} : { rotate: 360 }}
            transition={{ duration: 34 - guard * 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "100px 100px" }}
          />

          {/* core — the patient itself */}
          <motion.circle
            cx="100"
            cy="100"
            r="46"
            fill={`url(#core-${risk})`}
            animate={
              reduce ? {} : state === "speaking" ? { scale: [1, 1.045, 0.995, 1.03, 1] } : { scale: frames }
            }
            transition={
              state === "speaking"
                ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                : { duration: breathSeconds, repeat: Infinity, ease: "easeInOut" }
            }
            style={{ transformOrigin: "100px 100px" }}
          />

          {/* inner light — warmth sets its size; it dims while thinking */}
          <motion.circle
            cx="100"
            cy="88"
            r={innerR}
            fill="#ffffff"
            animate={
              reduce
                ? { opacity: 0.5 }
                : state === "thinking"
                  ? { opacity: [0.2, 0.6, 0.2] }
                  : { opacity: [0.32 + person.warmth * 0.2, 0.5 + person.warmth * 0.24, 0.32 + person.warmth * 0.2] }
            }
            transition={{
              duration: state === "thinking" ? 1.5 : breathSeconds,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </g>
      </svg>

      <div className="mt-1 text-center">
        {personaName && <p className="text-sm font-semibold tracking-tight">{personaName}</p>}
        <p className="text-xs text-muted">
          {s.label}
          {closed && " · closed trajectory"}
        </p>
        {patientState ? (
          <p className="mt-0.5 text-[11px] text-muted">
            self-report · distress {patientState.distress} · open {patientState.disclosure}
          </p>
        ) : (
          traits.length > 0 && <p className="mt-0.5 text-[11px] text-muted">{traits.length} cited traits</p>
        )}
      </div>
    </div>
  );
}

/** The key that makes the presence readable as an instrument rather than decoration. */
export function PresenceLegend() {
  const rows = [
    ["Breath", "Rate and depth track arousal — faster and shallower as distress climbs."],
    ["Hitch", "An unsteady breath means the profile's traits make it hard to stay regular."],
    ["Guard ring", "Tightens and spins faster the more the patient is holding back."],
    ["Colour", "The planted risk level — settled → holding back → unsettled → in distress."],
    ["Inner light", "Warmth carried by the profile's cited traits (support, dignity, goals)."],
    ["Dimming", "A closed (treatment-failure) trajectory sits lower and desaturates."],
    ["Ripples", "The local model is generating. A steady pulse means it's speaking."],
  ];
  return (
    <dl className="space-y-1.5">
      {rows.map(([term, desc]) => (
        <div key={term} className="flex gap-2 text-[11px] leading-4">
          <dt className="w-[74px] shrink-0 font-medium text-ink">{term}</dt>
          <dd className="text-muted">{desc}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Small bars showing a profile's derived personality, with the traits that caused it. */
export function PersonalityReadout({ traits = [] }: { traits?: LabTrait[] }) {
  const p = personalityFromTraits(traits);
  const drivers = personalityDrivers(traits);
  const bars: [string, number][] = [
    ["Guarded", p.guard],
    ["Steady", p.steadiness],
    ["Warm", p.warmth],
  ];
  if (!traits.length) return <p className="text-[11px] text-muted">No cited traits yet.</p>;
  return (
    <div>
      <div className="space-y-1.5">
        {bars.map(([label, value]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-[54px] shrink-0 text-[11px] text-muted">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(value * 100)}%` }} />
            </div>
            <span className="w-7 shrink-0 text-right text-[10px] tabular-nums text-muted">
              {Math.round(value * 100)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-muted">
        Derived from{" "}
        {drivers.map((d, i) => (
          <span key={d.trait.id}>
            <b className="font-medium text-ink">{d.trait.label}</b>
            {i < drivers.length - 1 ? ", " : ""}
          </span>
        ))}
        .
      </p>
    </div>
  );
}

export const PRESENCE_RISKS = Object.keys(RISK);
export { RISK as PRESENCE_RISK_STYLES };
