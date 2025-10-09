import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { logAdminAction, withAdminAuth } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

/**
 * Update product inventory (Admin only)
 */
export const PUT = withAdminAuth(
  async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: productId } = await params;
      const body = await request.json();
      const { stock_quantity, track_inventory } = body;

      // Get current product for logging
      const { data: currentProducts } = await adminUtils.getAllProducts({ limit: 1000 });
      const currentProduct = currentProducts?.find((p) => p.id === productId);

      // Update product availability using JSONB field
      const currentAvailability = (currentProduct?.availability as any) || {};
      const newAvailability = {
        ...currentAvailability,
        inStock: stock_quantity > 0,
        stockQuantity: stock_quantity,
        trackInventory: track_inventory ?? true,
      };

      const { error } = await adminUtils.updateProductAvailability(productId, newAvailability);

      if (error) {
        console.error("Error updating product inventory:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Chyba při aktualizaci zásob",
          },
          { status: 500 }
        );
      }

      // Log admin action
      await logAdminAction(
        admin.id,
        "UPDATE",
        "products",
        productId,
        {
          availability: currentProduct?.availability,
        },
        { availability: newAvailability },
        request
      );

      return NextResponse.json({
        success: true,
        message: "Zásoby byly úspěšně aktualizovány",
      });
    } catch (error) {
      console.error("Error in PUT /api/admin/products/[id]/inventory:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Chyba při zpracování požadavku",
        },
        { status: 500 }
      );
    }
  }
);
