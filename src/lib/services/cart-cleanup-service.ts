/**
 * Cart Cleanup Service
 * Handles automated cleanup of abandoned carts from Redis and database
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { createClient } from "@supabase/supabase-js";
import { getCacheClient } from "@/lib/cache/redis";

// Initialize Supabase client with service role for cleanup operations
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!(supabaseUrl && supabaseServiceKey)) {
    throw new Error("Missing Supabase configuration for cart cleanup service");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Result of cart cleanup operation
 */
export interface CleanupResult {
  cartsDeleted: number;
  itemsDeleted: number;
  errors: string[];
  duration: number;
}

/**
 * Cart item from database
 */
interface CartItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
}

/**
 * Query old cart items from database
 */
async function queryOldCartItems(
  supabase: ReturnType<typeof createClient>,
  cutoffTime: string
): Promise<CartItem[] | null> {
  const { data: oldCartItems, error: queryError } = await supabase
    .from("cart_items")
    .select("id, user_id, session_id, created_at")
    .lt("created_at", cutoffTime)
    .order("created_at", { ascending: true });

  if (queryError) {
    const errorMsg = `Failed to query old cart items: ${queryError.message}`;
    console.error(`❌ [CartCleanup] ${errorMsg}`);
    return null;
  }

  if (!oldCartItems || oldCartItems.length === 0) {
    console.log("✅ [CartCleanup] No abandoned carts found");
    return null;
  }

  console.log(`📊 [CartCleanup] Found ${oldCartItems.length} old cart items to process`);
  return oldCartItems;
}

/**
 * Group cart items by user_id/session_id
 */
function groupCartItemsByIdentifier(items: CartItem[]): Map<string, CartItem[]> {
  const cartGroups = new Map<string, CartItem[]>();

  for (const item of items) {
    const cartKey = item.user_id || item.session_id || "anonymous";
    if (!cartGroups.has(cartKey)) {
      cartGroups.set(cartKey, []);
    }
    cartGroups.get(cartKey)?.push(item);
  }

  return cartGroups;
}

/**
 * Process each cart group for cleanup
 */
async function processCartGroups(
  supabase: ReturnType<typeof createClient>,
  cacheClient: ReturnType<typeof getCacheClient>,
  cartGroups: Map<string, CartItem[]>,
  result: CleanupResult
): Promise<void> {
  for (const [cartKey, items] of cartGroups.entries()) {
    try {
      const userId = items[0].user_id;
      const sessionId = items[0].session_id;

      // Check if cart is associated with a completed order
      const isAssociatedWithOrder = await checkCartAssociatedWithOrder(supabase, userId, sessionId);

      if (isAssociatedWithOrder) {
        console.log(`⏭️ [CartCleanup] Skipping cart ${cartKey} - associated with completed order`);
        continue;
      }

      // Delete cart items from database
      const itemIds = items.map((item) => item.id);
      const { error: deleteError } = await supabase.from("cart_items").delete().in("id", itemIds);

      if (deleteError) {
        const errorMsg = `Failed to delete cart items for ${cartKey}: ${deleteError.message}`;
        console.error(`❌ [CartCleanup] ${errorMsg}`);
        result.errors.push(errorMsg);
        continue;
      }

      // Clear cart cache from Redis
      try {
        await clearCartCacheFromRedis(cacheClient, userId, sessionId);
      } catch (cacheError) {
        const errorMsg = `Failed to clear cache for ${cartKey}: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`;
        console.warn(`⚠️ [CartCleanup] ${errorMsg}`);
        result.errors.push(errorMsg);
      }

      // Update statistics
      result.cartsDeleted++;
      result.itemsDeleted += items.length;

      console.log(
        `✅ [CartCleanup] Deleted cart ${cartKey} with ${items.length} items (age: ${calculateCartAge(items[0].created_at)})`
      );
    } catch (error) {
      const errorMsg = `Error processing cart ${cartKey}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`❌ [CartCleanup] ${errorMsg}`);
      result.errors.push(errorMsg);
    }
  }
}

/**
 * Clean up abandoned carts older than 24 hours
 * This function:
 * 1. Queries all cart items from database
 * 2. Checks cart age (> 24 hours)
 * 3. Verifies cart is not associated with completed order
 * 4. Deletes cart items from database
 * 5. Clears cart cache from Redis
 */
export async function cleanupAbandonedCarts(): Promise<CleanupResult> {
  const startTime = Date.now();
  const result: CleanupResult = {
    cartsDeleted: 0,
    itemsDeleted: 0,
    errors: [],
    duration: 0,
  };

  console.log("🧹 [CartCleanup] Starting abandoned cart cleanup");

  try {
    const supabase = getServiceRoleClient();
    const cacheClient = getCacheClient();

    // Calculate cutoff time (24 hours ago)
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log(`🕐 [CartCleanup] Cutoff time: ${cutoffTime}`);

    // Step 1: Query old cart items
    const oldCartItems = await queryOldCartItems(supabase, cutoffTime);
    if (!oldCartItems) {
      result.duration = Date.now() - startTime;
      return result;
    }

    // Step 2: Group cart items by user/session
    const cartGroups = groupCartItemsByIdentifier(oldCartItems);
    console.log(`🛒 [CartCleanup] Processing ${cartGroups.size} unique carts`);

    // Step 3: Process each cart
    await processCartGroups(supabase, cacheClient, cartGroups, result);

    result.duration = Date.now() - startTime;

    console.log("✅ [CartCleanup] Cleanup completed:", {
      cartsDeleted: result.cartsDeleted,
      itemsDeleted: result.itemsDeleted,
      errors: result.errors.length,
      duration: `${result.duration}ms`,
    });

    return result;
  } catch (error) {
    const errorMsg = `Unexpected error during cart cleanup: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`💥 [CartCleanup] ${errorMsg}`);
    result.errors.push(errorMsg);
    result.duration = Date.now() - startTime;
    return result;
  }
}

