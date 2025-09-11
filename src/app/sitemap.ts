import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const supabase = createServerClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/cs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/cs/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/products`,
          en: `${baseUrl}/en/products`,
        },
      },
    },
    {
      url: `${baseUrl}/en/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/products`,
          en: `${baseUrl}/en/products`,
        },
      },
    },
    {
      url: `${baseUrl}/cs/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/about`,
          en: `${baseUrl}/en/about`,
        },
      },
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/about`,
          en: `${baseUrl}/en/about`,
        },
      },
    },
    {
      url: `${baseUrl}/cs/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/contact`,
          en: `${baseUrl}/en/contact`,
        },
      },
    },
    {
      url: `${baseUrl}/en/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/contact`,
          en: `${baseUrl}/en/contact`,
        },
      },
    },
  ];

  try {
    // Get all active categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("active", true)
      .order("sort_order");

    // Get all active products
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("active", true)
      .order("created_at", { ascending: false });

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories?.map((category) => ({
      url: `${baseUrl}/cs/products?category=${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/products?category=${category.slug}`,
          en: `${baseUrl}/en/products?category=${category.slug}`,
        },
      },
    })) || [];

    // Add English category pages
    const categoryPagesEn: MetadataRoute.Sitemap = categories?.map((category) => ({
      url: `${baseUrl}/en/products?category=${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/products?category=${category.slug}`,
          en: `${baseUrl}/en/products?category=${category.slug}`,
        },
      },
    })) || [];

    // Product pages
    const productPages: MetadataRoute.Sitemap = products?.map((product) => ({
      url: `${baseUrl}/cs/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/products/${product.slug}`,
          en: `${baseUrl}/en/products/${product.slug}`,
        },
      },
    })) || [];

    // Add English product pages
    const productPagesEn: MetadataRoute.Sitemap = products?.map((product) => ({
      url: `${baseUrl}/en/products/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/products/${product.slug}`,
          en: `${baseUrl}/en/products/${product.slug}`,
        },
      },
    })) || [];

    return [
      ...staticPages,
      ...categoryPages,
      ...categoryPagesEn,
      ...productPages,
      ...productPagesEn,
    ];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return static pages only if database query fails
    return staticPages;
  }
}
