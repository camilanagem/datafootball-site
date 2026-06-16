"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import stats from "@/data/stats.json";

function useCountUp(target: number, run: boolean, ms = 1600) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return n;
}

export function PostsCounter() {
  const t = useTranslations("counter");
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setSeen(true),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const count = useCountUp(stats.posts_total, seen);

  return (
    <section ref={ref} className="border-y border-current/15">
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <div className="font-serif text-6xl md:text-8xl leading-none tabular-nums">
          {count.toLocaleString("pt-BR")}
        </div>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] opacity-60">{t("label")}</p>
        <p className="mt-1 text-xs opacity-50">
          {t("detail", {
            ig: stats.instagram.toLocaleString("pt-BR"),
            tt: stats.tiktok.toLocaleString("pt-BR"),
            accounts: stats.accounts,
          })}
        </p>
      </div>
    </section>
  );
}
