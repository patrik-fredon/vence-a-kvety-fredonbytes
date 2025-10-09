import { type NextRequest, NextResponse } from "next/server";
import { sendOrderStatusUpdateEmail } from "@/lib/email/service";
import { createServerClient } from "@/lib/supabase/server";
import { orderUtils } from "@/lib/supabase/utils";
import type { Order, OrderStatus } from "@/types/order";

/**
 * Get order by ID
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

    // Convert database row to Order type
    const customerInfo = order.customer_info as any;
    const deliveryInfo = order.delivery_info as any;
    const paymentInfo = order.payment_info as any;
    const itemsData = order.items as any;

    // Build order response with delivery method (Requirement 9.6)
    const deliveryMethod = (order as any).delivery_method as "delivery" | "pickup" | null;
    const pickupLocation = (order as any).pickup_location as string | null;

    const orderResponse: Order = {
      id: order.id,
      orderNumber: customerInfo.orderNumber || order.id.slice(-8).toUpperCase(),
      userId: order.user_id || "",
      sessionId: customerInfo.sessionId || undefined,
      items: itemsData.items || [],
      itemCount: itemsData.itemCount || 0,
      subtotal: itemsData.subtotal || 0,
      deliveryCost: deliveryInfo.deliveryCost || 0,
      totalAmount: order.total_amount,
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        company: customerInfo.company,
        note: customerInfo.note,
      },
      deliveryInfo: {
        address: deliveryInfo.address,
        urgency: deliveryInfo.urgency,
        preferredDate: deliveryInfo.preferredDate
          ? new Date(deliveryInfo.preferredDate)
          : new Date(),
        preferredTimeSlot: deliveryInfo.preferredTimeSlot,
        specialInstructions: deliveryInfo.specialInstructions,
        recipientName: deliveryInfo.recipientName,
        recipientPhone: deliveryInfo.recipientPhone,
      },
      paymentInfo: {
        method: paymentInfo.method,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        status: paymentInfo.status,
        transactionId: paymentInfo.transactionId,
        processedAt: paymentInfo.processedAt ? new Date(paymentInfo.processedAt) : undefined,
        failureReason: paymentInfo.failureReason,
      },
      ...(deliveryMethod && { deliveryMethod }),
      ...(pickupLocation && { pickupLocation }),
      status: order.status as OrderStatus,
      notes: order.notes || "",
      internalNotes: order.notes || "",
      createdAt: new Date(order.created_at || new Date().toISOString()),
      updatedAt: new Date(order.updated_at || new Date().toISOString()),
    };

    return NextResponse.json({
      success: true,
      order: orderResponse,
    });
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
}

/**
 * Update order status (Admin only)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { id: orderId } = await params;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Check if user is admin (this would be implemented based on your auth system)
    // For now, we'll allow any authenticated user to update orders
    // In production, you'd check user roles/permissions

    const body = await request.json();
    const { status, internalNotes } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: "Status je povinný",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: OrderStatus[] = [
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
          error: "Neplatný status objednávky",
        },
        { status: 400 }
      );
    }

    // Get current order to check if status change is valid
    const { data: currentOrder, error: fetchError } = await orderUtils.getOrderById(orderId);

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        {
          success: false,
          error: "Objednávka nebyla nalezena",
        },
        { status: 404 }
      );
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await orderUtils.updateOrderStatus(
      orderId,
      status,
      internalNotes
    );

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při aktualizaci stavu objednávky",
        },
        { status: 500 }
      );
    }

    // Send email notification if status changed
    if (currentOrder.status !== status) {
      try {
        // Convert database row to Order type for email
        const customerInfo = updatedOrder.customer_info as any;
        const deliveryInfo = updatedOrder.delivery_info as any;
        const paymentInfo = updatedOrder.payment_info as any;
        const itemsData = updatedOrder.items as any;

        // Build order for email with delivery method
        const emailDeliveryMethod = (updatedOrder as any).delivery_method as
          | "delivery"
          | "pickup"
          | null;
        const emailPickupLocation = (updatedOrder as any).pickup_location as string | null;

        const orderForEmail: Order = {
          id: updatedOrder.id,
          orderNumber: customerInfo.orderNumber || updatedOrder.id.slice(-8).toUpperCase(),
          userId: updatedOrder.user_id || "",
          sessionId: customerInfo.sessionId,
          items: itemsData.items || [],
          itemCount: itemsData.itemCount || 0,
          subtotal: itemsData.subtotal || 0,
          deliveryCost: deliveryInfo.deliveryCost || 0,
          totalAmount: updatedOrder.total_amount,
          customerInfo: {
            firstName: customerInfo.firstName,
            lastName: customerInfo.lastName,
            email: customerInfo.email,
            phone: customerInfo.phone,
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            company: customerInfo.company,
            note: customerInfo.note,
          },
          deliveryInfo: {
            address: deliveryInfo.address,
            urgency: deliveryInfo.urgency,
            preferredDate: deliveryInfo.preferredDate
              ? new Date(deliveryInfo.preferredDate)
              : new Date(),
            preferredTimeSlot: deliveryInfo.preferredTimeSlot,
            specialInstructions: deliveryInfo.specialInstructions,
            recipientName: deliveryInfo.recipientName,
            recipientPhone: deliveryInfo.recipientPhone,
          },
          paymentInfo: {
            method: paymentInfo.method,
            amount: paymentInfo.amount,
            currency: paymentInfo.currency,
            status: paymentInfo.status,
            transactionId: paymentInfo.transactionId,
            processedAt: paymentInfo.processedAt ? new Date(paymentInfo.processedAt) : undefined,
            failureReason: paymentInfo.failureReason,
          },
          ...(emailDeliveryMethod && { deliveryMethod: emailDeliveryMethod }),
          ...(emailPickupLocation && { pickupLocation: emailPickupLocation }),
          status: updatedOrder.status as OrderStatus,
          notes: updatedOrder.notes || "",
          internalNotes: updatedOrder.notes || "",
          createdAt: new Date(updatedOrder.created_at || new Date().toISOString()),
          updatedAt: new Date(updatedOrder.updated_at || new Date().toISOString()),
        };

        // Send status update email
        await sendOrderStatusUpdateEmail(orderForEmail, status, "cs");
      } catch (emailError) {
        console.error("Error sending status update email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: "Stav objednávky byl úspěšně aktualizován",
    });
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
}
