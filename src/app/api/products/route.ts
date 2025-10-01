/**
 * API routes for product management
 * Handles CRUD operations for products with search and filtering
 */

import { type NextRequest, NextResponse } from "next/server";
import { invalidateApiCache, setCacheHeaders, withCache } from "@/lib/cache/api-cache";
import { CACHE_TTL } from "@/lib/cache/redis";
import { createServerClient } from "@/lib/supabase/server";
import {
  createSlug,
  productToRow,
  transformCategoryRow,
  transformProductRow,
  validateProductData,
} from "@/lib/utils/product-transforms";
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
async function getProducts(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const params: ProductSearchParams = {
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Math.min(Number.parseInt(searchParams.get("limit") || "12"), 100), // Max 100 items per page
      categoryId: searchParams.get("categoryId") || "",
      categorySlug: searchParams.get("categorySlug") || "",
      minPrice: searchParams.get("minPrice")
        ? Number.parseFloat(searchParams.get("minPrice")!)
        : 0,
      maxPrice: searchParams.get("maxPrice")
        ? Number.parseFloat(searchParams.get("maxPrice")!)
        : 999999,
      inStock: searchParams.get("inStock") === "true",
      featured: searchParams.get("featured") === "true",
      search: searchParams.get("search") || "",
      locale: searchParams.get("locale") || "cs",
      sort: {
        field: (searchParams.get("sortField") as any) || "created_at",
        direction: (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
      },
    };

    // Build the query
    let query = supabase
      .from("products")
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
      .eq("active", true);

    // Apply filters
    if (params.categoryId) {
      query = query.eq("category_id", params.categoryId);
    }

    if (params.categorySlug) {
      query = query.eq("categories.slug", params.categorySlug);
    }

    if (params.minPrice !== undefined) {
      query = query.gte("base_price", params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      query = query.lte("base_price", params.maxPrice);
    }

    if (params.featured) {
      query = query.eq("featured", true);
    }

    if (params.inStock) {
      query = query.contains("availability", { inStock: true });
    }

    // Apply search
    if (params.search) {
      const searchTerm = params.search.trim();
      if (searchTerm) {
        // Use proper Supabase search syntax
        query = query.or(
          `name_cs.ilike.*${searchTerm}*,name_en.ilike.*${searchTerm}*,description_cs.ilike.*${searchTerm}*,description_en.ilike.*${searchTerm}*`
        );
      }
    }

    // Apply sorting
    const sortField =
      params.sort?.field === "name"
        ? params.locale === "en"
          ? "name_en"
          : "name_cs"
        : params.sort?.field === "price"
          ? "base_price"
          : params.sort?.field || "created_at";

    query = query.order(sortField, { ascending: params.sort?.direction === "asc" });

    // Apply pagination
    const offset = ((params.page || 1) - 1) * (params.limit || 12);
    query = query.range(offset, offset + (params.limit || 12) - 1);

    const { data: productsData, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FETCH_ERROR",
            message: "Failed to fetch products",
            details: error.message,
          },
        } as ApiResponse,
        { status: 500 }
      );
    }

    // Transform the data
    const products: Product[] = (productsData || []).map(
      (row: ProductRow & { categories?: CategoryRow | null }) => {
        const category = row.categories ? transformCategoryRow(row.categories) : undefined;
        return transformProductRow(row, category);
      }
    );

    // Get total count for pagination with same filters applied
    let countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    // Apply the same filters to count query
    if (params.categoryId) {
      countQuery = countQuery.eq("category_id", params.categoryId);
    }

    if (params.categorySlug) {
      countQuery = countQuery.eq("categories.slug", params.categorySlug);
    }

    if (params.minPrice !== undefined) {
      countQuery = countQuery.gte("base_price", params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      countQuery = countQuery.lte("base_price", params.maxPrice);
    }

    if (params.featured) {
      countQuery = countQuery.eq("featured", true);
    }

    if (params.inStock) {
      countQuery = countQuery.contains("availability", { inStock: true });
    }

    // Apply search to count query
    if (params.search) {
      const searchTerm = params.search.trim();
      if (searchTerm) {
        countQuery = countQuery.or(
          `name_cs.ilike.*${searchTerm}*,name_en.ilike.*${searchTerm}*,description_cs.ilike.*${searchTerm}*,description_en.ilike.*${searchTerm}*`
        );
      }
    }

    const { count: totalCount } = await countQuery;
    const total = totalCount || 0;
    const totalPages = Math.ceil(total / (params.limit || 12));

    const response: ApiResponse<Product[]> = {
      success: true,
      data: products,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 12,
        total,
        totalPages,
      },
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
