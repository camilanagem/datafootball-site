import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { InsightsEdition, type Insights } from "@/components/InsightsEdition";
import ptData from "@/data/insights/latest.pt.json";
import enData from "@/data/insights/latest.en.json";
import esData from "@/data/insights/latest.es.json";

const BY_LOCALE: Record<string, Insights> = {
  pt: ptData as Insights,
  en: enData as Insights,
  es: esData as Insights,
};
const pick = (locale: string): Insights => BY_LOCALE[locale] ?? BY_LOCALE.pt;

// todas as edições salvas (data/insights/<semana>.<locale>.json), mais nova primeiro
function editions(locale: string): { week: string; label: string; manchete: string }[] {
  const dir = path.join(process.cwd(), "src", "data", "insights");
  const weeks = [...new Set(
    fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\./.test(f)).map((f) => f.split(".")[0]),
  )].sort().reverse();
  return weeks.map((w) => {
    const lp = path.join(dir, `${w}.${locale}.json`);
    const fp = fs.existsSync(lp) ? lp : path.join(dir, `${w}.json`);
    const d = JSON.parse(fs.readFileSync(fp, "utf8"));
    return { week: w, label: d.week?.label ?? w, manchete: d.manchete ?? "" };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const data = pick(locale);
  const p = locale === "en" ? "" : `/${locale}`;
  return {
    title: `Insights · ${data.week.label}`,
    description: data.manchete,
    alternates: {
      canonical: `https://datafootball.co${p}/insights`,
      languages: { en: "https://datafootball.co/insights", pt: "https://datafootball.co/pt/insights", es: "https://datafootball.co/es/insights" },
    },
    openGraph: { title: `Insights · ${data.week.label}`, description: data.manchete },
  };
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const tRoot = await getTranslations();
  const data = pick(locale);
  const past = editions(locale).filter((e) => e.week !== data.week.fim);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <InsightsEdition data={data} />

      {past.length > 0 && (
        <section className="mb-16 border-t border-current/15 pt-12">
          <h2 className="font-display text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("allEditions")}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {past.map((e) => (
              <Link key={e.week} href={`/insights/${e.week}`} className="card block p-5 hover:opacity-95 transition">
                <div className="font-display text-xs uppercase tracking-widest text-accent mb-1">{e.label}</div>
                <div className="font-accent text-lg leading-snug">{e.manchete}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="text-center border-t border-current/15 pt-12">
        <p className="font-accent text-2xl md:text-3xl leading-snug mb-2">{t("ctaTitle")}</p>
        <p className="opacity-70 mb-6 max-w-md mx-auto">{t("ctaSub")}</p>
        <NewsletterSignup compact />
        <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="opacity-60 hover:opacity-100">{tRoot("home.browse")}</Link>
          <Link href="/hall-of-fame" className="opacity-60 hover:opacity-100">{tRoot("nav.halloffame")}</Link>
          <Link href="/methodology" className="opacity-60 hover:opacity-100">{tRoot("nav.methodology")}</Link>
        </nav>
      </section>
    </div>
  );
}
