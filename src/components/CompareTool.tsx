"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TeamSeries } from "@/lib/aggregations";

// linhas distintas (paleta 2.0), visíveis nos dois temas
const COLORS = ["#00a848", "#1866a8", "#ff1e1e", "#e69138", "#8e7cc3"];

const topTwo = (list: TeamSeries[]) =>
  [...list]
    .sort((a, b) => Math.max(...b.series.map((p) => p.value)) - Math.max(...a.series.map((p) => p.value)))
    .slice(0, 2)
    .map((x) => x.handle);

export function CompareTool({ er, likes }: { er: TeamSeries[]; likes: TeamSeries[] }) {
  const t = useTranslations("compare");
  const [metric, setMetric] = useState<"er" | "likes">("er");
  const [sel, setSel] = useState<string[]>(() => topTwo(er));

  const teams = metric === "er" ? er : likes;
  const byHandle = Object.fromEntries(teams.map((x) => [x.handle, x]));
  const switchMetric = (m: "er" | "likes") => {
    setMetric(m);
    setSel(topTwo(m === "er" ? er : likes));
  };
  const toggle = (h: string) =>
    setSel((s) => (s.includes(h) ? s.filter((x) => x !== h) : s.length >= 5 ? s : [...s, h]));

  const fmtVal = (v: number) =>
    metric === "er"
      ? `${v.toFixed(0)}%`
      : v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${Math.round(v / 1_000)}K` : `${v}`;

  const chosen = sel.map((h) => byHandle[h]).filter(Boolean) as TeamSeries[];
  const allDates = [...new Set(chosen.flatMap((c) => c.series.map((p) => p.date)))].sort();
  const xi: Record<string, number> = Object.fromEntries(allDates.map((d, i) => [d, i]));
  const maxV = Math.max(1, ...chosen.flatMap((c) => c.series.map((p) => p.value)));

  const W = 800, H = 340, PADL = 54, PADB = 28, PADT = 16, PADR = 14;
  const px = (d: string) => (allDates.length <= 1 ? PADL : PADL + (xi[d] / (allDates.length - 1)) * (W - PADL - PADR));
  const py = (v: number) => PADT + (1 - v / maxV) * (H - PADT - PADB);
  const fmtDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

  const MetricBtn = ({ m, label }: { m: "er" | "likes"; label: string }) => (
    <button
      onClick={() => switchMetric(m)}
      aria-current={metric === m ? "true" : undefined}
      className={`px-4 py-1.5 rounded-full font-display text-xs uppercase tracking-widest transition ${
        metric === m ? "bg-[var(--foreground)] text-[var(--background)]" : "opacity-60 hover:opacity-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="inline-flex rounded-full border border-current/20 p-1 mb-6">
        <MetricBtn m="er" label="ER" />
        <MetricBtn m="likes" label="Likes" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {teams.map((tm) => {
          const on = sel.includes(tm.handle);
          const ci = sel.indexOf(tm.handle);
          return (
            <button
              key={tm.handle}
              onClick={() => toggle(tm.handle)}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${on ? "border-current font-medium" : "border-current/20 opacity-60 hover:opacity-100"}`}
              style={on ? { borderColor: COLORS[ci % COLORS.length], color: COLORS[ci % COLORS.length] } : undefined}
            >
              <span aria-hidden>{tm.flag}</span> {tm.club}
            </button>
          );
        })}
      </div>

      <div className="card p-3 md:p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 520 }}>
          {[0, 0.5, 1].map((f) => {
            const y = PADT + (1 - f) * (H - PADT - PADB);
            return (
              <g key={f}>
                <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="currentColor" strokeOpacity={0.12} />
                <text x={PADL - 8} y={y + 4} textAnchor="end" fontSize="12" fill="currentColor" fillOpacity={0.5}>
                  {fmtVal(maxV * f)}
                </text>
              </g>
            );
          })}
          {allDates.length > 1 && [0, allDates.length - 1].map((idx) => (
            <text key={idx} x={px(allDates[idx])} y={H - 8} textAnchor={idx === 0 ? "start" : "end"}
                  fontSize="12" fill="currentColor" fillOpacity={0.5}>{fmtDate(allDates[idx])}</text>
          ))}
          {chosen.map((c, i) => {
            const col = COLORS[i % COLORS.length];
            const pts = c.series.filter((p) => xi[p.date] !== undefined).map((p) => `${px(p.date)},${py(p.value)}`).join(" ");
            return (
              <g key={c.handle}>
                <polyline points={pts} fill="none" stroke={col} strokeWidth={2.5} strokeLinejoin="round" />
                {c.series.map((p) => <circle key={p.date} cx={px(p.date)} cy={py(p.value)} r={3} fill={col} />)}
              </g>
            );
          })}
        </svg>
      </div>

      {chosen.length > 0 ? (
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          {chosen.map((c, i) => (
            <div key={c.handle} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span>{c.club}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="opacity-60 text-sm mt-4">{t("pick")}</p>
      )}
    </div>
  );
}
