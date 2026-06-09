import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getRecords, type Record_ } from "@/lib/aggregations";
import { getEdition } from "@/lib/edition";

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
  const { clubs, teams } = getRecords();
  const { isTournament } = getEdition();
  const fmtDate = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(
      locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );

  const teamsSection = { title: t("nationalTeams.title"), records: teams };
  const clubsSection = { title: t("nav.clubs"), records: clubs };
  const sections = (isTournament
    ? [teamsSection, clubsSection]
    : [clubsSection, teamsSection]
  ).filter((s) => s.records.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10 border-b border-current/15 pb-8">
        <h1 className="font-serif text-4xl md:text-6xl leading-none">{t("nav.halloffame")}</h1>
        <p className="mt-3 max-w-xl opacity-70">{t("halloffame.lead")}</p>
        {isTournament && (
          <p className="mt-2 max-w-xl text-sm opacity-50">{t("halloffame.editionNote")}</p>
        )}
      </header>

      <div className="space-y-12">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-2xl mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.records.map((r) => (
                <RecordCard
                  key={`${section.title}-${r.type}`}
                  r={r}
                  label={t(`halloffame.${LABEL_KEY[r.type] ?? "likes"}`)}
                  date={fmtDate(r.date)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function RecordCard({ r, label, date }: { r: Record_; label: string; date: string }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener"
      className="block rounded-xl border border-current/15 p-6 hover:border-current/40 transition"
    >
      <div className="text-xs uppercase tracking-widest opacity-60 mb-3">{label}</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="font-serif text-5xl md:text-6xl tabular-nums leading-none">{r.value}</div>
        <div className="text-left sm:text-right">
          <div className="font-serif text-xl flex items-center gap-2 justify-start sm:justify-end">
            <span aria-hidden>{r.flag}</span>
            <span>{r.club}</span>
          </div>
          <div className="text-xs uppercase tracking-widest opacity-50 mt-1">@{r.handle}</div>
          <div className="text-xs opacity-50 mt-0.5">{date}</div>
        </div>
      </div>
    </a>
  );
}
