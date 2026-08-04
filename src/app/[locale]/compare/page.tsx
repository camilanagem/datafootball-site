import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { metricTimeSeries } from "@/lib/aggregations";
import { getEdition } from "@/lib/edition";
import { CompareTool } from "@/components/CompareTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("compare.title"),
    description: t("compare.lead"),
    alternates: {
      canonical: `https://datafootball.co${path}/compare`,
      languages: { en: "https://datafootball.co/compare", pt: "https://datafootball.co/pt/compare", es: "https://datafootball.co/es/compare" },
    },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("compare");
  const { isTournament } = getEdition();
  const er = metricTimeSeries(isTournament, "er");
  const likes = metricTimeSeries(isTournament, "likes");

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="mb-10 border-b border-current/15 pb-8">
        <h1 className="font-display text-4xl md:text-6xl uppercase leading-[1.05]">{t("title")}</h1>
        <p className="mt-4 max-w-xl opacity-70 text-lg">{t("lead")}</p>
      </header>
      {er.length > 0 || likes.length > 0 ? <CompareTool er={er} likes={likes} /> : <p className="opacity-60">—</p>}
    </div>
  );
}
