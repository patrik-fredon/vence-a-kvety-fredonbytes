import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

/**
 * Get admin activity log (Admin only)
 */
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    const { data: activities, error } = await adminUtils.getActivityLog(limit, offset);

    if (error) {
      console.error("Error fetching activity log:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při načítání aktivity",
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { data: allActivities } = await adminUtils.getActivityLog(1000, 0);

    return NextResponse.json({
      success: true,
      activities: activities || [],
      total: allActivities?.length || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
});
