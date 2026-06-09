import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getDayReport, type Post } from "@/lib/data";
import { PostCard } from "@/components/PostCard";

function fmtDate(date: string, locale: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}): Promise<Metadata> {
  const { locale, date } = await params;
  if (!getDayReport(date)) return {};
  const t = await getTranslations({ locale });
  const formatted = fmtDate(date, locale);
  const title = t("day.metaTitle", { date: formatted });
  const description = t("day.metaDescription", { date: formatted });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title,
    description,
    alternates: { canonical: `${path}/day/${date}` },
    openGraph: { title, description, images: ["/og.png"] },
  };
}

const ChevronLeft = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const KIND_KEY: Record<string, string> = {
  "photos-er":    "photosEngagement",
  "photos-likes": "photosLikes",
  "reels-er":     "reelsEngagement",
  "reels-likes":  "reelsLikes",
  "tiktok-er":    "tiktokEngagement",
  "tiktok-likes": "tiktokLikes",
};

const KIND_ACCENT: Record<string, "default" | "tt-red" | "tt-sage"> = {
  "tiktok-er":    "tt-red",
  "tiktok-likes": "tt-sage",
};

const CAROUSEL_SHORT: Record<string, string> = {
  "photos-er":    "Photos ER",
  "reels-er":     "Reels ER",
  "photos-likes": "Photos Likes",
  "reels-likes":  "Reels Likes",
  "tiktok-er":    "TikTok ER",
  "tiktok-likes": "TikTok Likes",
};

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-4 rounded-xl border border-current/10">
      <div className="text-[10px] uppercase tracking-widest opacity-50 mb-1">{label}</div>
      <div className="font-serif text-2xl leading-none mb-1">{value}</div>
      <div className="text-xs opacity-50 truncate">{sub}</div>
    </div>
  );
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale, date } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const report = getDayReport(date);
  if (!report) notFound();

  const formatted = fmtDate(date, locale);

  const allPosts = report.carousels.flatMap(c => c.posts);

  // best ER across IG ER carousels
  const bestER = report.carousels
    .filter(c => c.ranking === "er" && c.kind !== "tiktok")
    .flatMap(c => c.posts)
    .reduce<Post | null>((best, p) => {
      const v = parseFloat(p.metric_value);
      if (isNaN(v)) return best;
      return !best || v > parseFloat(best.metric_value) ? p : best;
    }, null);

  // post with most likes (raw)
  const mostLikesPost = allPosts.reduce<Post | null>((best, p) => {
    const l = p.extra?.likes ?? 0;
    return l > (best?.extra?.likes ?? 0) ? p : best;
  }, null);

  // post with most views (reels / tiktok)
  const mostViewsPost = allPosts.reduce<Post | null>((best, p) => {
    const v = p.extra?.views ?? 0;
    return v > (best?.extra?.views ?? 0) ? p : best;
  }, null);
  const hasViews = (mostViewsPost?.extra?.views ?? 0) > 0;

  // carousels per handle → club of the day + cross-carousel winners
  const carouselsByHandle: Record<string, { carousels: Set<string>; post: Post }> = {};
  for (const c of report.carousels) {
    const key = `${c.kind}-${c.ranking}`;
    for (const p of c.posts) {
      if (!carouselsByHandle[p.handle]) {
        carouselsByHandle[p.handle] = { carousels: new Set(), post: p };
      }
      carouselsByHandle[p.handle].carousels.add(key);
    }
  }

  const ranked = Object.values(carouselsByHandle)
    .sort((a, b) => b.carousels.size - a.carousels.size);
  const clubOfDay = ranked[0] ?? null;

  const mvps = ranked
    .filter(({ carousels }) => carousels.size >= 2)
    .map(({ post, carousels }) => ({
      handle: post.handle,
      club:   post.club,
      flag:   post.flag,
      count:  carousels.size,
      slots:  [...carousels].sort(),
    }));

  const totalSlots = report.carousels.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Most-engaged football posts · ${formatted}`,
    itemListElement: report.carousels
      .map((c, i) => {
        const top = c.posts[0];
        if (!top) return null;
        return {
          "@type": "ListItem",
          position: i + 1,
          name: `${top.club} — ${CAROUSEL_SHORT[`${c.kind}-${c.ranking}`] ?? c.kind}`,
          url: top.url,
        };
      })
      .filter(Boolean),
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/" className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-8">
        <ChevronLeft />
        <span>{t("nav.home")}</span>
      </Link>

      <header className="mb-8 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2">{t("day.headline")}</div>
        <h1 className="font-serif text-4xl md:text-6xl leading-none capitalize">{formatted}</h1>
      </header>

      {/* summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {bestER && (
          <StatTile
            label={t("day.bestER")}
            value={bestER.metric_value}
            sub={`${bestER.flag} @${bestER.handle}`}
          />
        )}
        {(mostLikesPost?.extra?.likes ?? 0) > 0 && (
          <StatTile
            label={t("day.mostLikes")}
            value={fmtNum(mostLikesPost!.extra!.likes)}
            sub={`${mostLikesPost!.flag} @${mostLikesPost!.handle}`}
          />
        )}
        {hasViews && (
          <StatTile
            label={t("day.mostViews")}
            value={fmtNum(mostViewsPost!.extra!.views)}
            sub={`${mostViewsPost!.flag} @${mostViewsPost!.handle}`}
          />
        )}
        {clubOfDay && (
          <StatTile
            label={t("day.clubOfDay")}
            value={clubOfDay.post.club}
            sub={`${clubOfDay.carousels.size}/${totalSlots} ${t("day.slots")}`}
          />
        )}
      </div>

      {/* cross-carousel MVPs */}
      {mvps.length > 0 && (
        <section className="mb-14">
          <div className="text-xs uppercase tracking-widest opacity-60 mb-4">{t("day.mvps")}</div>
          <div className="divide-y divide-current/10 rounded-xl border border-current/10 overflow-hidden">
            {mvps.map(({ handle, club, flag, count, slots }) => (
              <div key={handle} className="flex items-center gap-4 px-5 py-3">
                <div className="w-5 text-center shrink-0">{flag}</div>
                <div className="flex-1 min-w-0">
                  <span className="font-serif">{club}</span>
                  <span className="text-xs opacity-40 ml-2">@{handle}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {slots.map(s => (
                    <span
                      key={s}
                      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border border-current/20 opacity-70 whitespace-nowrap"
                    >
                      {CAROUSEL_SHORT[s] ?? s}
                    </span>
                  ))}
                </div>
                <div className="text-xs opacity-40 shrink-0 w-12 text-right">{count}/{totalSlots}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* carousels */}
      <div className="space-y-16">
        {report.carousels.map((carousel, i) => {
          const key = `${carousel.kind}-${carousel.ranking}`;
          const titleKey = KIND_KEY[key] || carousel.kind;
          const accent = KIND_ACCENT[key] || "default";
          return (
            <section key={i}>
              <div className="flex items-baseline justify-between mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-xs opacity-50">{carousel.slot_time}</span>
                  <h2 className="font-serif text-2xl md:text-3xl">{t(`day.${titleKey}`)}</h2>
                </div>
                <span className="text-xs uppercase tracking-widest opacity-60">
                  TOP {carousel.posts.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carousel.posts.map((post) => (
                  <PostCard key={`${post.posicao}-${post.url}`} post={post} accent={accent} locale={locale} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
