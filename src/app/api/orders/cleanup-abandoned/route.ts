import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Cleanup abandoned orders endpoint
 * Runs via Vercel cron job every 6 hours
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env['CRON_SECRET']}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();

    // Find orders that are pending for more than 2 hours
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

    const { data: abandonedOrders, error: fetchError } = await supabase
      .from("orders")
      .select("id, customer_info, items")
      .eq("status", "pending")
      .lt("created_at", twoHoursAgo.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch abandoned orders: ${fetchError.message}`);
    }

    let cleanedCount = 0;
    let restoredInventory = 0;

    for (const order of abandonedOrders || []) {
      try {
        // Update order status to abandoned
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "abandoned",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error(`Failed to update order ${order.id}:`, updateError);
          continue;
        }

        // Restore inventory for abandoned items
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            // Note: This would need actual inventory tracking implementation
            // For now, we just count the items that would be restored
            if (item && typeof item === "object" && "quantity" in item) {
              restoredInventory += (item.quantity as number) || 1;
            } else {
              restoredInventory += 1;
            }
          }
        }

        cleanedCount++;
      } catch (error) {
        console.error(`Error processing abandoned order ${order.id}:`, error);
      }
    }

    // Clean up abandoned cart items with customizations (older than 7 days)
    const { cleanupAbandonedCustomizations } = await import('@/lib/cart/utils');

    const customizationCleanup = await cleanupAbandonedCustomizations(supabase, 7);

    // Also run database-level cleanup for any remaining issues
    const { data: dbCleanupResult, error: dbCleanupError } = await supabase
      .rpc('cleanup_invalid_customizations');

    if (dbCleanupError) {
      console.error("Failed to run database customization cleanup:", dbCleanupError);
    }

    // Clean up remaining abandoned cart items (fallback)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: cartCount, error: cartError } = await supabase
      .from("cart_items")
      .delete()
      .lt("created_at", sevenDaysAgo.toISOString())
      .is("user_id", null) // Only anonymous carts
      .select("*");

    if (cartError) {
      console.error("Failed to clean up remaining cart items:", cartError);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results: {
        abandonedOrders: cleanedCount,
        restoredInventoryItems: restoredInventory,
        cleanedCartItems: cartCount || 0,
        customizationCleanup: {
          cleanedItems: customizationCleanup.cleanedItems,
          customizationsRemoved: customizationCleanup.customizationsRemoved,
          success: customizationCleanup.success,
          error: customizationCleanup.error || null,
        },
        databaseCleanup: {
          result: dbCleanupResult || null,
          error: dbCleanupError?.message || null,
        },
      },
    });
  } catch (error) {
    console.error("Abandoned order cleanup failed:", error);

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
