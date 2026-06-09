import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { getCalendarDays } from "@/lib/data";
import { getEdition } from "@/lib/edition";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Home />;
}

function Home() {
  const t = useTranslations();
  const days = getCalendarDays();
  const initialMonth = days[0]
    ? new Date(`${days[0].date.slice(0, 8)}01`)
    : new Date();
  const { isTournament, accountCount } = getEdition();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-14">
      {/* HERO — logo + o que é */}
      <section className="text-center mb-8 md:mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-black.png" alt="DATA FOOTBALL" className="block dark:hidden mx-auto w-64 md:w-[26rem] h-auto" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo-white.png" alt="DATA FOOTBALL" className="hidden dark:block mx-auto w-64 md:w-[26rem] h-auto" />
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl opacity-80 leading-relaxed">
          {t("home.what", { count: accountCount })}
        </p>
        <p className="mt-4 text-[11px] md:text-xs uppercase tracking-widest opacity-50">
          {t("home.statline", { count: accountCount })}
        </p>
      </section>

      {/* FAIXA DE SELEÇÕES (só durante o torneio) */}
      {isTournament && (
        <div className="mb-12 md:mb-16 max-w-2xl mx-auto rounded-xl border border-current/20 px-5 py-4 text-center">
          <span className="font-display text-sm uppercase tracking-wide align-middle" style={{ color: "var(--color-tt-red)" }}>
            ★ {t("tournament.label")}
          </span>
          <span className="text-sm opacity-75 align-middle"> — {t("tournament.body")}</span>
        </div>
      )}

      {/* COMO FUNCIONA */}
      <section className="mb-14 md:mb-20">
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-8 md:mb-10">{t("home.howTitle")}</h2>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <Step n="1" title={t("home.step1Title")} body={t("home.step1Body", { count: accountCount })} />
          <Step n="2" title={t("home.step2Title")} body={t("home.step2Body")} />
          <Step n="3" title={t("home.step3Title")} body={t("home.step3Body")} />
        </div>
      </section>

      {/* O ÍNDICE (calendário) */}
      <section>
        <h2 className="font-serif text-2xl md:text-3xl mb-1">{t("home.browse")}</h2>
        <p className="text-sm opacity-60 mb-6">{t("home.selectDay")}</p>
        <CalendarHeatmap days={days} initialMonth={initialMonth} />
      </section>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-current/15 p-6">
      <div className="font-serif text-3xl mb-3 opacity-30">{n}</div>
      <h3 className="font-serif text-xl mb-2">{title}</h3>
      <p className="text-sm opacity-70 leading-relaxed">{body}</p>
    </div>
  );
}
