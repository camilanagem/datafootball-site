import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { engagementVsPopularity, type EngPopRow } from "@/lib/aggregations";
import { getEdition } from "@/lib/edition";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("whyEngagement.title"),
    description: t("whyEngagement.lead"),
    alternates: {
      canonical: `https://datafootball.co${path}/engagement`,
      languages: { en: "https://datafootball.co/engagement", pt: "https://datafootball.co/pt/engagement", es: "https://datafootball.co/es/engagement" },
    },
  };
}

function fmtLikes(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export default async function EngagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("whyEngagement");
  const { isTournament } = getEdition();
  const { byEngagement, byPopularity, overlap } = engagementVsPopularity(isTournament);
  const popSet = new Set(byPopularity.map((r) => r.handle));

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-10 border-b border-current/15 pb-8">
        <h1 className="font-serif text-4xl md:text-6xl leading-[1.05]">{t("title")}</h1>
        <p className="mt-4 max-w-xl opacity-70 text-lg">{t("lead")}</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <Column title={t("byEngagement")} sub={t("byEngagementSub")} rows={byEngagement}
                value={(r) => `${r.er.toFixed(1)}%`} mark={(r) => !popSet.has(r.handle)} />
        <Column title={t("byPopularity")} sub={t("byPopularitySub")} rows={byPopularity}
                value={(r) => fmtLikes(r.likes)} />
      </div>

      <div className="mt-14 border-t border-current/15 pt-10">
        <p className="font-serif text-2xl md:text-4xl leading-snug max-w-3xl">{t("punchline", { overlap })}</p>
        <p className="mt-4 text-lg opacity-70">{t("cta")}</p>
      </div>
    </div>
  );
}

function Column({ title, sub, rows, value, mark }: {
  title: string; sub: string; rows: EngPopRow[];
  value: (r: EngPopRow) => string; mark?: (r: EngPopRow) => boolean;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-serif text-2xl">{title}</h2>
        <p className="text-xs uppercase tracking-widest opacity-60 mt-1">{sub}</p>
      </div>
      <ol className="rounded-xl border border-current/15 divide-y divide-current/10">
        {rows.map((r, i) => (
          <li key={r.handle} className="flex items-center gap-3 px-4 py-3">
            <span className="w-5 font-serif text-lg opacity-40 tabular-nums shrink-0">{i + 1}</span>
            <span aria-hidden className="shrink-0">{r.flag}</span>
            <span className="flex-1 min-w-0 font-serif truncate">
              {r.club}
              {mark?.(r) && <span className="ml-2 text-[10px] uppercase tracking-wide opacity-50">◆</span>}
            </span>
            <span className="font-serif tabular-nums shrink-0">{value(r)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
