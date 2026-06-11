import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getThisWeek, type WeekPost } from "@/lib/momentum";
import { Cover } from "@/components/Cover";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("thisWeek.title"),
    description: t("thisWeek.recapLead"),
    alternates: { canonical: `${path}/week` },
    openGraph: { title: t("thisWeek.title"), description: t("thisWeek.recapLead"), images: ["/og.png"] },
  };
}

export default async function WeekPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const week = getThisWeek(12);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-10 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2">
          {t("thisWeek.window", { count: week.dayCount })}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl leading-none">{t("thisWeek.title")}</h1>
        <p className="mt-3 max-w-xl opacity-70">{t("thisWeek.recapLead")}</p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        <WeekHero label={t("thisWeek.biggest")} unit={t("thisWeek.likes")} post={week.topPost} />
        <WeekHero label={t("thisWeek.topEngagement")} post={week.topEngagement} />
      </div>

      <h2 className="font-serif text-2xl mb-4">{t("thisWeek.mostActive")}</h2>
      <div className="rounded-xl border border-current/15 divide-y divide-current/10">
        {week.leaders.map((l, i) => (
          <Link
            key={l.handle}
            href={`/club/${l.handle}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-current/5"
          >
            <span className="font-serif text-lg opacity-40 w-6 tabular-nums shrink-0">{i + 1}</span>
            <span aria-hidden className="shrink-0">{l.flag}</span>
            <div className="flex-1 min-w-0">
              <div className="font-serif truncate">{l.club}</div>
              {l.topOnes > 0 && (
                <div className="text-xs opacity-50">{t("thisWeek.firsts", { count: l.topOnes })}</div>
              )}
            </div>
            <span className="text-xs shrink-0 whitespace-nowrap opacity-70">
              {t("thisWeek.timesThisWeek", { count: l.appearances })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function WeekHero({ label, unit, post }: { label: string; unit?: string; post: WeekPost | null }) {
  if (!post) return null;
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener"
      className="rounded-xl border border-current/15 overflow-hidden hover:border-current/40 transition flex flex-col"
    >
      <div className="aspect-[4/3] bg-current/5">
        <Cover src={post.cover_url} className="w-full h-full object-cover" />
      </div>
      <div className="p-5">
        <div className="text-xs uppercase tracking-widest opacity-50">{label}</div>
        <div className="font-serif text-3xl md:text-4xl tabular-nums mt-2 leading-none">
          {post.value} {unit && <span className="text-base opacity-50">{unit}</span>}
        </div>
        <div className="font-serif text-lg mt-3 flex items-center gap-2">
          <span aria-hidden>{post.flag}</span>
          <span>{post.club}</span>
        </div>
      </div>
    </a>
  );
}
