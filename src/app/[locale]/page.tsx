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
        <h1 className="font-serif text-5xl md:text-7xl tracking-tight leading-none">
          datafootball<span className="text-[var(--color-tt-red)]">.</span>
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
