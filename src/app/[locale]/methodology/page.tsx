import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { faqLd } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    title: t("methodology.title"),
    description: t("methodology.intro"),
    alternates: { canonical: `${path}/methodology` },
  };
}

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const faqs = t.raw("methodology.faq") as { q: string; a: string }[];
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <JsonLd data={faqLd(faqs)} />
      <h1 className="font-display text-5xl md:text-7xl leading-none uppercase mb-6">{t("methodology.title")}</h1>
      <p className="text-xl md:text-2xl opacity-80 mb-14 max-w-3xl">{t("methodology.intro")}</p>

      <section className="grid md:grid-cols-3 gap-4 md:gap-5 mb-6">
        <Method title={t("methodology.erTitle")} formula="(Likes + Comments) ÷ Followers × 100" bg="#00f65b" fg="#0a1512">
          {t("methodology.erDesc")}
        </Method>
        <Method title={t("methodology.verTitle")} formula="(Likes + Comments) ÷ Views × 100" bg="#1e77bd" fg="#eaf3ff">
          {t("methodology.verDesc")}
        </Method>
        <Method title={t("methodology.terTitle")} formula="(Likes + Comments + Shares) ÷ Views × 100" bg="#ff1e1e" fg="#ffffff">
          {t("methodology.terDesc")}
        </Method>
      </section>
      <section className="grid md:grid-cols-3 gap-4 md:gap-5">
        <Block title={t("methodology.equalTitle")} body={t("methodology.equalDesc")} />
        <Block title={t("methodology.dontTitle")} body={t("methodology.dontDesc")} />
        <Block title={t("methodology.windowTitle")} body={t("methodology.windowDesc")} />
      </section>

      <section className="mt-20 border-t border-current/15 pt-12">
        <h2 className="font-display text-3xl md:text-5xl uppercase mb-8">{t("methodology.faqTitle")}</h2>
        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {faqs.map((f, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-display text-lg uppercase tracking-wide mb-2">{f.q}</h3>
              <p className="opacity-80 text-base leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Method({ title, formula, bg, fg, children }: { title: string; formula: string; bg: string; fg: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 flex flex-col">
      {/* título DENTRO da barra colorida sólida (cor da categoria) — estilo inline (à prova de layer) */}
      <h3 className="rounded-xl px-4 py-3 mb-4 font-display text-base md:text-lg uppercase tracking-wide leading-tight"
          style={{ background: bg, color: fg }}>{title}</h3>
      <code className="block text-sm rounded-lg px-3 py-2 font-mono mb-3 bg-current/5 opacity-80">{formula}</code>
      <p className="opacity-80 text-base leading-relaxed">{children}</p>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-6">
      <h3 className="font-display text-lg uppercase tracking-wide mb-3">{title}</h3>
      <p className="opacity-80 text-base leading-relaxed">{body}</p>
    </div>
  );
}
