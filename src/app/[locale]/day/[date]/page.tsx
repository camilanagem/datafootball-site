import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";

const ChevronLeft = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
import { getDayReport } from "@/lib/data";
import { PostCard } from "@/components/PostCard";

const KIND_KEY: Record<string, string> = {
  "photos-er": "photosEngagement",
  "photos-likes": "photosLikes",
  "reels-er": "reelsEngagement",
  "reels-likes": "reelsLikes",
  "tiktok-er": "tiktokEngagement",
  "tiktok-likes": "tiktokLikes",
};

const KIND_ACCENT: Record<string, "default" | "tt-red" | "tt-sage"> = {
  "tiktok-er": "tt-red",
  "tiktok-likes": "tt-sage",
};

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

  const dateObj = new Date(`${date}T00:00:00`);
  const formatted = dateObj.toLocaleDateString(
    locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm opacity-60 hover:opacity-100 mb-8">
        <ChevronLeft />
        <span>{t("nav.home")}</span>
      </Link>

      <header className="mb-12 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2">{t("day.headline")}</div>
        <h1 className="font-serif text-4xl md:text-6xl leading-none capitalize">{formatted}</h1>
      </header>

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
                  <PostCard key={`${post.posicao}-${post.url}`} post={post} accent={accent} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
