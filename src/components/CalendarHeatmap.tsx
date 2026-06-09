"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type DayChip = {
  kind: string;
  ranking: string;
  label: string;
  time: string;
  color: string;
};

export type DayData = {
  date: string;
  chips: DayChip[];
};

type Props = {
  days: DayData[];
  initialMonth?: Date;
};

const WEEKDAYS_EN = ["S", "M", "T", "W", "T", "F", "S"];

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function fmtDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function CalendarHeatmap({ days, initialMonth }: Props) {
  const router = useRouter();
  const t = useTranslations();
  const today = new Date();
  const [month, setMonth] = useState<Date>(initialMonth ?? startOfMonth(today));
  const map = new Map(days.map((d) => [d.date, d.chips]));

  const monthName = month.toLocaleDateString("en", { month: "long", year: "numeric" });
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrev = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const goNext = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-6">
        <button onClick={goPrev} aria-label="Previous month" className="px-3 py-2 hover:opacity-70 text-sm">‹</button>
        <h2 className="font-serif text-2xl md:text-3xl tracking-tight uppercase">{monthName}</h2>
        <button onClick={goNext} aria-label="Next month" className="px-3 py-2 hover:opacity-70 text-sm">›</button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-current/15 border border-current/15 rounded-xl overflow-hidden">
        {WEEKDAYS_EN.map((w, i) => (
          <div key={i} className="bg-[var(--background)] text-center text-[10px] uppercase tracking-widest opacity-50 py-2">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="bg-[var(--background)] min-h-[76px] md:min-h-[180px]" />;
          const iso = fmtDateISO(cell);
          const chips = map.get(iso) || [];
          const has = chips.length > 0;
          const isToday = iso === fmtDateISO(today);
          return (
            <button
              key={i}
              onClick={() => has && router.push(`/day/${iso}`)}
              disabled={!has}
              className={[
                "bg-[var(--background)] text-left p-1.5 md:p-2 transition-all flex flex-col gap-1 min-h-[76px] md:min-h-[180px]",
                has ? "hover:bg-current/5 cursor-pointer" : "opacity-40 cursor-default",
              ].join(" ")}
            >
              <span className={[
                "font-sans text-[11px] md:text-sm leading-none mb-0.5 self-end pr-1",
                isToday
                  ? "bg-current text-[var(--background)] rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold"
                  : "opacity-80",
              ].join(" ")}>
                {cell.getDate()}
              </span>
              {/* mobile: contagem em pontinhos (célula compacta) */}
              <div className="md:hidden flex flex-wrap gap-1 mt-1">
                {chips.map((_, idx) => (
                  <span key={idx} className="w-1.5 h-1.5 rounded-full bg-current opacity-50" aria-hidden />
                ))}
              </div>
              {/* desktop: chips detalhados */}
              <div className="hidden md:flex flex-col gap-[2px] flex-1 w-full overflow-hidden">
                {chips.map((c, idx) => (
                  <ChipRow key={idx} chip={c} />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs uppercase tracking-widest opacity-60">
        {t("home.selectDay")}
      </p>
    </div>
  );
}

function ChipRow({ chip }: { chip: DayChip }) {
  return (
    <div className="flex items-center gap-1 md:gap-1.5 text-[8.5px] md:text-[11px] leading-tight w-full">
      <span
        className="shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-current opacity-50"
        aria-hidden
      />
      <span className="font-mono opacity-70 shrink-0">{chip.time}</span>
      <span className="truncate">{chip.label}</span>
    </div>
  );
}
