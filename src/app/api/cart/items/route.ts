import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createServerClient } from "@/lib/supabase/server";
import {
  validateCartOperation,
  createValidationErrorResponse,
  sanitizeCustomizations,
} from "@/lib/validation/api-validation";
import type { AddToCartRequest } from "@/types/cart";

/**
 * POST /api/cart/items - Add item to cart
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🛒 [API] POST /api/cart/items - Add to cart request received");

    const supabase = createServerClient();
    const session = await auth();
    const body: AddToCartRequest = await request.json();

    console.log("📋 [API] Request body:", {
      productId: body.productId,
      quantity: body.quantity,
      customizations: body.customizations?.length || 0,
    });

    // Sanitize customizations if present
    if (body.customizations) {
      body.customizations = sanitizeCustomizations(body.customizations);
    }

    // Get or create session ID for guest users
    let sessionId = request.cookies.get("cart-session")?.value;
    if (!(session?.user?.id || sessionId)) {
      sessionId = randomUUID();
    }

    // Get full product data for validation
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", body.productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
          code: 'PRODUCT_NOT_FOUND',
          userFriendlyMessage: "The requested product could not be found"
        },
        { status: 404 }
      );
    }

    // Get locale from request headers or default to 'cs'
    const locale = request.headers.get('accept-language')?.includes('en') ? 'en' : 'cs';

    // Comprehensive validation using the validation system
    const validationResult = validateCartOperation(
      body.productId,
      body.quantity,
      product,
      body.customizations
    );

    if (!validationResult.isValid) {
      console.log("❌ [API] Validation failed:", validationResult.errors);
      return createValidationErrorResponse(validationResult, "Cart operation validation failed");
    }

    // If validation has warnings, log them but proceed
    if (validationResult.warnings && validationResult.warnings.length > 0) {
      console.log("⚠️ [API] Validation warnings (proceeding):", validationResult.warnings);
    }

    // Check if item already exists in cart
    let query = supabase.from("cart_items").select("*").eq("product_id", body.productId);

    if (session?.user?.id) {
      query = query.eq("user_id", session.user.id);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data: existingItems } = await query;

    // Check if same product with same customizations exists
    const existingItem = existingItems?.find((item) => {
      const itemCustomizations = item.customizations || [];
      return JSON.stringify(itemCustomizations) === JSON.stringify(body.customizations);
    });

    let result;

    if (existingItem) {
      // Update existing item quantity and recalculate total price
      const newQuantity = existingItem.quantity + body.quantity;
      const unitPrice = Number.parseFloat(product.base_price.toString());
      const newTotalPrice = unitPrice * newQuantity;

      const { data, error } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          total_price: newTotalPrice,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating cart item:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update cart item",
            code: 'UPDATE_FAILED',
            retryable: true,
            userFriendlyMessage: "Failed to update cart, please try again"
          },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Calculate prices
      const unitPrice = Number.parseFloat(product.base_price.toString());
      const totalPrice = unitPrice * body.quantity;

      // Create new cart item
      const cartItemData = {
        user_id: session?.user?.id || null,
        session_id: session?.user?.id ? null : sessionId,
        product_id: body.productId,
        quantity: body.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        customizations: body.customizations as any,
      };

      const { data, error } = await supabase
        .from("cart_items")
        .insert(cartItemData)
        .select()
        .single();

      if (error) {
        console.error("💥 [API] Error adding cart item:", {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return NextResponse.json(
          {
            success: false,
            error: "Failed to add item to cart",
            code: 'INSERT_FAILED',
            retryable: true,
            userFriendlyMessage: "Failed to add item to cart, please try again"
          },
          { status: 500 }
        );
      }

      result = data;
    }

    console.log("✅ [API] Successfully added item to cart:", {
      itemId: result.id,
      productId: result.product_id,
      quantity: result.quantity,
      unitPrice: result.unit_price,
      totalPrice: result.total_price,
      hadWarnings: validationResult.warnings && validationResult.warnings.length > 0
    });

    // Set session cookie for guest users
    const response = NextResponse.json({
      success: true,
      item: {
        id: result.id,
        userId: result.user_id,
        sessionId: result.session_id,
        productId: result.product_id,
        quantity: result.quantity,
        customizations: result.customizations,
        createdAt: new Date(result.created_at),
        updatedAt: new Date(result.updated_at),
      },
      validation: {
        hadWarnings: validationResult.warnings && validationResult.warnings.length > 0,
        warnings: validationResult.warnings
      }
    });

    if (!session?.user?.id && sessionId) {
      console.log("🍪 [API] Setting cart-session cookie for guest user:", sessionId);
      response.cookies.set("cart-session", sessionId, {
        httpOnly: false, // Allow JavaScript access for client-side cart management
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("💥 [API] Add to cart API error:", error);
    
    // Enhanced error handling with user-friendly messages
    let errorMessage = "Internal server error";
    let userFriendlyMessage = "A system error occurred, please try again";
    let retryable = true;
    
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('connection')) {
        errorMessage = "Network error";
        userFriendlyMessage = "Connection error, please check your internet connection";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Request timeout";
        userFriendlyMessage = "Request timed out, please try again";
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        userFriendlyMessage,
        retryable
      },
      { status: 500 }
    );
  }
}
