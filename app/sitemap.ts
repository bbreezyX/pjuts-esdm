import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://esdm.cloud";

  // Only include pages that:
  // 1. Are publicly accessible (no authentication required)
  // 2. Do NOT redirect under any circumstance
  // 3. Have meaningful content for search engines
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Note: /login and /forgot-password are intentionally excluded from sitemap
    // because they are utility pages, not content pages.
    // They are still accessible but don't need to be indexed as primary pages.
  ];
}
