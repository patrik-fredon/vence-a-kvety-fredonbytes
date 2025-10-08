import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types/cart";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderItem,
  OrderStatus,
} from "@/types/order";

/**
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: CreateOrderRequest = await request.json();

    // Validate request body
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Objednávka musí obsahovat alespoň jednu položku",
        },
        { status: 400 }
      );
    }

    if (!(body.customerInfo && body.deliveryInfo && body.paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: "Chybí povinné informace o objednávce",
        },
        { status: 400 }
      );
    }

    if (!body.agreeToTerms) {
      return NextResponse.json(
        {
          success: false,
          error: "Musíte souhlasit s obchodními podmínkami",
        },
        { status: 400 }
      );
    }

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Calculate totals
    const subtotal = body.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    // Calculate delivery cost
    const deliveryCost = await calculateDeliveryCost(
      body.deliveryInfo.address,
      body.deliveryInfo.urgency,
      body.items
    );

    const totalAmount = subtotal + deliveryCost;
    const itemCount = body.items.reduce((sum, item) => sum + item.quantity, 0);

    // Convert cart items to order items
    const orderItems: OrderItem[] = body.items.map((item: CartItem) => {
      // Import customization utilities
      const {
        transferCustomizationsToOrder,
        validateCustomizationIntegrity,
      } = require("@/lib/cart/utils");

      // Validate and transfer customizations
      let processedCustomizations = item.customizations || [];

      if (processedCustomizations.length > 0) {
        // Validate customization integrity
        const validation = validateCustomizationIntegrity(processedCustomizations);

        if (!validation.isValid) {
          console.warn(
            `Customization validation issues for cart item ${item.id}:`,
            validation.issues
          );
          // Use fixed customizations if available
          if (validation.fixedCustomizations) {
            processedCustomizations = validation.fixedCustomizations;
          }
        }

        // Transfer customizations to order format
        processedCustomizations = transferCustomizationsToOrder(processedCustomizations);

        // Log customization transfer for audit trail
        console.log(`Transferring customizations for order item:`, {
          cartItemId: item.id,
          productId: item.productId,
          customizationCount: processedCustomizations.length,
          customizations: processedCustomizations,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.product?.name?.cs || "Unknown Product",
        productSlug: item.product?.slug || "",
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
        customizations: processedCustomizations,
        productSnapshot: item.product, // Store product snapshot at time of order
      };
    });

    // Create order data matching the database schema
    const orderData = {
      user_id: user?.id || null,
      customer_info: {
        ...body.customerInfo,
        orderNumber, // Include order number in customer info
        sessionId: user ? null : getSessionId(request),
      } as any,
      delivery_info: {
        ...body.deliveryInfo,
        deliveryCost,
        estimatedDeliveryDate: body.deliveryInfo.preferredDate,
      } as any,
      payment_info: {
        method: body.paymentMethod,
        amount: totalAmount,
        currency: "CZK",
        status: "pending",
      } as any,
      items: {
        items: orderItems,
        itemCount,
        subtotal,
        totalAmount,
      } as any,
      status: "pending",
      total_amount: totalAmount,
      notes: body.customerInfo.note || null,
    };

    // Insert order into database
    const { data: order, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při vytváření objednávky",
        },
        { status: 500 }
      );
    }

    // Generate payment URL for Stripe
    let paymentUrl: string | undefined;

    if (body.paymentMethod === "stripe") {
      paymentUrl = await createStripePaymentSession(order.id, totalAmount, body.customerInfo.email);
    }

    // Convert database row to Order type
    const customerInfo = order.customer_info as any;
    const deliveryInfo = order.delivery_info as any;
    const paymentInfo = order.payment_info as any;
    const itemsData = order.items as any;

    const createdOrder: Order = {
      id: order.id,
      orderNumber: customerInfo.orderNumber || orderNumber,
      userId: order.user_id || "",
      sessionId: customerInfo.sessionId,
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
      status: order.status as OrderStatus,
      notes: order.notes || "",
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
    };

    // Post-order cleanup: Remove cart items, customization cache, and clear Redis cache
    try {
      const { clearCartCache } = await import("@/lib/cache/cart-cache");

      // Get current user or session for cart cleanup
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const sessionId = getSessionId(request);

      // Find and clean up cart items that were converted to this order
      let cartQuery = supabase.from("cart_items").select("*");

      if (user?.id) {
        cartQuery = cartQuery.eq("user_id", user.id);
      } else if (sessionId) {
        cartQuery = cartQuery.eq("session_id", sessionId);
      }

      const { data: cartItems, error: cartFetchError } = await cartQuery;

      if (!cartFetchError && cartItems && cartItems.length > 0) {
        // Log customizations being cleaned up
        const customizationCount = cartItems.reduce((count, item) => {
          return count + (Array.isArray(item.customizations) ? item.customizations.length : 0);
        }, 0);

        console.log(
          `🧹 [Cleanup] Post-order cleanup: Removing ${cartItems.length} cart items with ${customizationCount} customizations for order ${order.id}`
        );

        // Delete cart items (this automatically removes associated customizations)
        const { error: deleteError } = await supabase
          .from("cart_items")
          .delete()
          .in(
            "id",
            cartItems.map((item) => item.id)
          );

        if (deleteError) {
          console.error("❌ [Cleanup] Error during post-order cart cleanup:", deleteError);
          // Don't fail the order creation if cleanup fails
        } else {
          console.log(
            `✅ [Cleanup] Successfully cleaned up cart items after order ${order.id} creation`
          );
        }

        // Clear Redis cache for the cart
        try {
          await clearCartCache(user?.id || null, sessionId);
          console.log(
            `🗄️ [Cleanup] Successfully cleared cart cache after order ${order.id} creation`
          );
        } catch (cacheError) {
          console.error("⚠️ [Cleanup] Error clearing cart cache (non-critical):", cacheError);
          // Don't fail the order creation if cache cleanup fails
        }
      }
    } catch (cleanupError) {
      console.error("❌ [Cleanup] Error during post-order cleanup:", cleanupError);
      // Don't fail the order creation if cleanup fails
    }

    // Send order confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/email/service");
      await sendOrderConfirmationEmail(createdOrder, "cs");
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    const response: CreateOrderResponse = {
      success: true,
      order: createdOrder,
      paymentUrl: paymentUrl || "",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in POST /api/orders:", error);
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
 * Get orders for current user
 */
