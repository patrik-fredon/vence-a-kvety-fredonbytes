/**
 * Product service with optimized queries and caching
 * Implements efficient database queries with proper indexing and Redis caching
 */

import {
  cacheProduct,
  cacheProductBySlug,
  cacheProductsList,
  getCachedProduct,
  getCachedProductBySlug,
  getCachedProductsList,
  invalidateProductCache,
} from "@/lib/cache/product-cache";
import { createClient } from "@/lib/supabase/server";
import { transformCategoryRow, transformProductRow } from "@/lib/utils/product-transforms";
import type { CategoryRow, Product, ProductRow } from "@/types/product";

/**
 * Product query filters
 */
export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  active?: boolean;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  locale?: string;
  page?: number;
  limit?: number;
  sortField?: "name" | "price" | "created_at" | "featured";
  sortDirection?: "asc" | "desc";
}

/**
 * Product query result with pagination
 */
export interface ProductQueryResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get product by ID with caching
 * Uses database index on products.id (primary key)
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    // Try cache first
    const cached = await getCachedProduct(productId);
    if (cached) {
      return cached;
    }

    // Query database with optimized select
    const supabase = createClient();
    const { data, error } = await supabase
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
      .eq("id", productId)
      .eq("active", true)
      .single();

    if (error || !data) {
      console.error("Error fetching product by ID:", error);
      return null;
    }

    // Transform and cache
    const category = data.categories ? transformCategoryRow(data.categories) : undefined;
    const product = transformProductRow(data, category);

    // Cache for future requests
    await cacheProduct(product);

    return product;
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
}

