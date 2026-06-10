import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { aggregateByClub } from "@/lib/aggregations";
import { getEdition, isNationalTeam } from "@/lib/edition";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("standings.title"),
    description: t("standings.lead"),
    alternates: { canonical: `${path}/standings` },
    openGraph: { title: t("standings.title"), description: t("standings.lead"), images: ["/og.png"] },
  };
}

export default async function StandingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { isTournament } = getEdition();

  const rows = Object.values(aggregateByClub())
    .filter((c) => isNationalTeam(c.liga) === isTournament)
    .sort((a, b) => b.topOnes - a.topOnes || b.appearances - a.appearances)
    .slice(0, 30);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10 border-b border-current/15 pb-8">
        <h1 className="font-serif text-5xl md:text-7xl leading-none">{t("standings.title")}</h1>
        <p className="mt-3 max-w-xl opacity-70">{t("standings.lead")}</p>
      </header>

      <div className="rounded-xl border border-current/15 divide-y divide-current/10">
        {rows.map((c, i) => (
          <Link
            key={c.handle}
            href={`/club/${c.handle}`}
            className="flex items-center gap-2 px-4 py-3 hover:bg-current/5"
          >
            <span className="w-7 shrink-0 font-serif text-lg opacity-40 tabular-nums">{i + 1}</span>
            <span className="shrink-0" aria-hidden>{c.flag}</span>
            <span className="flex-1 min-w-0 font-serif truncate">{c.club}</span>
            <span className="w-16 text-right shrink-0">
              <span className="block font-serif text-lg tabular-nums leading-none">{c.topOnes}</span>
              <span className="block text-[9px] uppercase tracking-wide opacity-40 mt-0.5">{t("standings.firsts")}</span>
            </span>
            <span className="w-20 text-right shrink-0">
              <span className="block font-serif text-lg tabular-nums leading-none">{c.appearances}</span>
              <span className="block text-[9px] uppercase tracking-wide opacity-40 mt-0.5">{t("club.appearances")}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
