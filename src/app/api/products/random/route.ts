import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

/**
 * GET /api/products/random - Get random products for homepage teasers
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const count = Math.min(parseInt(searchParams.get("count") || "3"), 10); // Max 10 products
    const locale = searchParams.get("locale") || "cs";

    // Get random products that are active and in stock
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
    const availableProducts = products.filter(product =>
      product.availability?.inStock !== false
    );

    // Randomly select products
    const shuffled = availableProducts.sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(0, count);

    // Transform to match Product interface
    const transformedProducts = selectedProducts.map(product => ({
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
      featured: product.featured || false,
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
