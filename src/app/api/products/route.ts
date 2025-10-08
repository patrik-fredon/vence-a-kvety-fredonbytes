/**
 * API routes for product management
 * Handles CRUD operations for products with search and filtering
 */

import {
  productToRow,
  transformCategoryRow,
  transformProductRow,
  validateProductData,
} from "@/lib/utils/product-transforms";
import {
  getProducts as getProductsOptimized,
  invalidateProduct,
  type ProductFilters,
} from "@/lib/services/product-service";
import { slugify as createSlug } from "@/lib/utils";
import type { ApiResponse } from "@/types";
import type {
  CategoryRow,
  CreateProductRequest,
  Product,
  ProductRow,
  ProductSearchParams,
} from "@/types/product";

/**
 * GET /api/products
 * Retrieve products with optional filtering, searching, and pagination
 */
import { type NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { withCache, invalidateApiCache, setCacheHeaders } from "@/lib/cache/api-cache";
import { CACHE_TTL } from "@/lib/cache/redis";

async function getProducts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: ProductFilters = {
      page: Number.parseInt(searchParams.get("page") || "1", 10),
      limit: Math.min(Number.parseInt(searchParams.get("limit") || "12", 10), 100),
      categoryId: searchParams.get("categoryId") || undefined,
      categorySlug: searchParams.get("categorySlug") || undefined,
      minPrice: searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined,
      inStock: searchParams.get("inStock") === "true" ? true : undefined,
      featured: searchParams.get("featured") === "true" ? true : undefined,
      search: searchParams.get("search") || undefined,
      locale: searchParams.get("locale") || "cs",
      sortField: (searchParams.get("sortField") as any) || "created_at",
      sortDirection: (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
    };

    // Use optimized product service with caching
    const result = await getProductsOptimized(filters);

    const response: ApiResponse<Product[]> = {
      success: true,
      data: result.products,
      pagination: result.pagination,
    };

    const jsonResponse = NextResponse.json(response);

    // Set cache headers for better performance
    return setCacheHeaders(jsonResponse, {
      maxAge: CACHE_TTL.PRODUCTS,
      staleWhileRevalidate: CACHE_TTL.DAY,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Export cached GET handler
export const GET = withCache(getProducts, {
  ttl: CACHE_TTL.PRODUCTS,
  keyPrefix: "products",
  varyBy: ["accept-language"],
});

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: CreateProductRequest = await request.json();

    // Validate the data
    const validation = validateProductData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data",
            details: validation.errors,
          },
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = createSlug(body.nameCs || body.nameEn);
    }

    // Check if slug already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", body.slug)
      .single();

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SLUG_EXISTS",
            message: "A product with this slug already exists",
          },
        } as ApiResponse,
        { status: 409 }
      );
    }

    // Prepare the data for insertion
    const imagesWithIds = (body.images || []).map((img, index) => ({
      ...img,
      id: `img_${Date.now()}_${index}`,
    }));

    const customizationOptionsWithIds = (body.customizationOptions || []).map((option, index) => ({
      ...option,
      id: `opt_${Date.now()}_${index}`,
      choices: option.choices.map((choice, choiceIndex) => ({
        ...choice,
        id: `choice_${Date.now()}_${index}_${choiceIndex}`,
      })),
    }));

    const productData = productToRow({
      nameCs: body.nameCs,
      nameEn: body.nameEn,
      slug: body.slug,
      descriptionCs: body.descriptionCs || "",
      descriptionEn: body.descriptionEn || "",
      basePrice: body.basePrice,
      categoryId: body.categoryId || "",
      images: imagesWithIds,
      customizationOptions: customizationOptionsWithIds,
      availability: body.availability || { inStock: true },
      seoMetadata: body.seoMetadata || {
        title: { cs: body.nameCs, en: body.nameEn },
        description: {
          cs: body.descriptionCs || body.nameCs,
          en: body.descriptionEn || body.nameEn,
        },
      },
      active: body.active !== undefined ? body.active : true,
      featured: body.featured ?? false,
    });

    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select(`
        *,
        categories (
          id,
          name_cs,
          name_en,
          slug,
          description_cs,
          description_en,
          image_url,
          parent_id,
          sort_order,
          active,
          created_at,
          updated_at
        )
      `)
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CREATE_ERROR",
            message: "Failed to create product",
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform the response
    const category = data.categories ? transformCategoryRow(data.categories) : undefined;
    const product = transformProductRow(data, category);

    // Invalidate products cache after creating new product
    await invalidateApiCache("products*");

    const response: ApiResponse<Product> = {
      success: true,
      data: product,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/products:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      } as ApiResponse,
      { status: 500 }
    );
  }
}
