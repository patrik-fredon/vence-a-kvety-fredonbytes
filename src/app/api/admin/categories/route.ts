import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

/**
 * Get all categories (Admin only)
 */
export const GET = withAdminAuth(async (request: NextRequest, admin) => {
  try {
    const { data: categories, error } = await adminUtils.getAllCategories();

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při načítání kategorií",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      categories: categories || [],
    });
  } catch (error) {
    console.error("Error in GET /api/admin/categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
});
