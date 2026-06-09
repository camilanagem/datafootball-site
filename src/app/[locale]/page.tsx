import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { getCalendarDays } from "@/lib/data";

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

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
      <section className="text-center mb-10 md:mb-14">
        {/* logo real (@datafootball__) — branca no tema escuro, preta no claro */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-black.png"
          alt="DATA FOOTBALL"
          className="block dark:hidden mx-auto w-64 md:w-[26rem] h-auto"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-white.png"
          alt="DATA FOOTBALL"
          className="hidden dark:block mx-auto w-64 md:w-[26rem] h-auto"
        />
        <p className="mt-5 max-w-xl mx-auto text-base md:text-lg opacity-70">
          {t("site.tagline")}.
        </p>
      </section>

      <section>
        <CalendarHeatmap days={days} initialMonth={initialMonth} />
      </section>
    </div>
  );
}
