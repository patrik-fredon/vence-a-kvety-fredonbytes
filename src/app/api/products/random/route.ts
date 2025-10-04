import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/products/random - Get random products for homepage teasers
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const count = Math.min(Number.parseInt(searchParams.get("count") || "3"), 10); // Max 10 products

    // Get random products that are active and in stock
    // Use a more sophisticated random selection algorithm
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name_cs,
        name_en,
        slug,
        base_price,
        images,
        availability,
        active,
        featured
      `)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(50); // Get more products to randomize from

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch products",
        },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
      });
    }

    // Filter products that are in stock
    const availableProducts = products.filter(
      (product) => (product.availability as any)?.["inStock"] !== false
    );

    if (availableProducts.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
      });
    }

    // Enhanced random selection algorithm
    // 1. Prioritize featured products (30% chance to be selected first)
    // 2. Use Fisher-Yates shuffle for true randomness
    // 3. Ensure variety by avoiding similar products

    const featuredProducts = availableProducts.filter((p) => p.featured);
    const regularProducts = availableProducts.filter((p) => !p.featured);

    let selectedProducts: typeof availableProducts = [];

    // Add some featured products first (if available)
    if (featuredProducts.length > 0 && Math.random() < 0.7) {
      const shuffledFeatured = fisherYatesShuffle([...featuredProducts]);
      const featuredCount = Math.min(Math.ceil(count * 0.4), shuffledFeatured.length);
      selectedProducts.push(...shuffledFeatured.slice(0, featuredCount));
    }

    // Fill remaining slots with regular products
    const remainingCount = count - selectedProducts.length;
    if (remainingCount > 0 && regularProducts.length > 0) {
      const shuffledRegular = fisherYatesShuffle([...regularProducts]);
      selectedProducts.push(...shuffledRegular.slice(0, remainingCount));
    }

    // If we still don't have enough, fill from all available
    if (selectedProducts.length < count) {
      const allShuffled = fisherYatesShuffle([...availableProducts]);
      const needed = count - selectedProducts.length;
      const additional = allShuffled
        .filter((p) => !selectedProducts.some((s) => s.id === p.id))
        .slice(0, needed);
      selectedProducts.push(...additional);
    }

    // Final shuffle to ensure randomness
    selectedProducts = fisherYatesShuffle(selectedProducts).slice(0, count);

    // Transform to match Product interface
    const transformedProducts = selectedProducts.map((product) => ({
      id: product.id,
      name: {
        cs: product.name_cs,
        en: product.name_en,
      },
      slug: product.slug,
      basePrice: product.base_price,
      images: product.images || [],
      availability: product.availability || { inStock: true },
      active: product.active,
      featured: product.featured,
      seoMetadata: {
        title: { cs: "", en: "" },
        description: { cs: "", en: "" },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Random products API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Fisher-Yates shuffle algorithm for true randomness
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j]!; // Non-null assertion since j is always valid index
    shuffled[j] = temp!; // Non-null assertion since temp is from valid index
  }
  return shuffled;
}
