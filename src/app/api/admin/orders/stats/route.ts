import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { orderUtils, userUtils } from "@/lib/supabase/utils";

/**
 * Get order statistics (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    const isAdmin = await userUtils.isAdmin(user.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient permissions",
        },
        { status: 403 }
      );
    }

    // Get order statistics
    const { data: stats, error } = await orderUtils.getOrderStats();

    if (error) {
      console.error("Error fetching order stats:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při načítání statistik",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/orders/stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
}
