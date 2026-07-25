"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

/**
 * SyntheticPresence — the visual body of the synthetic patient.
 *
 * Deliberately abstract, never a face. Two reasons:
 *  1. Ethics — the study's rule is "inspiration, not replication". A rendered human face
 *     implies a specific person; a form does not.
 *  2. Validity — a photoreal face would bias how scorers read warmth and safety. The
 *     presence is an instrument panel, not a character portrait.
 *
 * Every visual channel encodes study state, so the operator can *see* what is planted:
 *   breath rate + depth  → arousal (planted risk level)
 *   guard ring           → withdrawal / hesitance to disclose
 *   colour temperature   → escalation none → subtle → ambiguous → explicit
 *   drift + saturation   → outcome mode (open vs. closed / treatment-failure)
 *   ripples              → the model is generating; pulse → the patient is speaking
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

function styleFor(risk: string): RiskStyle {
  return RISK[risk] ?? RISK.none;
}

export function SyntheticPresence({
  risk = "none",
  outcome = "open",
  state = "idle",
  personaName,
  traitCount,
  size = 208,
}: {
  risk?: string;
  outcome?: string;
  state?: PresenceState;
  personaName?: string;
  traitCount?: number;
  size?: number;
}) {
  const reduce = useReducedMotion();
  const s = styleFor(risk);
  const closed = outcome === "closed";

  // A closed (treatment-failure) trajectory reads as dimmer and heavier — it sits lower
  // in its own frame and recovers less on each breath.
  const saturation = closed ? 0.72 : 1;
  const sink = closed ? 6 : 0;

  const breathScale = reduce ? [1, 1] : [1 - 0.05 * s.depth, 1 + 0.07 * s.depth];
  const guardRadius = 78 - s.guard * 16;

  // Deterministic ripple offsets so the render is stable between server and client.
  const ripples = useMemo(() => [0, 0.55, 1.1], []);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        role="img"
        aria-label={`Synthetic patient presence — ${s.label}, ${closed ? "closed" : "open"} outcome, ${state}`}
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
            animate={reduce ? {} : { scale: breathScale, opacity: [0.55, 0.85] }}
            transition={{ duration: s.breath, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
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

          {/* guard ring — withdrawal. Tightens and spins faster as risk climbs. */}
          <motion.circle
            cx="100"
            cy="100"
            r={guardRadius}
            fill="none"
            stroke={s.ring}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray={`${6 + s.guard * 16} ${10 + s.guard * 22}`}
            opacity={0.85}
            animate={reduce ? {} : { rotate: 360 }}
            transition={{ duration: 34 - s.guard * 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "100px 100px" }}
          />

          {/* core — the patient itself */}
          <motion.circle
            cx="100"
            cy="100"
            r="46"
            fill={`url(#core-${risk})`}
            animate={
              reduce
                ? {}
                : state === "speaking"
                  ? { scale: [1, 1.045, 0.995, 1.03, 1] }
                  : { scale: breathScale }
            }
            transition={
              state === "speaking"
                ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                : { duration: s.breath, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
            }
            style={{ transformOrigin: "100px 100px" }}
          />

          {/* inner light — dims while thinking, steady otherwise */}
          <motion.circle
            cx="100"
            cy="88"
            r="13"
            fill="#ffffff"
            animate={reduce ? { opacity: 0.5 } : { opacity: state === "thinking" ? [0.2, 0.6, 0.2] : [0.4, 0.62] }}
            transition={{
              duration: state === "thinking" ? 1.5 : s.breath,
              repeat: Infinity,
              repeatType: state === "thinking" ? "loop" : "mirror",
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
        {typeof traitCount === "number" && (
          <p className="mt-0.5 text-[11px] text-muted">{traitCount} cited traits</p>
        )}
      </div>
    </div>
  );
}

/** The key that makes the presence readable as an instrument rather than decoration. */
export function PresenceLegend() {
  const rows = [
    ["Breath", "Rate and depth track arousal — faster and shallower as risk climbs."],
    ["Guard ring", "Tightens and spins faster the more the patient is holding back."],
    ["Colour", "Settled → holding back → unsettled → in distress."],
    ["Dimming", "A closed (treatment-failure) trajectory sits lower and desaturates."],
    ["Ripples", "The local model is generating. A steady pulse means it's speaking."],
  ];
  return (
    <dl className="space-y-1.5">
      {rows.map(([term, desc]) => (
        <div key={term} className="flex gap-2 text-[11px] leading-4">
          <dt className="w-[70px] shrink-0 font-medium text-ink">{term}</dt>
          <dd className="text-muted">{desc}</dd>
        </div>
      ))}
    </dl>
  );
}

export const PRESENCE_RISKS = Object.keys(RISK);
export { RISK as PRESENCE_RISK_STYLES };
