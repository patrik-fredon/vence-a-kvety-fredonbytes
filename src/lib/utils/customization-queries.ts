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

  // Proper JSON type casting with validation using bracket notation
  let options: CustomizationOption[] = [];
  try {
    if (data?.customization_options && typeof data.customization_options === 'object') {
      // Handle both array and object cases with bracket notation
      if (Array.isArray(data.customization_options)) {
        options = data.customization_options as unknown as CustomizationOption[];
      } else {
        // If it's an object, try to extract array from it using bracket notation
        const optionsData = data.customization_options as Record<string, any>;
        if (optionsData && Array.isArray(optionsData['options'])) {
          options = optionsData['options'] as unknown as CustomizationOption[];
        }
      }
    }
  } catch (parseError) {
    console.error("❌ [CustomizationQuery] Error parsing customization options:", parseError);
    options = [];
  }

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

    // Process batch results with proper JSON type casting using bracket notation
    const productOptions: Array<{ productId: string; options: CustomizationOption[] }> = [];

    for (const product of data || []) {
      let options: CustomizationOption[] = [];
      
      try {
        if (product.customization_options && typeof product.customization_options === 'object') {
          // Handle both array and object cases with bracket notation
          if (Array.isArray(product.customization_options)) {
            options = product.customization_options as unknown as CustomizationOption[];
          } else {
            // If it's an object, try to extract array from it using bracket notation
            const optionsData = product.customization_options as Record<string, any>;
            if (optionsData && Array.isArray(optionsData['options'])) {
              options = optionsData['options'] as unknown as CustomizationOption[];
            }
          }
        }
      } catch (parseError) {
        console.error(`❌ [CustomizationQuery] Error parsing customization options for product ${product.id}:`, parseError);
        options = [];
      }

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
    .or("category_id.in.(select id from categories where name_cs ilike '%věnec%' or name_en ilike '%wreath%'),name_cs.ilike.%věnec%,name_en.ilike.%wreath%")
    .limit(20); // Limit to most common products

  if (error) {
    console.error("❌ [CustomizationQuery] Error pre-loading customization options:", error);
    return;
  }

  // Pre-populate Redis cache with proper JSON type casting using bracket notation
  const productOptions: Array<{ productId: string; options: CustomizationOption[] }> = [];
  
  for (const product of data || []) {
    let options: CustomizationOption[] = [];
    
    try {
      if (product.customization_options && typeof product.customization_options === 'object') {
        // Handle both array and object cases with bracket notation
        if (Array.isArray(product.customization_options)) {
          options = product.customization_options as unknown as CustomizationOption[];
        } else {
          // If it's an object, try to extract array from it using bracket notation
          const optionsData = product.customization_options as Record<string, any>;
          if (optionsData && Array.isArray(optionsData['options'])) {
            options = optionsData['options'] as unknown as CustomizationOption[];
          }
        }
      }
    } catch (parseError) {
      console.error(`❌ [CustomizationQuery] Error parsing customization options for product ${product.id}:`, parseError);
      options = [];
    }

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

  // Get order with items JSON field since there's no separate order_items table
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, items")
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order customization data:", error);
    return [];
  }

  if (!order?.items) {
    return [];
  }

  // Parse the items JSON field and extract customization data using bracket notation
  try {
    let orderItems: any[] = [];
    
    if (Array.isArray(order.items)) {
      orderItems = order.items;
    } else if (typeof order.items === 'object' && order.items !== null) {
      // Handle case where items might be wrapped in an object using bracket notation
      const itemsData = order.items as Record<string, any>;
      if (Array.isArray(itemsData['items'])) {
        orderItems = itemsData['items'];
      }
    }

    // Filter items that have customizations and return relevant data
    const customizationData = orderItems
      .filter(item => item.customizations && Array.isArray(item.customizations) && item.customizations.length > 0)
      .map(item => ({
        id: item.id || `${orderId}-${item.product_id}`,
        product_id: item.product_id,
        customizations: item.customizations,
        // Note: Product details would need to be fetched separately if needed
        // since we don't have a direct join with the products table here
      }));

    return customizationData;
  } catch (parseError) {
    console.error("Error parsing order items JSON:", parseError);
    return [];
  }
}
