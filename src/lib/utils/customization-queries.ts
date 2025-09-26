import { createClient } from "@/lib/supabase/server";
import type { CustomizationOption } from "@/types/product";

/**
 * Optimized database queries for customization data with caching
 */

/**
 * Get customization options for a product with caching
 */
export async function getProductCustomizationOptions(
  productId: string
): Promise<CustomizationOption[]> {
  // Import server-side cache utilities
  const { getCachedCustomizationOptions, setCachedCustomizationOptions } = await import('@/lib/cache/server-customization-cache');

  // Check Redis cache first
  const cached = await getCachedCustomizationOptions(productId);
  if (cached) {
    console.log(`✅ [CustomizationQuery] Using cached customization options for product:${productId}`);
    return cached;
  }

  console.log(`🔍 [CustomizationQuery] Fetching customization options from database for product:${productId}`);

  const supabase = createClient();

  // Optimized query with specific field selection
  const { data, error } = await supabase
    .from("products")
    .select("customization_options")
    .eq("id", productId)
    .single();

  if (error) {
    console.error("❌ [CustomizationQuery] Error fetching customization options:", error);
    return [];
  }

  const options = (data?.customization_options as CustomizationOption[]) || [];

  // Cache the result in Redis
  await setCachedCustomizationOptions(productId, options);

  console.log(`✅ [CustomizationQuery] Fetched and cached ${options.length} customization options for product:${productId}`);

  return options;
}

/**
 * Batch get customization options for multiple products
 */
export async function getBatchProductCustomizationOptions(
  productIds: string[]
): Promise<Record<string, CustomizationOption[]>> {
  // Import server-side cache utilities
  const { getCachedCustomizationOptions, batchCacheCustomizationOptions } = await import('@/lib/cache/server-customization-cache');

  const result: Record<string, CustomizationOption[]> = {};
  const uncachedIds: string[] = [];

  // Check Redis cache for each product
  for (const productId of productIds) {
    const cached = await getCachedCustomizationOptions(productId);
    if (cached) {
      result[productId] = cached;
    } else {
      uncachedIds.push(productId);
    }
  }

  // Fetch uncached products in batch
  if (uncachedIds.length > 0) {
    console.log(`🔍 [CustomizationQuery] Batch fetching ${uncachedIds.length} uncached products from database`);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, customization_options")
      .in("id", uncachedIds);

    if (error) {
      console.error("❌ [CustomizationQuery] Error fetching batch customization options:", error);
      // Return cached results even if batch fetch fails
      return result;
    }

    // Process batch results
    const productOptions: Array<{ productId: string; options: CustomizationOption[] }> = [];

    for (const product of data || []) {
      const options = (product.customization_options as CustomizationOption[]) || [];
      result[product.id] = options;
      productOptions.push({ productId: product.id, options });
    }

    // Batch cache all results
    if (productOptions.length > 0) {
      await batchCacheCustomizationOptions(productOptions);
    }

    console.log(`✅ [CustomizationQuery] Batch processed and cached ${productOptions.length} products`);
  }

  return result;
}

/**
 * Get frequently accessed customization options (e.g., for wreaths)
 * This can be used to pre-populate cache for common products
 */
export async function getFrequentCustomizationOptions(): Promise<void> {
  // Import server-side cache utilities
  const { batchCacheCustomizationOptions } = await import('@/lib/cache/server-customization-cache');
  
  const supabase = createClient();

  // Get wreath products (assuming they have 'wreath' in category or name)
  const { data, error } = await supabase
    .from("products")
    .select("id, customization_options")
    .or("category.ilike.%wreath%,name.ilike.%wreath%")
    .limit(20); // Limit to most common products

  if (error) {
    console.error("❌ [CustomizationQuery] Error pre-loading customization options:", error);
    return;
  }

  // Pre-populate Redis cache
  const productOptions: Array<{ productId: string; options: CustomizationOption[] }> = [];
  
  for (const product of data || []) {
    const options = (product.customization_options as CustomizationOption[]) || [];
    productOptions.push({ productId: product.id, options });
  }

  if (productOptions.length > 0) {
    await batchCacheCustomizationOptions(productOptions);
    console.log(`✅ [CustomizationQuery] Pre-loaded ${productOptions.length} frequent customization options to cache`);
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
