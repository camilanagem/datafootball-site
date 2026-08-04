import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { aggregateByClub, erTimeSeries } from "@/lib/aggregations";
import { Cover } from "@/components/Cover";
import { isNationalTeam } from "@/lib/edition";
import { JsonLd } from "@/components/JsonLd";
import { SITE, datasetLd, breadcrumbLd } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}): Promise<Metadata> {
  const { locale, handle } = await params;
  const club = aggregateByClub()[handle];
  if (!club) return {};
  const t = await getTranslations({ locale });
  const title = t("club.metaTitle", { club: club.club });
  // descrição rica em dado (citável no snippet do Google e por IA)
  const description = t("club.summary", {
    club: club.club,
    appearances: club.appearances,
    topOnes: club.topOnes,
  });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title,
    description,
    alternates: { canonical: `${path}/club/${handle}` },
    openGraph: { title, description, images: ["/og.png"] },
  };
}

export default async function ClubPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>;
}) {
  const { locale, handle } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const club = aggregateByClub()[handle];
  if (!club) notFound();

  const isNT = isNationalTeam(club.liga);
  const byDay: Record<string, number> = {};
  for (const a of club.recentAppearances) byDay[a.date] = (byDay[a.date] || 0) + 1;
  const trend = Object.entries(byDay).sort((x, y) => x[0].localeCompare(y[0])).slice(-12);
  const maxDay = Math.max(...trend.map(([, n]) => n), 1);

  // ER: série do time + percentil entre os pares (top X%)
  const allEr = erTimeSeries(isNT);
  const avgOf = (s: { series: { value: number }[] }) => s.series.reduce((a, p) => a + p.value, 0) / s.series.length;
  const mineEr = allEr.find((s) => s.handle === handle);
  let erPct = 0, avgEr = 0, erMax = 1;
  if (mineEr) {
    const ranked = allEr.map((s) => ({ h: s.handle, a: avgOf(s) })).sort((x, y) => y.a - x.a);
    const idx = ranked.findIndex((r) => r.h === handle);
    avgEr = ranked[idx].a;
    erPct = Math.ceil(((idx + 1) / ranked.length) * 100);
    erMax = Math.max(...mineEr.series.map((p) => p.value), 1);
  }

  // structured data por entidade (Dataset + Breadcrumb) — dado citável por entidade
  const path = locale === "en" ? "" : `/${locale}`;
  const clubUrl = `${SITE.url}${path}/club/${handle}`;
  const dates = club.recentAppearances.map((a) => a.date).sort();
  const coverage = dates.length ? `${dates[0]}/${dates[dates.length - 1]}` : "";
  const datasetJson = datasetLd({
    name: `${club.club} — football social media engagement statistics`,
    description: `${club.club} (@${club.handle}) engagement rate, likes, best posts and daily ranking history on Instagram and TikTok, tracked by DataFootball.`,
    url: clubUrl,
    temporalCoverage: coverage,
  });
  const breadcrumbJson = breadcrumbLd([
    { name: "DataFootball", url: `${SITE.url}${path}/` },
    { name: isNT ? "National teams" : "Clubs", url: `${SITE.url}${path}/${isNT ? "national-teams" : "clubs"}` },
    { name: club.club, url: clubUrl },
  ]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <JsonLd data={[datasetJson, breadcrumbJson]} />
      <Link href={isNT ? "/national-teams" : "/clubs"} className="text-sm opacity-60 hover:opacity-100 mb-6 inline-block">
        ← {t(isNT ? "nav.nationalTeams" : "nav.clubs")}
      </Link>

      <header className="mb-6 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
          <span>{club.flag}</span>
          <span>{club.liga}</span>
        </div>
        <h1 className="font-serif text-5xl md:text-7xl leading-none">{club.club}</h1>
        <p className="mt-2 text-sm opacity-60 flex items-center gap-3 flex-wrap">
          <span>@{club.handle}</span>
        </p>
      </header>

      {/* frase citável — fato de entidade que a IA extrai e o Google usa no snippet */}
      <p className="mb-10 text-base opacity-75 leading-relaxed">
        {t("club.summary", { club: club.club, appearances: club.appearances, topOnes: club.topOnes })}
        {mineEr ? " " + t("club.summaryEr", { pct: erPct, avgEr: avgEr.toFixed(1) }) : ""}
      </p>

      {club.bestPost && (
        <a
          href={club.bestPost.url}
          target="_blank"
          rel="noopener"
          className="block rounded-xl border border-current/15 overflow-hidden hover:border-current/40 transition mb-10 sm:flex"
        >
          <div className="sm:w-1/2 aspect-square bg-current/5">
            <Cover src={club.bestPost.cover_url} className="w-full h-full object-cover object-top" />
          </div>
          <div className="p-6 sm:w-1/2 flex flex-col justify-center">
            <div className="text-xs uppercase tracking-widest opacity-50">{t("club.bestPost")}</div>
            <div className="font-serif text-4xl md:text-5xl tabular-nums mt-2 leading-none">
              {club.bestPost.value} <span className="text-base opacity-50">{t("thisWeek.likes")}</span>
            </div>
          </div>
        </a>
      )}

      {trend.length > 1 && (
        <section className="mb-10">
          <div className="text-xs uppercase tracking-widest opacity-50 mb-3">{t("club.trend")}</div>
          <div className="flex items-end gap-1 h-16">
            {trend.map(([date, n]) => (
              <div
                key={date}
                className="flex-1 bg-current/20 rounded-t min-h-[2px]"
                style={{ height: `${(n / maxDay) * 100}%` }}
                title={`${date} · ${n}`}
              />
            ))}
          </div>
        </section>
      )}

      {mineEr && mineEr.series.length > 1 && (
        <section className="mb-10">
          <div className="flex items-baseline justify-between gap-4 mb-3">
            <div className="text-xs uppercase tracking-widest opacity-50">{t("club.erTrend")}</div>
            <div className="text-sm whitespace-nowrap">
              <span className="font-serif text-lg">{t("club.topPct", { pct: erPct })}</span>
              <span className="opacity-50 ml-2 tabular-nums">{avgEr.toFixed(1)}% {t("club.avgEr")}</span>
            </div>
          </div>
          <svg viewBox="0 0 320 60" className="w-full h-14" preserveAspectRatio="none">
            <polyline
              points={mineEr.series.map((p, i) => `${(i / (mineEr!.series.length - 1)) * 320},${58 - (p.value / erMax) * 54}`).join(" ")}
              fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeOpacity={0.85}
            />
          </svg>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 mb-6">
        <Stat label={t("club.appearances")} value={club.appearances} />
        <Stat label={t("club.topSpots")} value={club.topOnes} />
      </section>

      <section className="mb-12 rounded-xl border border-current/15 overflow-hidden">
        <div className="flex items-center px-4 py-2 text-[10px] uppercase tracking-widest opacity-60 border-b border-current/10">
          <span className="flex-1 font-bold opacity-100">{t("club.best")}</span>
          <span className="w-24 text-right">{t("club.engagement")}</span>
          <span className="w-24 text-right">{t("club.mostLikes")}</span>
        </div>
        {(
          [
            ["photos", t("club.photos")],
            ["reels", t("club.reels")],
            ["tiktok", t("club.tiktok")],
          ] as const
        ).map(([k, label]) => {
          const bt = club.byType[k];
          return (
            <div key={k} className="flex items-center px-4 py-3 border-b border-current/10 last:border-0">
              <span className="flex-1 font-serif">{label}</span>
              <span className="w-24 text-right font-serif tabular-nums">
                {bt.engagement !== undefined ? (
                  <a href={bt.engagementUrl} target="_blank" rel="noopener" className="hover:underline">
                    {bt.engagement.toFixed(2)}%
                  </a>
                ) : (
                  "—"
                )}
              </span>
              <span className="w-24 text-right font-serif tabular-nums">
                {bt.likes !== undefined ? (
                  <a href={bt.likesUrl} target="_blank" rel="noopener" className="hover:underline">
                    {fmtCompact(bt.likes)}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">{t("club.gallery")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {club.recentAppearances.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener"
              className="block rounded-xl border border-current/15 overflow-hidden hover:border-current/40 transition"
            >
              <div className="relative aspect-[4/5] bg-current/5 flex items-center justify-center">
                <span className="font-serif text-3xl opacity-25">#{a.posicao}</span>
                <Cover src={a.cover_url} className="absolute inset-0 w-full h-full object-cover object-top" />
                <span className="absolute top-2 left-2 font-serif text-base leading-none bg-[var(--background)] rounded-md px-2 py-1">
                  #{a.posicao}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                <span className="opacity-80 truncate">{a.metric}</span>
                <span className="opacity-40 shrink-0">{a.date.slice(5)}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-current/15 p-4">
      <div className="font-serif text-3xl tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-widest opacity-60 mt-1">{label}</div>
    </div>
  );
}

function fmtCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}
