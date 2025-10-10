"use client";

import { useEffect } from "react";

/**
 * Client component to clear cart after successful checkout
 * This runs once when the success page loads
 */
export function ClearCartOnSuccess() {
  useEffect(() => {
    const clearCart = async () => {
      try {
        const response = await fetch("/api/cart/clear", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          console.log("✅ Cart cleared successfully");
        } else {
          console.warn("⚠️ Failed to clear cart:", await response.text());
        }
      } catch (error) {
        console.error("❌ Error clearing cart:", error);
      }
    };

    clearCart();
  }, []);

  return null;
}
