import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { orderUtils } from "@/lib/supabase/utils";
import type { OrderStatus } from "@/types/order";

interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  description: string;
}

/**
 * Get order history and status timeline
 */
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { id: orderId } = await params;

    // Get order with user validation for non-admin users
    const { data: order, error } = await orderUtils.getOrderById(
      orderId,
      user?.id // Only pass user ID if user is authenticated
    );

    if (error) {
      console.error("Error fetching order:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Objednávka nebyla nalezena",
        },
        { status: 404 }
      );
    }

    // Generate status history based on order timestamps
    const statusHistory: StatusHistoryItem[] = [];

    // Always add created status
    statusHistory.push({
      status: "pending",
      timestamp: order.created_at,
      description: "Objednávka byla vytvořena a čeká na zpracování",
    });

    // Generate status history based on current status
    if (order.status !== "pending") {
      statusHistory.push({
        status: "confirmed",
        timestamp: order.updated_at,
        description: "Objednávka byla potvrzena a přijata ke zpracování",
      });
    }

    // Add processing status if current status is processing or later
    if (["processing", "ready", "shipped", "delivered"].includes(order.status)) {
      statusHistory.push({
        status: "processing",
        timestamp: order.updated_at,
        description: "Objednávka se zpracovává a připravuje k odeslání",
      });
    }

    // Add shipped status if current status is shipped or delivered
    if (["shipped", "delivered"].includes(order.status)) {
      statusHistory.push({
        status: "shipped",
        timestamp: order.updated_at,
        description: "Objednávka byla odeslána a je na cestě",
      });
    }

    // Add delivered status if current status is delivered
    if (order.status === "delivered") {
      statusHistory.push({
        status: "delivered",
        timestamp: order.updated_at,
        description: "Objednávka byla úspěšně doručena",
      });
    }

    // Add cancelled status if current status is cancelled
    if (order.status === "cancelled") {
      statusHistory.push({
        status: "cancelled",
        timestamp: order.updated_at,
        description: "Objednávka byla zrušena",
      });
    }

    // Sort by timestamp
    statusHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Prepare order summary
    const customerInfo = order.customer_info as any;
    const orderSummary = {
      id: order.id,
      orderNumber: customerInfo.orderNumber || order.id.slice(-8).toUpperCase(),
      status: order.status as OrderStatus,
      totalAmount: order.total_amount,
      createdAt: order.created_at,
    };

    return NextResponse.json({
      success: true,
      order: orderSummary,
      statusHistory,
    });
  } catch (error) {
    console.error("Error in GET /api/orders/[id]/history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
}
