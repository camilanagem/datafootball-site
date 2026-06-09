import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getRecords } from "@/lib/aggregations";
import { getEdition, isNationalTeam } from "@/lib/edition";

const LABEL_KEY: Record<string, string> = { ER: "er", VER: "ver", Likes: "likes" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("nav.halloffame"),
    description: t("halloffame.lead"),
    alternates: { canonical: `${path}/hall-of-fame` },
  };
}

export default async function HallOfFamePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const records = getRecords();
  const { isTournament } = getEdition();
  const fmtDate = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(
      locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10 border-b border-current/15 pb-8">
        <h1 className="font-serif text-4xl md:text-6xl leading-none">{t("nav.halloffame")}</h1>
        <p className="mt-3 max-w-xl opacity-70">{t("halloffame.lead")}</p>
        {isTournament && (
          <p className="mt-2 max-w-xl text-sm opacity-50">{t("halloffame.editionNote")}</p>
        )}
      </header>

      <div className="space-y-4">
        {records.map((r) => (
          <a
            key={r.type}
            href={r.url}
            target="_blank"
            rel="noopener"
            className="block rounded-xl border border-current/15 p-6 hover:border-current/40 transition"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase tracking-widest opacity-60">
                {t(`halloffame.${LABEL_KEY[r.type] ?? "likes"}`)}
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-current/20 opacity-60 whitespace-nowrap">
                {t(isNationalTeam(r.liga) ? "halloffame.team" : "halloffame.club")}
              </span>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="font-serif text-5xl md:text-6xl tabular-nums leading-none">{r.value}</div>
              <div className="text-left sm:text-right">
                <div className="font-serif text-xl flex items-center gap-2 justify-start sm:justify-end">
                  <span aria-hidden>{r.flag}</span>
                  <span>{r.club}</span>
                </div>
                <div className="text-xs uppercase tracking-widest opacity-50 mt-1">@{r.handle}</div>
                <div className="text-xs opacity-50 mt-0.5">{fmtDate(r.date)}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
