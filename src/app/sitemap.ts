import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://pohrebni-vence.cz";
  const supabase = createServerClient();

  // Get current date for lastModified
  const now = new Date();

  // Static pages with enhanced metadata
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: `${baseUrl}/cs`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs`,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs`,
          en: `${baseUrl}/en`,
        },
      },
    },

    // Products listing - very high priority
    {
      url: `${baseUrl}/cs/products`,
      lastModified: now,
      changeFrequency: "hourly",
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
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/products`,
          en: `${baseUrl}/en/products`,
        },
      },
    },

    // About pages
    {
      url: `${baseUrl}/cs/about`,
      lastModified: now,
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
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: {
          cs: `${baseUrl}/cs/about`,
          en: `${baseUrl}/en/about`,
        },
      },
    },

    // Contact pages
    {
      url: `${baseUrl}/cs/contact`,
      lastModified: now,
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
      lastModified: now,
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
    // Get all active categories with additional metadata
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at, created_at, sort_order")
      .eq("active", true)
      .order("sort_order");

    // Get all active products with additional metadata
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at, created_at, featured")
      .eq("active", true)
      .order("created_at", { ascending: false });

    // Category pages with enhanced priority based on sort order
    const categoryPages: MetadataRoute.Sitemap = categories?.map((category) => {
      // Higher priority for categories with lower sort_order (more important)
      const priority = Math.max(0.6, 0.85 - (category.sort_order * 0.05));

      return {
        url: `${baseUrl}/cs/products?category=${category.slug}`,
        lastModified: new Date(category.updated_at),
        changeFrequency: "daily" as const,
        priority: Math.min(priority, 0.85),
        alternates: {
          languages: {
            cs: `${baseUrl}/cs/products?category=${category.slug}`,
            en: `${baseUrl}/en/products?category=${category.slug}`,
          },
        },
      };
    }) || [];

    // Add English category pages
    const categoryPagesEn: MetadataRoute.Sitemap = categories?.map((category) => {
      const priority = Math.max(0.6, 0.85 - (category.sort_order * 0.05));

      return {
        url: `${baseUrl}/en/products?category=${category.slug}`,
        lastModified: new Date(category.updated_at),
        changeFrequency: "daily" as const,
        priority: Math.min(priority, 0.85),
        alternates: {
          languages: {
            cs: `${baseUrl}/cs/products?category=${category.slug}`,
            en: `${baseUrl}/en/products?category=${category.slug}`,
          },
        },
      };
    }) || [];

    // Product pages with enhanced priority for featured products
    const productPages: MetadataRoute.Sitemap = products?.map((product) => {
      // Higher priority for featured products and newer products
      const daysSinceCreated = Math.floor((now.getTime() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyBonus = Math.max(0, 0.1 - (daysSinceCreated * 0.001)); // Bonus for newer products
      const featuredBonus = product.featured ? 0.1 : 0;
      const basePriority = 0.7;

      const priority = Math.min(basePriority + recencyBonus + featuredBonus, 0.9);

      return {
        url: `${baseUrl}/cs/products/${product.slug}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: "weekly" as const,
        priority: Math.round(priority * 100) / 100, // Round to 2 decimal places
        alternates: {
          languages: {
            cs: `${baseUrl}/cs/products/${product.slug}`,
            en: `${baseUrl}/en/products/${product.slug}`,
          },
        },
      };
    }) || [];

    // Add English product pages
    const productPagesEn: MetadataRoute.Sitemap = products?.map((product) => {
      const daysSinceCreated = Math.floor((now.getTime() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24));
      const recencyBonus = Math.max(0, 0.1 - (daysSinceCreated * 0.001));
      const featuredBonus = product.featured ? 0.1 : 0;
      const basePriority = 0.7;

      const priority = Math.min(basePriority + recencyBonus + featuredBonus, 0.9);

      return {
        url: `${baseUrl}/en/products/${product.slug}`,
        lastModified: new Date(product.updated_at),
        changeFrequency: "weekly" as const,
        priority: Math.round(priority * 100) / 100,
        alternates: {
          languages: {
            cs: `${baseUrl}/cs/products/${product.slug}`,
            en: `${baseUrl}/en/products/${product.slug}`,
          },
        },
      };
    }) || [];

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
