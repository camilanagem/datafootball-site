import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { aggregateByLeague } from "@/lib/aggregations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("nav.leagues"),
    description: t("leagues.lead"),
    alternates: { canonical: `${path}/leagues` },
  };
}

export default async function LeaguesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const leagues = aggregateByLeague();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-current/15 pb-8">
        <h1 className="font-serif text-4xl md:text-6xl leading-none">{t("nav.leagues")}</h1>
        <p className="mt-3 max-w-xl opacity-70">{t("leagues.lead")}</p>
      </header>

      <ol className="space-y-3">
        {leagues.map((lg, i) => (
          <li key={lg.liga} className="rounded-xl border border-current/15 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="font-serif text-3xl opacity-50 tabular-nums w-8">{i + 1}</span>
              <span className="text-2xl">{lg.flag}</span>
              <div>
                <div className="font-serif text-xl">{lg.liga}</div>
                <div className="text-xs uppercase tracking-widest opacity-60">
                  {t("leagues.clubsN", { count: lg.uniqueClubs })} · {t("leagues.top")}: {lg.topClub ? (
                    <Link href={`/club/${lg.topClub.handle}`} className="underline">{lg.topClub.club}</Link>
                  ) : "—"}
                </div>
              </div>
            </div>
            <div className="font-serif text-3xl tabular-nums">{lg.totalAppearances}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
