import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // API routes
          "/api/",
          // Protected app routes (require authentication)
          "/dashboard/",
          "/map/",
          "/reports/",
          "/units/",
          "/users/",
          "/analytics/",
          "/notifications/",
          "/report/",
          // PWA offline page
          "/~offline/",
          // Auth utility pages (not content pages)
          "/login",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: "https://esdm.cloud/sitemap.xml",
  };
}
