import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { aggregateByClub } from "@/lib/aggregations";
import { CONFEDERATIONS } from "@/lib/edition";

const CONFED_ORDER = ["UEFA", "CONMEBOL", "CONCACAF", "CAF", "AFC", "OFC"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  const title = t("nationalTeams.metaTitle");
  const description = t("nationalTeams.metaDescription");
  return {
    title,
    description,
    alternates: { canonical: `${path}/national-teams` },
    openGraph: { title, description, images: ["/og.png"] },
  };
}

export default async function NationalTeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const teams = Object.values(aggregateByClub())
    .filter((c) => CONFEDERATIONS.includes((c.liga || "").toUpperCase()))
    .sort((a, b) => b.appearances - a.appearances);

  const byConf: Record<string, typeof teams> = {};
  for (const tm of teams) {
    const k = tm.liga.toUpperCase();
    (byConf[k] ||= []).push(tm);
  }
  const confs = CONFED_ORDER.filter((c) => byConf[c]?.length);
  const battle = confs
    .map((conf) => ({
      conf,
      appearances: byConf[conf].reduce((s, tm) => s + tm.appearances, 0),
      teams: byConf[conf].length,
    }))
    .sort((a, b) => b.appearances - a.appearances);
  const maxApp = Math.max(...battle.map((b) => b.appearances), 1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2">{t("nav.nationalTeams")}</div>
        <h1 className="font-serif text-4xl md:text-6xl leading-none">{t("nationalTeams.title")}</h1>
        <p className="mt-3 max-w-xl opacity-70">{t("nationalTeams.lead")}</p>
        <p className="mt-1 text-sm opacity-50">{t("nationalTeams.count", { count: teams.length })}</p>
      </header>

      {battle.length > 1 && (
        <section className="mb-14">
          <h2 className="font-serif text-2xl mb-1">{t("nationalTeams.battle")}</h2>
          <p className="text-sm opacity-60 mb-5">{t("nationalTeams.battleLead")}</p>
          <div className="space-y-2.5">
            {battle.map((b) => (
              <div key={b.conf} className="flex items-center gap-3">
                <span className="w-24 shrink-0 font-serif text-sm">{b.conf}</span>
                <div className="flex-1 h-6 rounded-md bg-current/5 overflow-hidden">
                  <div
                    className="h-full bg-current/20"
                    style={{ width: `${Math.max(4, (b.appearances / maxApp) * 100)}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-serif tabular-nums">{b.appearances}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-12">
        {confs.map((conf) => (
          <section key={conf}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="font-serif text-2xl">{conf}</h2>
              <span className="text-xs uppercase tracking-widest opacity-50">{t(`regions.${conf}`)}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {byConf[conf].map((tm) => (
                <Link
                  key={tm.handle}
                  href={`/club/${tm.handle}`}
                  className="block rounded-xl border border-current/15 p-4 hover:border-current/40 transition"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-serif text-lg leading-tight flex items-center gap-2">
                      <span aria-hidden>{tm.flag}</span>
                      <span>{tm.club}</span>
                    </span>
                    <span className="font-serif text-2xl tabular-nums">{tm.appearances}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-60">
                    <span>@{tm.handle}</span>
                    {tm.topOnes > 0 && <span>{tm.topOnes}× #1</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
