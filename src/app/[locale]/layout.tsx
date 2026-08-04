import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Barlow, Playfair_Display, Chakra_Petch, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsletterPopup } from "@/components/NewsletterPopup";
import { JsonLd } from "@/components/JsonLd";
import { organizationLd, websiteLd } from "@/lib/jsonld";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";

// Corpo = Barlow (sans do brand book 2.0). Inter saiu — não estava na identidade.
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

// Identidade 2.0 — Chakra Petch (display/kickers) + Instrument Serif (serifa de acento).
const chakra = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Wordmark — fonte real da logo do Instagram: Squad Black Italic (Fontfabric).
// ⚠️ versão DEMO (licença de avaliação) — trocar pelo arquivo licenciado ao comprar.
// Só A-Z/0-9 (sem acentos) — por isso é usada apenas no wordmark, não no corpo.
const squad = localFont({
  src: "../../fonts/squad-blackitalic.otf",
  variable: "--font-squad",
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const title = t("site.metaTitle");
  const description = t("site.metaDescription");
  const path = locale === "en" ? "" : `/${locale}`;
  return {
    metadataBase: new URL("https://datafootball.co"),
    title: { default: title, template: "%s · DataFootball" },
    description,
    keywords: [
      "football engagement",
      "soccer social media ranking",
      "Instagram football ranking",
      "TikTok football",
      "national teams engagement",
      "football data",
      "datafootball",
    ],
    alternates: {
      canonical: path || "/",
      languages: { en: "/", pt: "/pt", es: "/es", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: "DataFootball",
      url: `https://datafootball.co${path}`,
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "DataFootball" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${barlow.variable} ${playfair.variable} ${chakra.variable} ${instrument.variable} ${squad.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <NewsletterPopup />
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
