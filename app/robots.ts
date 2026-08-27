import type { MetadataRoute } from "next";

export const runtime = "edge";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://wallpaper-festverse-site.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: siteUrl + "/sitemap.xml",
  };
}
