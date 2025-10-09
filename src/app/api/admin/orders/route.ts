import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { orderUtils, userUtils } from "@/lib/supabase/utils";
import type { OrderStatus } from "@/types/order";

/**
 * Get all orders (Admin only)
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const validStatuses: OrderStatus[] = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const status =
      statusParam && validStatuses.includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : null;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Get orders with filters
    const { data: orders, error } = await orderUtils.getAllOrders({
      ...(status && { status }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      limit,
      offset,
    });

    if (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při načítání objednávek",
        },
        { status: 500 }
      );
    }

    // Transform orders for admin view
    const transformedOrders = orders.map((order) => {
      const customerInfo = order.customer_info as Record<string, unknown>;
      const deliveryInfo = order.delivery_info as Record<string, unknown>;
      const paymentInfo = order.payment_info as Record<string, unknown>;
      const itemsData = order.items as Record<string, unknown>;

      return {
        id: order.id,
        orderNumber: customerInfo.orderNumber || order.id.slice(-8).toUpperCase(),
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        status: order.status,
        totalAmount: order.total_amount,
        itemCount: itemsData.itemCount || 0,
        paymentMethod: paymentInfo.method,
        paymentStatus: paymentInfo.status,
        deliveryAddress: `${(deliveryInfo.address as any).city}, ${(deliveryInfo.address as any).postalCode}`,
        preferredDate: deliveryInfo.preferredDate,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        confirmedAt: undefined,
        shippedAt: undefined,
        deliveredAt: undefined,
        cancelledAt: undefined,
        notes: order.notes,
        internalNotes: order.notes,
      };
    });

    return NextResponse.json({
      success: true,
      orders: transformedOrders,
      pagination: {
        limit,
        offset,
        total: transformedOrders.length,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/admin/orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
}
