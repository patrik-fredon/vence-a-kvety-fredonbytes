import { type NextRequest, NextResponse } from "next/server";
import { logAdminAction, withAdminAuth } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

/**
 * Get all products (Admin only)
 */
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const active = searchParams.get("active");
    const featured = searchParams.get("featured");
    const lowStock = searchParams.get("lowStock");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    const filters = {
      category: category || undefined,
      active: active ? active === "true" : undefined,
      featured: featured ? featured === "true" : undefined,
      lowStock: lowStock === "true",
      limit,
      offset,
    };

    const { data: products, error } = await adminUtils.getAllProducts(filters);

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při načítání produktů",
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { data: allProducts } = await adminUtils.getAllProducts({
      category: filters.category,
      active: filters.active,
      featured: filters.featured,
      lowStock: filters.lowStock,
    });

    return NextResponse.json({
      success: true,
      products: products || [],
      total: allProducts?.length || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
});;

/**
 * Create new product (Admin only)
 */
export const POST = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const productData = await request.json();

    // Validate required fields
    const requiredFields = ["name_cs", "name_en", "slug", "base_price", "category_id"];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Pole ${field} je povinné`,
          },
          { status: 400 }
        );
      }
    }

    // Ensure price is positive
    if (productData.base_price <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cena musí být větší než 0",
        },
        { status: 400 }
      );
    }

    const { data: product, error } = await adminUtils.createProduct(productData);

    if (error) {
      console.error("Error creating product:", error);

      // Handle duplicate slug error
      if (error.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            error: "Produkt s tímto URL slug již existuje",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Chyba při vytváření produktu",
        },
        { status: 500 }
      );
    }

    // Log admin action
    await logAdminAction(admin.id, "CREATE", "products", product.id, null, product, request);

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/admin/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
});
