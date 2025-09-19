import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, logAdminAction } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

/**
 * Acknowledge inventory alert (Admin only)
 */
export const POST = withAdminAuth(
  async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: alertId } = await params;

      const { error } = await adminUtils.acknowledgeAlert(alertId, admin.id);

      if (error) {
        console.error("Error acknowledging alert:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Chyba při potvrzování upozornění",
          },
          { status: 500 }
        );
      }

      // Log admin action
      await logAdminAction(
        admin.id,
        "UPDATE",
        "inventory_alerts",
        alertId,
        { acknowledged: false },
        { acknowledged: true, acknowledged_by: admin.id },
        request
      );

      return NextResponse.json({
        success: true,
        message: "Upozornění bylo potvrzeno",
      });
    } catch (error) {
      console.error("Error in POST /api/admin/inventory/alerts/[id]/acknowledge:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Interní chyba serveru",
        },
        { status: 500 }
      );
    }
  }
);
