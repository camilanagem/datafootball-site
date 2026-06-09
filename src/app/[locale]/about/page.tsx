import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("about.title"),
    description: t("about.lead"),
    alternates: { canonical: `${path}/about` },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-5xl md:text-6xl leading-none mb-6">{t("about.title")}</h1>
      <p className="text-xl md:text-2xl opacity-80 mb-10 leading-snug">{t("about.lead")}</p>
      <div className="space-y-6 text-base md:text-lg opacity-80 leading-relaxed">
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
        <p>{t("about.p3")}</p>
        <p>{t("about.p4")}</p>
      </div>
    </div>
  );
}
