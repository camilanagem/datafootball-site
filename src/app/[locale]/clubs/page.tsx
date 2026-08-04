import fs from "node:fs";
import path from "node:path";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { aggregateByClub } from "@/lib/aggregations";
import { isNationalTeam } from "@/lib/edition";

// escudos disponíveis em public/logos/<handle>.png — fallback pra bandeira quando não tiver
const LOGO_SET = new Set(
  fs.readdirSync(path.join(process.cwd(), "public", "logos")).map((f) => f.replace(/\.png$/i, "")),
);

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
        <h1 className="font-display text-4xl md:text-6xl leading-none uppercase">{t("nav.clubs")}</h1>
        <p className="mt-3 font-display text-sm uppercase tracking-widest opacity-60">
          {t("nav.clubsTracked", { count: clubs.length })}
        </p>
        <Link href="/leagues" className="inline-block mt-3 text-sm hover:text-accent2 transition-colors">
          {t("nav.leagues")} →
        </Link>
      </header>

      <div className="space-y-12">
        {Object.entries(byLeague).map(([liga, list]) => (
          <section key={liga}>
            <h2 className="font-display text-xl md:text-2xl uppercase tracking-wide mb-5 flex items-center gap-2">
              <span aria-hidden>{list[0]?.flag}</span>
              <span>{liga}</span>
              <span className="text-sm opacity-40">{list.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((c) => (
                <Link
                  key={c.handle}
                  href={`/club/${c.handle}`}
                  className="card block p-5 hover:opacity-95 transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {LOGO_SET.has(c.handle) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/logos/${c.handle}.png`} alt="" className="w-9 h-9 object-contain shrink-0" />
                    ) : (
                      <span className="text-2xl shrink-0" aria-hidden>{c.flag}</span>
                    )}
                    <span className="font-sans text-lg font-medium leading-tight truncate">{c.club}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="font-display text-4xl leading-none text-accent tabular-nums">{c.appearances}</div>
                      <div className="font-display text-[10px] uppercase tracking-widest opacity-50 mt-1">
                        {t("club.appearances")}
                      </div>
                    </div>
                    {c.topOnes > 0 && (
                      <span className="font-display text-sm uppercase tracking-wide text-accent">{c.topOnes}× #1</span>
                    )}
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
