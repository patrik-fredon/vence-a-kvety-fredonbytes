import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, logAdminAction } from "@/lib/auth/admin-middleware";
import { orderUtils } from "@/lib/supabase/utils";

/**
 * Update order status (Admin only)
 */
export const PUT = withAdminAuth(
  async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: orderId } = await params;
      const { status, internalNotes } = await request.json();

      // Validate status
      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: "Neplatný stav objednávky",
          },
          { status: 400 }
        );
      }

      // Get current order for logging
      const { data: currentOrder } = await orderUtils.getOrderById(orderId);

      const { data: order, error } = await orderUtils.updateOrderStatus(
        orderId,
        status,
        internalNotes
      );

      if (error) {
        console.error("Error updating order status:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Chyba při aktualizaci stavu objednávky",
          },
          { status: 500 }
        );
      }

      // Log admin action
      await logAdminAction(
        admin.id,
        "UPDATE",
        "orders",
        orderId,
        { status: currentOrder?.status, internal_notes: currentOrder?.internal_notes },
        { status, internal_notes: internalNotes },
        request
      );

      return NextResponse.json({
        success: true,
        order,
      });
    } catch (error) {
      console.error("Error in PUT /api/admin/orders/[id]/status:", error);
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
