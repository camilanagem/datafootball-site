import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://datafootball.co/sitemap.xml",
    host: "https://datafootball.co",
  };
}
