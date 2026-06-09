import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-5xl md:text-6xl leading-none mb-6">{t("methodology.title")}</h1>
      <p className="text-lg opacity-80 mb-12">{t("methodology.intro")}</p>

      <section className="space-y-12 font-sans">
        <Method title="Engagement Rate (ER)" formula="(Likes + Comments) ÷ Followers × 100">
          For static posts. The standard engagement rate — likes and comments counted equally,
          divided by followers — so it's directly comparable to any industry benchmark.
        </Method>
        <Method title="Video Engagement Rate (VER)" formula="(Likes + Comments) ÷ Views × 100">
          For Reels. We divide by views instead of followers because a video's reach can far
          exceed the follower base — measuring against views reflects what was actually watched.
        </Method>
        <Method title="TikTok Engagement Rate (TER)" formula="(Likes + Comments + Shares) ÷ Views × 100">
          Same logic as Reels, plus shares — TikTok exposes shares publicly (Instagram doesn't),
          and a share is a strong engagement signal, so we count it.
        </Method>
        <div className="border-t border-current/15 pt-8">
          <h3 className="font-serif text-xl mb-3">Equal weights, on purpose</h3>
          <p className="opacity-80 text-sm">
            We don't weight comments or shares more than likes. A clean, equal-weight rate is what
            the market recognizes and can compare — no secret multipliers.
          </p>
        </div>
        <div className="border-t border-current/15 pt-8">
          <h3 className="font-serif text-xl mb-3">What we don't track</h3>
          <p className="opacity-80 text-sm">
            Saves — Instagram doesn't expose them publicly. Shares too, on Instagram (on TikTok
            they're public, so we count them there). We track only what's public.
          </p>
        </div>
        <div className="border-t border-current/15 pt-8">
          <h3 className="font-serif text-xl mb-3">Time window</h3>
          <p className="opacity-80 text-sm">
            24 hours in each club's local timezone — so "May 2nd" for Flamengo means BRT, for Real Madrid means CEST.
          </p>
        </div>
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
