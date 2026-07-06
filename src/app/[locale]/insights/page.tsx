import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Cover } from "@/components/Cover";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import ptData from "@/data/insights/latest.pt.json";
import enData from "@/data/insights/latest.en.json";
import esData from "@/data/insights/latest.es.json";

type Post = {
  club: string;
  flag: string;
  handle: string;
  kind: string;
  kindLabel: string;
  type: "engagement" | "likes";
  metric: string;
  cover_url: string | null;
  url: string;
};
type Insights = {
  week: { ini: string; fim: string; label: string };
  manchete: string;
  insights: string[];
  contraste: string;
  pra_acompanhar: string;
  numeros: { label: string; value: string }[];
  posts?: Post[];
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
  const tRoot = await getTranslations();
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

      {data.posts && data.posts.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xs uppercase tracking-[0.2em] opacity-60 mb-6">{t("posts")}</h2>
          {(["engagement", "likes"] as const).map((typ) => {
            const group = data.posts!.filter((p) => p.type === typ);
            if (group.length === 0) return null;
            return (
              <div key={typ} className="mb-8 last:mb-0">
                <h3 className="text-[11px] uppercase tracking-widest opacity-50 mb-4">
                  {typ === "engagement" ? t("mostEngaged") : t("mostLiked")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {group.map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener"
                      className="group block rounded-xl border border-current/15 overflow-hidden hover:border-current/40 transition"
                    >
                      <div className="aspect-[4/5] bg-current/5">
                        <Cover src={p.cover_url} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="font-serif text-sm flex items-center gap-1.5">
                          <span aria-hidden>{p.flag}</span>
                          <span className="truncate">{p.club}</span>
                        </div>
                        <div className="text-[11px] opacity-50 mt-0.5">{p.kindLabel}</div>
                        <div className="font-serif text-base tabular-nums mt-1">{p.metric}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="text-center border-t border-current/15 pt-12">
        <p className="font-serif text-2xl md:text-3xl leading-snug mb-2">{t("ctaTitle")}</p>
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
