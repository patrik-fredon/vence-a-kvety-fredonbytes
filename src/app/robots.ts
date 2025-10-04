import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env["NEXT_PUBLIC_BASE_URL"] || "https://pohrebni-vence.cz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/checkout/",
          "/cart/",
          "/auth/",
          "/profile/",
          "/orders/",
          "/*?*", // Disallow URLs with query parameters to avoid duplicate content
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/checkout/",
          "/cart/",
          "/auth/",
          "/profile/",
          "/orders/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/checkout/",
          "/cart/",
          "/auth/",
          "/profile/",
          "/orders/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
