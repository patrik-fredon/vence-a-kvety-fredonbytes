import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth, logAdminAction } from "@/lib/auth/admin-middleware";
import { adminUtils } from "@/lib/supabase/utils";

/**
 * Update product (Admin only)
 */
export const PUT = withAdminAuth(
  async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: productId } = await params;
      const updates = await request.json();

      // Get current product for logging
      const { data: currentProduct } = await adminUtils.getAllProducts({ limit: 1 });
      const oldProduct = currentProduct?.find((p) => p.id === productId);

      // Validate price if provided
      if (updates.base_price !== undefined && updates.base_price <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Cena musí být větší než 0",
          },
          { status: 400 }
        );
      }

      const { data: product, error } = await adminUtils.updateProduct(productId, updates);

      if (error) {
        console.error("Error updating product:", error);

        // Handle duplicate slug error
        if (error.code === "23505") {
          return NextResponse.json(
            {
              success: false,
              error: "Produkt s tímto URL slug již existuje",
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: "Chyba při aktualizaci produktu",
          },
          { status: 500 }
        );
      }

      // Log admin action
      await logAdminAction(admin.id, "UPDATE", "products", productId, oldProduct, product, request);

      return NextResponse.json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Error in PUT /api/admin/products/[id]:", error);
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

/**
 * Delete product (Admin only)
 */
export const DELETE = withAdminAuth(
  async (request: NextRequest, admin, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: productId } = await params;

      // Get current product for logging
      const { data: currentProducts } = await adminUtils.getAllProducts({ limit: 1000 });
      const productToDelete = currentProducts?.find((p) => p.id === productId);

      if (!productToDelete) {
        return NextResponse.json(
          {
            success: false,
            error: "Produkt nenalezen",
          },
          { status: 404 }
        );
      }

      const { error } = await adminUtils.deleteProduct(productId);

      if (error) {
        console.error("Error deleting product:", error);

        // Handle foreign key constraint error
        if (error.code === "23503") {
          return NextResponse.json(
            {
              success: false,
              error: "Nelze smazat produkt, který je součástí objednávek",
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: "Chyba při mazání produktu",
          },
          { status: 500 }
        );
      }

      // Log admin action
      await logAdminAction(
        admin.id,
        "DELETE",
        "products",
        productId,
        productToDelete,
        null,
        request
      );

      return NextResponse.json({
        success: true,
        message: "Produkt byl úspěšně smazán",
      });
    } catch (error) {
      console.error("Error in DELETE /api/admin/products/[id]:", error);
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
