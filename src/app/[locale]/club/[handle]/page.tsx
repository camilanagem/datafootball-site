import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { aggregateByClub } from "@/lib/aggregations";
import { Cover } from "@/components/Cover";
import { isNationalTeam } from "@/lib/edition";

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
  const description = t("club.metaDescription", { club: club.club });
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href={isNT ? "/national-teams" : "/clubs"} className="text-sm opacity-60 hover:opacity-100 mb-6 inline-block">
        ← {t(isNT ? "nav.nationalTeams" : "nav.clubs")}
      </Link>

      <header className="mb-10 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
          <span>{club.flag}</span>
          <span>{club.liga}</span>
        </div>
        <h1 className="font-serif text-5xl md:text-7xl leading-none">{club.club}</h1>
        <p className="mt-2 text-sm opacity-60 flex items-center gap-3 flex-wrap">
          <span>@{club.handle}</span>
        </p>
      </header>

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

      <section className="grid grid-cols-2 gap-4 mb-6">
        <Stat label={t("club.appearances")} value={club.appearances} />
        <Stat label={t("club.topSpots")} value={club.topOnes} />
      </section>

      <section className="mb-12 rounded-xl border border-current/15 overflow-hidden">
        <div className="flex items-center px-4 py-2 text-[10px] uppercase tracking-widest opacity-50 border-b border-current/10">
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
