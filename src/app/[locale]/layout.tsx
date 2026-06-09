import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
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

export const metadata: Metadata = {
  metadataBase: new URL("https://datafootball.co"),
  title: "DataFootball — Daily index of football's most-engaged posts",
  description: "Daily ranking of the 57+ biggest football clubs by engagement, likes, and views — across Instagram and TikTok.",
};

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
      className={`${inter.variable} ${playfair.variable} ${squad.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