/**
 * Check if a cart is associated with a completed order
 * Returns true if the cart should be preserved
 */
async function checkCartAssociatedWithOrder(
  supabase: ReturnType<typeof createClient>,
  userId: string | null,
  sessionId: string | null
): Promise<boolean> {
  try {
    // Query orders table for completed orders with matching user_id or session_id
    let query = supabase
      .from("orders")
      .select("id")
      .in("status", ["confirmed", "processing", "shipped", "delivered"])
      .limit(1);

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      // Check if session_id is stored in customer_info or metadata
      query = query.or(`customer_info->session_id.eq.${sessionId}`);
    } else {
      // No user or session, cannot be associated with order
      return false;
    }

    const { data, error } = await query;

    if (error) {
      console.warn(
        `⚠️ [CartCleanup] Error checking order association: ${error.message}, assuming not associated`
      );
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.warn(
      `⚠️ [CartCleanup] Error checking order association: ${error instanceof Error ? error.message : String(error)}, assuming not associated`
    );
    return false;
  }
}

/**
 * Clear cart cache from Redis
 */
async function clearCartCacheFromRedis(
  _cacheClient: ReturnType<typeof getCacheClient>,
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  try {
    // Import cart cache utilities
    const { clearCartCache } = await import("@/lib/cache/cart-cache");

    // Clear cart configuration and price calculation caches
    await clearCartCache(userId, sessionId);

    console.log(
      `🗑️ [CartCleanup] Cleared Redis cache for ${userId ? `user:${userId}` : `session:${sessionId}`}`
    );
  } catch (error) {
    console.error(
      `❌ [CartCleanup] Failed to clear Redis cache: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Calculate cart age in human-readable format
 */
function calculateCartAge(createdAt: string): string {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
  const ageDays = Math.floor(ageHours / 24);

  if (ageDays > 0) {
    return `${ageDays} day${ageDays > 1 ? "s" : ""} ${ageHours % 24} hour${ageHours % 24 !== 1 ? "s" : ""}`;
  }
  return `${ageHours} hour${ageHours !== 1 ? "s" : ""}`;
}
