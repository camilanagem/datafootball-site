import type { MetadataRoute } from "next";
import { getCalendarDays } from "@/lib/data";

const BASE = "https://datafootball.co";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/clubs", "/leagues", "/hall-of-fame", "/methodology"];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${BASE}${r}`,
    lastModified: now,
    changeFrequency: r === "" ? "daily" : "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
  for (const d of getCalendarDays()) {
    entries.push({
      url: `${BASE}/day/${d.date}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  return entries;
}