export async function GET() {
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

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

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

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error in GET /api/orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Interní chyba serveru",
      },
      { status: 500 }
    );
  }
}

// Helper functions

function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WR${timestamp.slice(-6)}${random}`;
}

function getSessionId(request: NextRequest): string {
  // Get session ID from cookies or generate new one
  const sessionId = request.cookies.get("session_id")?.value;
  return sessionId || crypto.randomUUID();
}

async function calculateDeliveryCost(
  _address: any,
  urgency: string,
  _items: CartItem[]
): Promise<number> {
  try {
    // This would typically call the delivery estimation API
    // For now, return a simple calculation based on urgency
    const baseCost = 150; // Base delivery cost in CZK

    let urgencyMultiplier = 1;
    switch (urgency) {
      case "express":
        urgencyMultiplier = 1.5;
        break;
      case "same-day":
        urgencyMultiplier = 2.0;
        break;
      default:
        urgencyMultiplier = 1;
    }

    return Math.round(baseCost * urgencyMultiplier);
  } catch (error) {
    console.error("Error calculating delivery cost:", error);
    return 150; // Default cost
  }
}

async function createStripePaymentSession(
  orderId: string,
  amount: number,
  customerEmail: string
): Promise<string> {
  try {
    // Initialize payment through our payment API
    const baseUrl = process.env["NEXT_PUBLIC_BASE_URL"] || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/payments/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        amount,
        currency: "czk",
        customerEmail,
        customerName: customerEmail, // Will be updated with actual name
        paymentMethod: "stripe",
        locale: "cs",
      }),
    });

    const data = await response.json();

    if (data.success && data.data.clientSecret) {
      // Return checkout URL with client secret
      return `/cs/checkout/payment?orderId=${orderId}&clientSecret=${data.data.clientSecret}&method=stripe`;
    } else {
      throw new Error(data.error || "Failed to create Stripe payment session");
    }
  } catch (error) {
    console.error("Error creating Stripe payment session:", error);
    return `/cs/checkout/error?orderId=${orderId}&error=stripe_init_failed`;
  }
}
