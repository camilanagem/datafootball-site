// Structured data (JSON-LD) — builders reutilizáveis.
// Google usa pra rich results; motores de IA (ChatGPT/Claude/Perplexity/Gemini) usam
// pra entender e CITAR o dado. O ativo do datafootball é dado proprietário → o schema
// que mais importa é Dataset (grita "aqui tem dado citável") + Organization/WebSite.

export const SITE = {
  name: "DataFootball",
  url: "https://datafootball.co",
  logo: "https://datafootball.co/og.png",
  sameAs: [
    "https://instagram.com/datafootball__",
    "https://tiktok.com/@datafootball__",
  ],
  description:
    "The daily index of football's most-engaged posts. We rank clubs and national teams by engagement, likes and views across Instagram and TikTok — every day.",
};

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    alternateName: "datafootball",
    url: SITE.url,
    logo: SITE.logo,
    description: SITE.description,
    sameAs: SITE.sameAs,
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: { "@id": ORG_ID },
    inLanguage: ["en", "pt", "es"],
  };
}

// Dataset — cada dia (ou a coleção toda) é um conjunto de dados citável.
export function datasetLd(opts: {
  name: string;
  description: string;
  url: string;
  temporalCoverage: string; // "2026-07-08" ou "2026-06-01/2026-07-09"
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isAccessibleForFree: true,
    creator: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    temporalCoverage: opts.temporalCoverage,
    variableMeasured: ["engagement rate", "likes", "comments", "views"],
    keywords: [
      "football", "soccer", "Instagram", "TikTok",
      "engagement rate", "social media ranking", "football clubs", "national teams",
    ],
    license: `${SITE.url}/methodology`,
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function faqLd(qas: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qas.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: { "@type": "Answer", text: qa.a },
    })),
  };
}
