/**
 * Generate a unique session ID for guest cart management
 * Uses crypto.randomUUID if available, falls back to timestamp + random
 */
export function generateCartSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

/**
 * Enhanced offline operation interface
 */
export interface OfflineOperation {
  id: string;
  type: 'add' | 'update' | 'remove';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Store cart operations for offline sync with enhanced metadata
 */
export function storeOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'retryCount'>): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = localStorage.getItem('cart_offline_operations_v2');
    const operations: OfflineOperation[] = existing ? JSON.parse(existing) : [];

    const enhancedOperation: OfflineOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
    };

    operations.push(enhancedOperation);
    localStorage.setItem('cart_offline_operations_v2', JSON.stringify(operations));
  } catch (error) {
    console.warn('Failed to store offline operation:', error);
  }
}

/**
 * Get offline operations without clearing (for retry logic)
 */
export function getOfflineOperations(): OfflineOperation[] {
  if (typeof window === 'undefined') return [];

  try {
    const operations = localStorage.getItem('cart_offline_operations_v2');
    return operations ? JSON.parse(operations) : [];
  } catch (error) {
    console.warn('Failed to get offline operations:', error);
    return [];
  }
}

/**
 * Remove specific offline operation after successful sync
 */
export function removeOfflineOperation(operationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const operations = getOfflineOperations();
    const filtered = operations.filter(op => op.id !== operationId);
    localStorage.setItem('cart_offline_operations_v2', JSON.stringify(filtered));
  } catch (error) {
    console.warn('Failed to remove offline operation:', error);
  }
}

/**
 * Update retry count for failed operation
 */
export function updateOfflineOperationRetry(operationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const operations = getOfflineOperations();
    const updated = operations.map(op =>
      op.id === operationId
        ? { ...op, retryCount: op.retryCount + 1 }
        : op
    );
    localStorage.setItem('cart_offline_operations_v2', JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to update offline operation retry count:', error);
  }
}

/**
 * Clear all offline operations (use with caution)
 */
export function clearOfflineOperations(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('cart_offline_operations_v2');
  } catch (error) {
    console.warn('Failed to clear offline operations:', error);
  }
}

/**
 * Process offline operations with retry logic
 */
export async function processOfflineOperations(): Promise<{
  successful: number;
  failed: number;
  errors: string[];
}> {
  const operations = getOfflineOperations();
  const results = { successful: 0, failed: 0, errors: [] as string[] };

  for (const operation of operations) {
    if (operation.retryCount >= operation.maxRetries) {
      results.failed++;
      results.errors.push(`Operation ${operation.id} exceeded max retries`);
      removeOfflineOperation(operation.id);
      continue;
    }

    try {
      const success = await executeOfflineOperation(operation);
      if (success) {
        results.successful++;
        removeOfflineOperation(operation.id);
      } else {
        results.failed++;
        updateOfflineOperationRetry(operation.id);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Operation ${operation.id} failed: ${error instanceof Error ? error.message : String(error)}`);
      updateOfflineOperationRetry(operation.id);
    }
  }

  return results;
}

/**
 * Execute a single offline operation
 */
async function executeOfflineOperation(operation: OfflineOperation): Promise<boolean> {
  try {
    let response: Response;

    switch (operation.type) {
      case 'add':
        response = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(operation.data),
        });
        break;

      case 'update':
        response = await fetch(`/api/cart/items/${operation.data.itemId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ quantity: operation.data.quantity }),
        });
        break;

      case 'remove':
        response = await fetch(`/api/cart/items/${operation.data.itemId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        break;

      default:
        return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to execute offline operation:', error);
    return false;
  }
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: any[]): {
  itemCount: number;
  subtotal: number;
  total: number;
} {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  // Add delivery, taxes, etc. here in the future
  const total = subtotal;

  return { itemCount, subtotal, total };
}
