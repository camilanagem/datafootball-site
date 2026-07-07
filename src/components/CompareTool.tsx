"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { TeamSeries } from "@/lib/aggregations";

// linhas distintas, visíveis nos dois temas
const COLORS = ["#c8102e", "#4a90d9", "#6aa84f", "#e69138", "#8e7cc3"];

export function CompareTool({ teams }: { teams: TeamSeries[] }) {
  const t = useTranslations("compare");
  const byHandle = Object.fromEntries(teams.map((x) => [x.handle, x]));
  const [sel, setSel] = useState<string[]>(() => {
    const ranked = [...teams].sort(
      (a, b) => Math.max(...b.series.map((p) => p.er)) - Math.max(...a.series.map((p) => p.er)),
    );
    return ranked.slice(0, 2).map((x) => x.handle);
  });
  const toggle = (h: string) =>
    setSel((s) => (s.includes(h) ? s.filter((x) => x !== h) : s.length >= 5 ? s : [...s, h]));

  const chosen = sel.map((h) => byHandle[h]).filter(Boolean) as TeamSeries[];
  const allDates = [...new Set(chosen.flatMap((c) => c.series.map((p) => p.date)))].sort();
  const xi: Record<string, number> = Object.fromEntries(allDates.map((d, i) => [d, i]));
  const maxEr = Math.max(1, ...chosen.flatMap((c) => c.series.map((p) => p.er)));

  const W = 800, H = 340, PADL = 46, PADB = 28, PADT = 16, PADR = 14;
  const px = (d: string) => (allDates.length <= 1 ? PADL : PADL + (xi[d] / (allDates.length - 1)) * (W - PADL - PADR));
  const py = (er: number) => PADT + (1 - er / maxEr) * (H - PADT - PADB);
  const fmtDate = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

  return (
    <div>
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

      <div className="rounded-xl border border-current/15 p-3 md:p-4 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 520 }}>
          {[0, 0.5, 1].map((f) => {
            const y = PADT + (1 - f) * (H - PADT - PADB);
            return (
              <g key={f}>
                <line x1={PADL} y1={y} x2={W - PADR} y2={y} stroke="currentColor" strokeOpacity={0.12} />
                <text x={PADL - 8} y={y + 4} textAnchor="end" fontSize="12" fill="currentColor" fillOpacity={0.5}>
                  {(maxEr * f).toFixed(0)}%
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
            const pts = c.series.filter((p) => xi[p.date] !== undefined).map((p) => `${px(p.date)},${py(p.er)}`).join(" ");
            return (
              <g key={c.handle}>
                <polyline points={pts} fill="none" stroke={col} strokeWidth={2.5} strokeLinejoin="round" />
                {c.series.map((p) => <circle key={p.date} cx={px(p.date)} cy={py(p.er)} r={3} fill={col} />)}
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
