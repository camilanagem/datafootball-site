import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ptData from "@/data/insights/latest.pt.json";
import enData from "@/data/insights/latest.en.json";
import esData from "@/data/insights/latest.es.json";

type Insights = {
  week: { ini: string; fim: string; label: string };
  manchete: string;
  insights: string[];
  contraste: string;
  pra_acompanhar: string;
  numeros: { label: string; value: string }[];
  legenda: string;
  assunto: string;
};
const BY_LOCALE: Record<string, Insights> = {
  pt: ptData as Insights,
  en: enData as Insights,
  es: esData as Insights,
};
const pick = (locale: string): Insights => BY_LOCALE[locale] ?? BY_LOCALE.pt;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const data = pick(locale);
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: `Insights · ${data.week.label}`,
    description: data.manchete,
    alternates: { canonical: `${path}/insights` },
    openGraph: { title: `Insights · ${data.week.label}`, description: data.manchete, images: ["/og.png"] },
  };
}

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const data = pick(locale);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-12 border-b border-current/15 pb-8">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-3">
          {t("kicker")} · {data.week.label}
        </div>
        <h1 className="font-serif text-4xl md:text-6xl leading-[1.05]">{data.manchete}</h1>
      </header>

      <section className="mb-14">
        <h2 className="text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("whatData")}</h2>
        <ul className="space-y-7">
          {data.insights.map((it, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-serif text-2xl opacity-40 leading-none pt-1 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[17px] md:text-lg leading-relaxed flex-1">{it}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-14 border-y border-current/15 py-10">
        <h2 className="text-xs uppercase tracking-[0.2em] opacity-60 mb-4">{t("contrast")}</h2>
        <p className="font-serif text-xl md:text-2xl leading-snug">{data.contraste}</p>
      </section>

      {data.pra_acompanhar && (
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] opacity-60 mb-4">{t("watch")}</h2>
          <p className="text-[17px] md:text-lg leading-relaxed opacity-90">{data.pra_acompanhar}</p>
        </section>
      )}

      {data.numeros?.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("numbers")}</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-current/15 border border-current/15">
            {data.numeros.map((n, i) => (
              <div key={i} className="bg-[var(--background)] p-5">
                <dt className="text-[11px] uppercase tracking-widest opacity-50 mb-2">{n.label}</dt>
                <dd className="font-serif text-lg md:text-xl leading-tight">{n.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="text-center border-t border-current/15 pt-12">
        <p className="font-serif text-2xl md:text-3xl leading-snug mb-2">{t("ctaTitle")}</p>
        <p className="opacity-70 mb-6">{t("ctaSub")}</p>
        <p className="text-sm uppercase tracking-[0.2em] opacity-50 animate-pulse">↓ {t("ctaScroll")}</p>
      </section>
    </div>
  );
}
