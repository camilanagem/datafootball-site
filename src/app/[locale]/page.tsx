import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { Sparkle } from "@/components/Sparkle";
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
        <h1 className="font-display text-6xl md:text-8xl uppercase tracking-tight leading-none flex items-center justify-center gap-3">
          datafootball
          <Sparkle className="w-9 h-9 md:w-14 md:h-14" />
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-base md:text-lg opacity-70">
          {t("site.tagline")}.
        </p>
      </section>

      <section>
        <CalendarHeatmap days={days} initialMonth={initialMonth} />
      </section>
    </div>
  );
}
