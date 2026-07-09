import type { MetadataRoute } from "next";
import { getCalendarDays } from "@/lib/data";

const BASE = "https://datafootball.co";

// localePrefix "as-needed": en sem prefixo, pt→/pt, es→/es. hreflang aponta as 3 versões.
function langs(path: string): Record<string, string> {
  return {
    en: `${BASE}${path}`,
    pt: `${BASE}/pt${path}`,
    es: `${BASE}/es${path}`,
    "x-default": `${BASE}${path}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/insights", "/national-teams", "/clubs", "/leagues", "/hall-of-fame", "/methodology", "/about"];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: r === "" ? "daily" : "weekly",
    priority: r === "" ? 1 : 0.7,
    alternates: { languages: langs(r) },
  }));
  for (const d of getCalendarDays()) {
    const path = `/day/${d.date}`;
    entries.push({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: langs(path) },
    });
  }
  return entries;
}
