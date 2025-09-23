import { createClient } from "@/lib/supabase/server";
import type { CustomizationOption } from "@/types/product";
import { customizationCache } from "@/lib/cache/customization-cache";

/**
 * Optimized database queries for customization data with caching
 */

/**
 * Get customization options for a product with caching
 */
export async function getProductCustomizationOptions(
  productId: string
): Promise<CustomizationOption[]> {
  // Check cache first
  const cached = customizationCache.get(productId);
  if (cached) {
    return cached;
  }

  const supabase = createClient();

  // Optimized query with specific field selection
  const { data, error } = await supabase
    .from("products")
    .select("customization_options")
    .eq("id", productId)
    .single();

  if (error) {
    console.error("Error fetching customization options:", error);
    return [];
  }

  const options = (data?.customization_options as CustomizationOption[]) || [];

  // Cache the result
  customizationCache.set(productId, options);

  return options;
}

/**
 * Batch get customization options for multiple products
 */
export async function getBatchProductCustomizationOptions(
  productIds: string[]
): Promise<Record<string, CustomizationOption[]>> {
  const result: Record<string, CustomizationOption[]> = {};
  const uncachedIds: string[] = [];

  // Check cache for each product
  for (const productId of productIds) {
    const cached = customizationCache.get(productId);
    if (cached) {
      result[productId] = cached;
    } else {
      uncachedIds.push(productId);
    }
  }

  // Fetch uncached products in batch
  if (uncachedIds.length > 0) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, customization_options")
      .in("id", uncachedIds);

    if (error) {
      console.error("Error fetching batch customization options:", error);
      // Return cached results even if batch fetch fails
      return result;
    }

    // Process batch results
    for (const product of data || []) {
      const options = (product.customization_options as CustomizationOption[]) || [];
      result[product.id] = options;

      // Cache each result
      customizationCache.set(product.id, options);
    }
  }

  return result;
}

/**
 * Get frequently accessed customization options (e.g., for wreaths)
 * This can be used to pre-populate cache for common products
 */
export async function getFrequentCustomizationOptions(): Promise<void> {
  const supabase = createClient();

  // Get wreath products (assuming they have 'wreath' in category or name)
  const { data, error } = await supabase
    .from("products")
    .select("id, customization_options")
    .or("category.ilike.%wreath%,name.ilike.%wreath%")
    .limit(20); // Limit to most common products

  if (error) {
    console.error("Error pre-loading customization options:", error);
    return;
  }

  // Pre-populate cache
  for (const product of data || []) {
    const options = (product.customization_options as CustomizationOption[]) || [];
    customizationCache.set(product.id, options);
  }
}

/**
 * Optimized query for cart customization data
 */
export async function getCartCustomizationData(userId: string) {
  const supabase = createClient();

  // Use index-optimized query
  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      product_id,
      customizations,
      products!inner(
        id,
        customization_options
      )
    `)
    .eq("user_id", userId)
    .not("customizations", "is", null);

  if (error) {
    console.error("Error fetching cart customization data:", error);
    return [];
  }

  return data || [];
}

/**
 * Optimized query for order customization data
 */
export async function getOrderCustomizationData(orderId: string) {
  const supabase = createClient();

  // Use specific field selection for better performance
  const { data, error } = await supabase
    .from("order_items")
    .select(`
      id,
      product_id,
      customizations,
      products!inner(
        id,
        name,
        customization_options
      )
    `)
    .eq("order_id", orderId)
    .not("customizations", "is", null);

  if (error) {
    console.error("Error fetching order customization data:", error);
    return [];
  }

  return data || [];
}
