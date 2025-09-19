import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { data: stats, error } = await adminUtils.getDashboardStats();

    if (error) {
      console.error("Error fetching dashboard stats:", error);
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
    console.error("Error in GET /api/admin/dashboard/stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
});
