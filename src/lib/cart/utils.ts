import { randomUUID } from "crypto";

/**
 * Generate a unique session ID for guest cart management
 */
export function generateCartSessionId(): string {
  return randomUUID();
}

/**
 * Get cart session ID from cookies (client-side)
 */
export function getCartSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("cart-session="));

  return sessionCookie ? sessionCookie.split("=")[1] || null : null;
}

/**
 * Set cart session ID in cookies (client-side)
 */
export function setCartSessionId(sessionId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `cart-session=${sessionId}; max-age=${maxAge}; path=/; samesite=lax`;
}

/**
 * Clear cart session ID from cookies
 */
export function clearCartSessionId(): void {
  if (typeof window === "undefined") {
    return;
  }

  document.cookie = "cart-session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

/**
 * Merge guest cart with user cart after login
 */
export async function mergeGuestCartWithUserCart(userId: string): Promise<boolean> {
  try {
    const sessionId = getCartSessionId();
    if (!sessionId) {
      return true; // No guest cart to merge
    }

    const response = await fetch("/api/cart/merge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ sessionId, userId }),
    });

    if (response.ok) {
      clearCartSessionId();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error merging guest cart:", error);
    return false;
  }
}
