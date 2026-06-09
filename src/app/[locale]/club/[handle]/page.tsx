import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { aggregateByClub } from "@/lib/aggregations";
import { Cover } from "@/components/Cover";

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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/clubs" className="text-sm opacity-60 hover:opacity-100 mb-6 inline-block">
        ← {t("nav.clubs")}
      </Link>

      <header className="mb-12 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-widest opacity-60 mb-2 flex items-center gap-2">
          <span>{club.flag}</span>
          <span>{club.liga}</span>
        </div>
        <h1 className="font-serif text-5xl md:text-7xl leading-none">{club.club}</h1>
        <p className="mt-2 text-sm opacity-60">@{club.handle}</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        <Stat label={t("club.appearances")} value={club.appearances} />
        <Stat label={t("club.topSpots")} value={club.topOnes} />
        <Stat label={t("club.bestER")} value={club.bestEr ? `${club.bestEr.toFixed(2)}%` : "—"} />
        <Stat label={t("club.bestTER")} value={club.bestTer ? `${club.bestTer.toFixed(2)}%` : "—"} />
        <Stat label={t("club.bestLikes")} value={club.bestLikes ? fmtCompact(club.bestLikes) : "—"} />
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
                <Cover src={a.cover_url} className="absolute inset-0 w-full h-full object-cover" />
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
