import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { aggregateByClub } from "@/lib/aggregations";
import { isNationalTeam } from "@/lib/edition";

export default async function ClubsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const clubs = Object.values(aggregateByClub())
    .filter((c) => !isNationalTeam(c.liga))
    .sort((a, b) => b.appearances - a.appearances);
  const byLeague: Record<string, typeof clubs> = {};
  for (const c of clubs) {
    if (!byLeague[c.liga]) byLeague[c.liga] = [];
    byLeague[c.liga].push(c);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2">{t("nav.clubs")}</div>
        <h1 className="font-serif text-4xl md:text-6xl leading-none">{t("nav.clubs")}</h1>
        <p className="mt-3 opacity-70">{t("nav.clubsTracked", { count: clubs.length })}</p>
      </header>

      <div className="space-y-12">
        {Object.entries(byLeague).map(([liga, list]) => (
          <section key={liga}>
            <h2 className="font-serif text-2xl mb-4 flex items-center gap-2">
              <span>{list[0]?.flag}</span>
              <span>{liga}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((c) => (
                <Link
                  key={c.handle}
                  href={`/club/${c.handle}`}
                  className="block rounded-xl border border-current/15 p-4 hover:border-current/40 transition"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-serif text-lg leading-tight">{c.club}</span>
                    <span className="font-serif text-2xl tabular-nums">{c.appearances}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest opacity-60">
                    <span>@{c.handle}</span>
                    <span>{c.topOnes > 0 ? `${c.topOnes}× #1` : t("club.appearancesN", { count: c.appearances })}</span>
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
