import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  triggerManualCacheWarming,
  getCacheWarmingStats,
  warmUpCategoryCache
} from "@/lib/utils/cache-warming";
import { customizationCache } from "@/lib/cache/customization-cache";

/**
 * Admin API for managing customization cache
 */

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.role || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get cache statistics
    const stats = await getCacheWarmingStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Cache stats error:", error);
    return NextResponse.json(
      { error: "Failed to get cache statistics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.role || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, category } = body;

    switch (action) {
      case "warm":
        if (category) {
          await warmUpCategoryCache(category);
          return NextResponse.json({
            success: true,
            message: `Cache warmed for category: ${category}`,
          });
        } else {
          const result = await triggerManualCacheWarming();
          return NextResponse.json(result);
        }

      case "clear":
        if (category) {
          // Clear specific category cache (would need implementation)
          customizationCache.clearAll();
          return NextResponse.json({
            success: true,
            message: `Cache cleared for category: ${category}`,
          });
        } else {
          customizationCache.clearAll();
          return NextResponse.json({
            success: true,
            message: "All customization cache cleared",
          });
        }

      case "stats":
        const stats = getCacheWarmingStats();
        return NextResponse.json({
          success: true,
          stats,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error managing cache:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createClient();

    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.role || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Clear all customization cache
    customizationCache.clearAll();

    return NextResponse.json({
      success: true,
      message: "All customization cache cleared",
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
