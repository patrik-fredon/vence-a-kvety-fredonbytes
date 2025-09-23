import { type NextRequest, NextResponse } from "next/server";
import { logAdminAction, withAdminAuth } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

/**
 * Update product inventory (Admin only)
 */
export const PUT = withAdminAuth(
  async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: productId } = await params;
      const { stock_quantity, track_inventory } = await request.json();

      // Validate stock quantity
      if (stock_quantity < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Počet kusů nemůže být záporný",
          },
          { status: 400 }
        );
      }

      // Get current product for logging
      const { data: currentProducts } = await adminUtils.getAllProducts({ limit: 1000 });
      const currentProduct = currentProducts?.find((p) => p.id === productId);

      const { error } = await adminUtils.updateProductInventory(
        productId,
        stock_quantity,
        track_inventory ?? true
      );

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
          stock_quantity: currentProduct?.stock_quantity,
          track_inventory: currentProduct?.track_inventory,
        },
        { stock_quantity, track_inventory },
        request
      );

      return NextResponse.json({
        success: true,
        message: "Zásoby byly aktualizovány",
      });
    } catch (error) {
      console.error("Error in PUT /api/admin/products/[id]/inventory:", error);
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
