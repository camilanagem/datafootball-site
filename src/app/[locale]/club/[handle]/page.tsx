import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { aggregateByClub } from "@/lib/aggregations";

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

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Stat label="Appearances" value={club.appearances} />
        <Stat label="#1 spots" value={club.topOnes} />
        <Stat label="Best ER" value={club.bestEr ? `${club.bestEr.toFixed(2)}%` : "—"} />
        <Stat label="Best Likes" value={club.bestLikes ? fmtCompact(club.bestLikes) : "—"} />
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-4">Recent appearances</h2>
        <ul className="divide-y divide-current/10">
          {club.recentAppearances.map((a, i) => (
            <li key={i} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-serif text-2xl tabular-nums">#{a.posicao}</span>
                <span className="text-sm opacity-80">{a.date}</span>
              </div>
              <a href={a.url} target="_blank" rel="noopener" className="text-sm opacity-60 hover:opacity-100 underline">
                {a.metric} ↗
              </a>
            </li>
          ))}
        </ul>
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
