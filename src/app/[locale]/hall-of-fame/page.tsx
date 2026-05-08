import { setRequestLocale, getTranslations } from "next-intl/server";
import { getRecords } from "@/lib/aggregations";

export default async function HallOfFamePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const records = getRecords();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-current/15 pb-8">
        <h1 className="font-serif text-4xl md:text-6xl leading-none">{t("nav.halloffame")}</h1>
        <p className="mt-3 opacity-70">All-time records since launch</p>
      </header>

      <div className="space-y-6">
        {records.map((r) => (
          <a
            key={r.type}
            href={r.url}
            target="_blank"
            rel="noopener"
            className="block rounded-xl border border-current/15 p-6 hover:border-current/40 transition"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest opacity-60">Highest {r.type}</div>
                <div className="font-serif text-5xl mt-2 tabular-nums">{r.value}</div>
              </div>
              <div className="text-right">
                <div className="font-serif text-xl">{r.club}</div>
                <div className="text-xs uppercase tracking-widest opacity-60 mt-1">
                  {r.flag} @{r.handle}
                </div>
                <div className="text-xs opacity-60 mt-1">{r.date}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
