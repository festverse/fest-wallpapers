import type { MetadataRoute } from "next";

export const runtime = "edge";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wallpaper-prosox-site.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl + "/", lastModified: now, changeFrequency: "hourly", priority: 1 }
  ];
  const filterEntries: MetadataRoute.Sitemap = [];
  const resolutions = ["720p", "1080p", "1440p", "4k", "8k"];
  const categories = ["nature", "space", "minimal", "city", "ocean", "forest", "neon", "cars", "anime", "dark"];
  resolutions.forEach((resolution) => {
    filterEntries.push({
      url: siteUrl + "/?resolution=" + resolution,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8
    });
  });
  categories.forEach((category) => {
    filterEntries.push({
      url: siteUrl + "/?q=" + category,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7
    });
  });
  filterEntries.push({
    url: siteUrl + "/?orientation=portrait",
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8
  });
  return [...staticEntries, ...filterEntries];
}
