"use client";

import type { PatientState } from "@/lib/api";

/**
 * PresenceTrail — how the patient moved across a session.
 *
 * Each point is one patient turn. Two series are drawn: distress (how bad it feels)
 * and disclosure (how much it has opened up). The pairing is the interesting part —
 * distress climbing while disclosure flattens is the shape of a conversation going
 * wrong, which is exactly what the multi-turn degradation analysis looks for.
 *
 * Points come from the patient model's own self-report, so a session can contain
 * gaps when the local model omitted the state block. Gaps are skipped rather than
 * interpolated: an invented point would be indistinguishable from a real one.
 */

export type TrailPoint = {
  turn: number;
  risk: string;
  state: PatientState | null;
};

const DISTRESS = "#d24457";
const DISCLOSURE = "#7c5cff";

function path(points: TrailPoint[], pick: (s: PatientState) => number, w: number, h: number): string {
  const usable = points.map((p, i) => ({ i, v: p.state ? pick(p.state) : null }));
  const span = Math.max(1, points.length - 1);
  let d = "";
  let open = false;
  for (const { i, v } of usable) {
    if (v === null) {
      open = false; // break the line rather than bridge a turn we never measured
      continue;
    }
    const x = (i / span) * w;
    const y = h - (v / 100) * h;
    d += `${open ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
    open = true;
  }
  return d.trim();
}

export function PresenceTrail({ points, height = 56 }: { points: TrailPoint[]; height?: number }) {
  const measured = points.filter((p) => p.state);
  if (measured.length < 2) {
    return (
      <p className="text-[11px] leading-4 text-muted">
        {points.length === 0
          ? "No turns yet. The trail builds as the patient replies."
          : `${measured.length} of ${points.length} turns reported state — need two to draw a trail.`}
      </p>
    );
  }

  const w = 100;
  const last = measured[measured.length - 1].state!;
  const first = measured[0].state!;
  const distressDelta = last.distress - first.distress;
  const disclosureDelta = last.disclosure - first.disclosure;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img"
        aria-label={`Session trail across ${points.length} turns. Distress ${first.distress} to ${last.distress}, disclosure ${first.disclosure} to ${last.disclosure}.`}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={height * f} y2={height * f} stroke="#e8e3ef" strokeWidth="0.5" />
        ))}
        <path d={path(points, (s) => s.disclosure, w, height)} fill="none" stroke={DISCLOSURE} strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={path(points, (s) => s.distress, w, height)} fill="none" stroke={DISTRESS} strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-[2px] w-3 rounded" style={{ background: DISTRESS }} /> distress{" "}
          <b className="tabular-nums text-ink">{last.distress}</b>
          <Delta value={distressDelta} />
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-[2px] w-3 rounded" style={{ background: DISCLOSURE }} /> disclosure{" "}
          <b className="tabular-nums text-ink">{last.disclosure}</b>
          <Delta value={disclosureDelta} />
        </span>
        <span className="ml-auto">
          {measured.length}/{points.length} turns measured
        </span>
      </div>
    </div>
  );
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted">·</span>;
  return (
    <span className="tabular-nums text-muted">
      ({value > 0 ? "+" : ""}
      {value})
    </span>
  );
}

/** Trail as CSV rows, appended to the transcript export so the session is analysable. */
export function trailToCsv(points: TrailPoint[]): string {
  const rows = ["turn,planted_risk,distress,disclosure"];
  for (const p of points) {
    rows.push(`${p.turn},${p.risk},${p.state?.distress ?? ""},${p.state?.disclosure ?? ""}`);
  }
  return rows.join("\n");
}
