import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { InsightsEdition, type Insights } from "@/components/InsightsEdition";

const DIR = path.join(process.cwd(), "src", "data", "insights");

function allWeeks(): string[] {
  return [...new Set(
    fs.readdirSync(DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\./.test(f)).map((f) => f.split(".")[0]),
  )];
}

function load(week: string, locale: string): Insights | null {
  const lp = path.join(DIR, `${week}.${locale}.json`);
  const fp = fs.existsSync(lp) ? lp : path.join(DIR, `${week}.json`);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf8")) as Insights;
}

export function generateStaticParams() {
  return allWeeks().map((week) => ({ week }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; week: string }> }): Promise<Metadata> {
  const { locale, week } = await params;
  const data = load(week, locale);
  return { title: data ? `Insights · ${data.week.label}` : "Insights", description: data?.manchete };
}

export default async function InsightsEditionPage({ params }: { params: Promise<{ locale: string; week: string }> }) {
  const { locale, week } = await params;
  setRequestLocale(locale);
  const data = load(week, locale);
  if (!data) notFound();
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/insights" className="font-display text-xs uppercase tracking-widest opacity-60 hover:text-accent2 mb-8 inline-block">
        ← Insights
      </Link>
      <InsightsEdition data={data} />
    </div>
  );
}
