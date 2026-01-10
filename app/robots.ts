import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/map/",
          "/reports/",
          "/units/",
          "/users/",
          "/analytics/",
          "/notifications/",
          "/report/",
          "/~offline/",
        ],
      },
    ],
    sitemap: "https://esdm.cloud/sitemap.xml",
  };
}
