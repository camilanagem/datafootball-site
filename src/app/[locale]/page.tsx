import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { getCalendarDays } from "@/lib/data";
import { getEdition } from "@/lib/edition";
import { getThisWeek } from "@/lib/momentum";
import { Cover } from "@/components/Cover";

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
  const week = getThisWeek();

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
          <span className="font-display text-sm uppercase tracking-wide align-middle">
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

      {/* ESTA SEMANA — pulso da edição atual */}
      {week.leaders.length > 0 && (
        <section className="mb-14 md:mb-20">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <Link href="/week" className="group inline-flex items-baseline gap-2">
              <h2 className="font-serif text-3xl md:text-4xl group-hover:opacity-70">{t("thisWeek.title")}</h2>
              <span className="text-lg opacity-40 group-hover:opacity-70">→</span>
            </Link>
            <span className="text-xs uppercase tracking-widest opacity-50 whitespace-nowrap">
              {t("thisWeek.window", { count: week.dayCount })}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-widest opacity-50 mb-3">{t("thisWeek.mostActive")}</div>
              <div className="rounded-xl border border-current/15 divide-y divide-current/10">
                {week.leaders.map((l, i) => (
                  <Link key={l.handle} href={`/club/${l.handle}`} className="flex items-center gap-3 px-4 py-3 hover:bg-current/5">
                    <span className="font-serif text-lg opacity-40 w-5 tabular-nums shrink-0">{i + 1}</span>
                    <span aria-hidden className="shrink-0">{l.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-serif truncate">{l.club}</div>
                      <div className="text-xs opacity-50">
                        {t("club.appearancesN", { count: l.appearances })}
                        {l.topOnes > 0 ? ` · ${t("thisWeek.firsts", { count: l.topOnes })}` : ""}
                      </div>
                    </div>
                    {l.streak >= 3 && (
                      <span
                        className="text-xs shrink-0 whitespace-nowrap opacity-80"
                        title={t("thisWeek.streak", { count: l.streak })}
                      >
                        🔥 {t("thisWeek.streak", { count: l.streak })}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            {week.topPost && (
              <a
                href={week.topPost.url}
                target="_blank"
                rel="noopener"
                className="rounded-xl border border-current/15 overflow-hidden hover:border-current/40 transition flex flex-col"
              >
                <div className="aspect-[4/3] bg-current/5">
                  <Cover src={week.topPost.cover_url} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="text-xs uppercase tracking-widest opacity-50">{t("thisWeek.biggest")}</div>
                  <div className="font-serif text-3xl md:text-4xl tabular-nums mt-2 leading-none">
                    {week.topPost.value} <span className="text-base opacity-50">{t("thisWeek.likes")}</span>
                  </div>
                  <div className="font-serif text-lg mt-3 flex items-center gap-2">
                    <span aria-hidden>{week.topPost.flag}</span>
                    <span>{week.topPost.club}</span>
                  </div>
                </div>
              </a>
            )}
          </div>
        </section>
      )}

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