/**
 * Get product by slug with caching
 * Uses database index on products.slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    // Try cache first
    const cached = await getCachedProductBySlug(slug);
    if (cached) {
      return cached;
    }

    // Query database with optimized select
    const supabase = createClient();
    const { data, error } = await supabase
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
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (error || !data) {
      console.error("Error fetching product by slug:", error);
      return null;
    }

    // Transform and cache
    const category = data.categories ? transformCategoryRow(data.categories) : undefined;
    const product = transformProductRow(data, category);

    // Cache by both slug and ID
    await cacheProductBySlug(slug, product);
    await cacheProduct(product);

    return product;
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    return null;
  }
}

/**
 * Get products with filters and pagination
 * Uses database indexes on:
 * - products.active
 * - products.featured
 * - products.category_id
 * - products.slug
 */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductQueryResult> {
  try {
    const {
      categoryId,
      categorySlug,
      active = true,
      featured,
      minPrice,
      maxPrice,
      inStock,
      search,
      locale = "cs",
      page = 1,
      limit = 12,
      sortField = "created_at",
      sortDirection = "desc",
    } = filters;

    // Try cache first
    const cacheKey = {
      categoryId,
      categorySlug,
      active,
      featured,
      minPrice,
      maxPrice,
      inStock,
      search,
      locale,
      page,
      limit,
      sortField,
      sortDirection,
    };

    const cached = await getCachedProductsList(cacheKey);
    if (cached) {
      return {
        products: cached.products,
        pagination:
          cached.pagination &&
          "totalPages" in cached.pagination &&
          typeof cached.pagination.totalPages === "number"
            ? (cached.pagination as {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
              })
            : {
                page,
                limit,
                total: cached.products.length,
                totalPages: 1,
              },
      };
    }

    const supabase = createClient();

    // Build optimized query using indexed columns
    let query = supabase.from("products").select(
      `
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
      `,
      { count: "exact" }
    );

    // Apply filters using indexed columns
    if (active !== undefined) {
      query = query.eq("active", active); // Uses idx_products_active
    }

    if (categoryId) {
      query = query.eq("category_id", categoryId); // Uses idx_products_category_id
    }

    if (featured !== undefined) {
      query = query.eq("featured", featured); // Uses idx_products_featured
    }

    if (minPrice !== undefined) {
      query = query.gte("base_price", minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte("base_price", maxPrice);
    }

    if (inStock) {
      query = query.contains("availability", { inStock: true });
    }

    // Apply search using text search on indexed columns
    if (search) {
      const searchTerm = search.trim();
      if (searchTerm) {
        query = query.or(
          `name_cs.ilike.*${searchTerm}*,name_en.ilike.*${searchTerm}*,description_cs.ilike.*${searchTerm}*,description_en.ilike.*${searchTerm}*`
        );
      }
    }

    // Apply sorting
    const sortColumn =
      sortField === "name"
        ? locale === "en"
          ? "name_en"
          : "name_cs"
        : sortField === "price"
          ? "base_price"
          : sortField === "featured"
            ? "featured"
            : "created_at";

    query = query.order(sortColumn, { ascending: sortDirection === "asc" });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return {
        products: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // Transform results
    const products: Product[] = (data || []).map(
      (row: ProductRow & { categories?: CategoryRow | null }) => {
        const category = row.categories ? transformCategoryRow(row.categories) : undefined;
        return transformProductRow(row, category);
      }
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const result = {
      products,
      pagination: { page, limit, total, totalPages },
    };

    // Cache the result
    await cacheProductsList(cacheKey, products, result.pagination);

    return result;
  } catch (error) {
    console.error("Error in getProducts:", error);
    return {
      products: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Get featured products with caching
 * Uses database index on products.featured
 */
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  try {
    const result = await getProducts({
      featured: true,
      active: true,
      limit,
      sortField: "created_at",
      sortDirection: "desc",
    });

    return result.products;
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    return [];
  }
}

/**
 * Get products by category with caching
 * Uses database index on products.category_id
 */
export async function getProductsByCategory(
  categoryId: string,
  options: Partial<ProductFilters> = {}
): Promise<ProductQueryResult> {
  try {
    return await getProducts({
      ...options,
      categoryId,
      active: true,
    });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    return {
      products: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Search products with optimized text search
 */
export async function searchProducts(
  searchTerm: string,
  options: Partial<ProductFilters> = {}
): Promise<ProductQueryResult> {
  try {
    return await getProducts({
      ...options,
      search: searchTerm,
      active: true,
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return {
      products: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Batch get products by IDs with caching
 * Optimizes multiple product fetches
 */
export async function getProductsByIds(productIds: string[]): Promise<Product[]> {
  try {
    if (productIds.length === 0) {
      return [];
    }

    // Try to get from cache first
    const products: Product[] = [];
    const uncachedIds: string[] = [];

    for (const id of productIds) {
      const cached = await getCachedProduct(id);
      if (cached) {
        products.push(cached);
      } else {
        uncachedIds.push(id);
      }
    }

    // Fetch uncached products in a single query
    if (uncachedIds.length > 0) {
      const supabase = createClient();
      const { data, error } = await supabase
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
        .in("id", uncachedIds)
        .eq("active", true);

      if (!error && data) {
        for (const row of data) {
          const category = row.categories ? transformCategoryRow(row.categories) : undefined;
          const product = transformProductRow(row, category);
          products.push(product);

          // Cache for future requests
          await cacheProduct(product);
        }
      }
    }

    return products;
  } catch (error) {
    console.error("Error in getProductsByIds:", error);
    return [];
  }
}

/**
 * Invalidate product cache after updates
 */
export async function invalidateProduct(productId?: string): Promise<void> {
  try {
    await invalidateProductCache(productId);
  } catch (error) {
    console.error("Error invalidating product cache:", error);
  }
}

/**
 * Get product count by filters (for analytics)
 * Uses COUNT query which is optimized by indexes
 */
export async function getProductCount(filters: Partial<ProductFilters> = {}): Promise<number> {
  try {
    const supabase = createClient();
    let query = supabase.from("products").select("*", { count: "exact", head: true });

    if (filters.active !== undefined) {
      query = query.eq("active", filters.active);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.featured !== undefined) {
      query = query.eq("featured", filters.featured);
    }

    const { count } = await query;
    return count || 0;
  } catch (error) {
    console.error("Error in getProductCount:", error);
    return 0;
  }
}
