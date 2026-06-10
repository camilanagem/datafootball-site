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
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-5xl md:text-6xl leading-none mb-6">{t("methodology.title")}</h1>
      <p className="text-lg opacity-80 mb-12">{t("methodology.intro")}</p>

      <section className="space-y-12 font-sans">
        <Method title={t("methodology.erTitle")} formula="(Likes + Comments) ÷ Followers × 100">
          {t("methodology.erDesc")}
        </Method>
        <Method title={t("methodology.verTitle")} formula="(Likes + Comments) ÷ Views × 100">
          {t("methodology.verDesc")}
        </Method>
        <Method title={t("methodology.terTitle")} formula="(Likes + Comments + Shares) ÷ Views × 100">
          {t("methodology.terDesc")}
        </Method>
        <Block title={t("methodology.equalTitle")} body={t("methodology.equalDesc")} />
        <Block title={t("methodology.dontTitle")} body={t("methodology.dontDesc")} />
        <Block title={t("methodology.windowTitle")} body={t("methodology.windowDesc")} />
      </section>
    </div>
  );
}

function Method({ title, formula, children }: { title: string; formula: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-serif text-2xl mb-2">{title}</h3>
      <code className="block text-sm bg-current/5 rounded px-3 py-2 font-mono mb-3">{formula}</code>
      <p className="opacity-80 text-sm">{children}</p>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-t border-current/15 pt-8">
      <h3 className="font-serif text-xl mb-3">{title}</h3>
      <p className="opacity-80 text-sm">{body}</p>
    </div>
  );
}
