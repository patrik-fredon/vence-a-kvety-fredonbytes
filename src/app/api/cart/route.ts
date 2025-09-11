import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { auth } from "@/lib/auth/config";
import { CartSummary, CartItemRow } from "@/types/cart";
import { Product } from "@/types/product";
import { calculateFinalPrice } from "@/lib/utils/price-calculator";

/**
 * GET /api/cart - Retrieve user's cart items
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const session = await auth();

    // Get session ID from cookies if user is not authenticated
    const sessionId = request.cookies.get("cart-session")?.value;

    if (!session?.user?.id && !sessionId) {
      return NextResponse.json({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
        },
      });
    }

    // Build query based on authentication status
    let query = supabase.from("cart_items").select(`
        *,
        products (
          id,
          name_cs,
          name_en,
          slug,
          base_price,
          images,
          customization_options,
          availability
        )
      `);

    if (session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data: cartItems, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cart items:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch cart items",
        },
        { status: 500 }
      );
    }

    // Transform and calculate prices
    const items =
      cartItems?.map((item: any) => {
        const product = item.products;
        const customizations = item.customizations || [];

        // Calculate unit price with customizations
        const unitPrice = calculateFinalPrice(
          product.base_price,
          customizations,
          product.customization_options || []
        );
        const totalPrice = unitPrice * item.quantity;

        return {
          id: item.id,
          userId: item.user_id,
          sessionId: item.session_id,
          productId: item.product_id,
          quantity: item.quantity,
          customizations,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          product: {
            id: product.id,
            nameCs: product.name_cs,
            nameEn: product.name_en,
            name: {
              cs: product.name_cs,
              en: product.name_en,
            },
            slug: product.slug,
            basePrice: product.base_price,
            images: product.images || [],
            customizationOptions: product.customization_options || [],
            availability: product.availability || {},
            seoMetadata: { title: { cs: "", en: "" }, description: { cs: "", en: "" } },
            active: true,
            featured: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Product,
          unitPrice,
          totalPrice,
        };
      }) || [];

    // Calculate cart summary
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const total = subtotal; // Add delivery costs, taxes, etc. later

    const cartSummary: CartSummary = {
      items,
      itemCount,
      subtotal,
      total,
    };

    return NextResponse.json({
      success: true,
      cart: cartSummary,
    });
  } catch (error) {
    console.error("Cart API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
