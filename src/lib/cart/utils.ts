import type { Customization, CustomizationOption } from "@/types/product";

/**
 * Generate a unique session ID for guest cart management
 * Uses crypto.randomUUID if available, falls back to timestamp + random
 */
export function generateCartSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
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
  type: "add" | "update" | "remove";
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: "high" | "medium" | "low";
}

/**
 * Store cart operations for offline sync with enhanced metadata
 */
export function storeOfflineOperation(
  operation: Omit<OfflineOperation, "id" | "retryCount">
): void {
  if (typeof window === "undefined") return;

  try {
    const existing = localStorage.getItem("cart_offline_operations_v2");
    const operations: OfflineOperation[] = existing ? JSON.parse(existing) : [];

    const enhancedOperation: OfflineOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
    };

    operations.push(enhancedOperation);
    localStorage.setItem("cart_offline_operations_v2", JSON.stringify(operations));
  } catch (error) {
    console.warn("Failed to store offline operation:", error);
  }
}

/**
 * Get offline operations without clearing (for retry logic)
 */
export function getOfflineOperations(): OfflineOperation[] {
  if (typeof window === "undefined") return [];

  try {
    const operations = localStorage.getItem("cart_offline_operations_v2");
    return operations ? JSON.parse(operations) : [];
  } catch (error) {
    console.warn("Failed to get offline operations:", error);
    return [];
  }
}

/**
 * Remove specific offline operation after successful sync
 */
export function removeOfflineOperation(operationId: string): void {
  if (typeof window === "undefined") return;

  try {
    const operations = getOfflineOperations();
    const filtered = operations.filter((op) => op.id !== operationId);
    localStorage.setItem("cart_offline_operations_v2", JSON.stringify(filtered));
  } catch (error) {
    console.warn("Failed to remove offline operation:", error);
  }
}

/**
 * Update retry count for failed operation
 */
export function updateOfflineOperationRetry(operationId: string): void {
  if (typeof window === "undefined") return;

  try {
    const operations = getOfflineOperations();
    const updated = operations.map((op) =>
      op.id === operationId ? { ...op, retryCount: op.retryCount + 1 } : op
    );
    localStorage.setItem("cart_offline_operations_v2", JSON.stringify(updated));
  } catch (error) {
    console.warn("Failed to update offline operation retry count:", error);
  }
}

/**
 * Clear all offline operations (use with caution)
 */
export function clearOfflineOperations(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("cart_offline_operations_v2");
  } catch (error) {
    console.warn("Failed to clear offline operations:", error);
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
      results.errors.push(
        `Operation ${operation.id} failed: ${error instanceof Error ? error.message : String(error)}`
      );
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
      case "add":
        response = await fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(operation.data),
        });
        break;

      case "update":
        response = await fetch(`/api/cart/items/${operation.data.itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ quantity: operation.data.quantity }),
        });
        break;

      case "remove":
        response = await fetch(`/api/cart/items/${operation.data.itemId}`, {
          method: "DELETE",
          credentials: "include",
        });
        break;

      default:
        return false;
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Failed to execute offline operation:", error);
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

/**
 * Formats customization data for display in cart
 */
export function formatCustomizationForDisplay(
  customization: Customization,
  customizationOptions: CustomizationOption[],
  locale: string = "en"
): string | null {
  const option = customizationOptions.find((opt) => opt.id === customization.optionId);
  if (!option) return null;

  const optionName =
    typeof option.name === "string"
      ? option.name
      : (option.name as any)[locale] || (option.name as any).en || (option.name as any).cs;

  // Handle custom text input (like ribbon text)
  if (customization.customValue) {
    return `${optionName}: ${customization.customValue}`;
  }

  // Handle choice selections
  if (customization.choiceIds && customization.choiceIds.length > 0) {
    const selectedChoices = customization.choiceIds
      .map((choiceId) => {
        const choice = option.choices.find((c) => c.id === choiceId);
        return choice
          ? typeof choice.label === "string"
            ? choice.label
            : (choice.label as any)[locale] || (choice.label as any).en || (choice.label as any).cs
          : null;
      })
      .filter(Boolean);

    if (selectedChoices.length > 0) {
      return `${optionName}: ${selectedChoices.join(", ")}`;
    }
  }

  return null;
}

/**
 * Validates that conditional customizations are properly configured
 */
export function validateConditionalCustomizations(
  customizations: Customization[],
  customizationOptions: CustomizationOption[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const customization of customizations) {
    const option = customizationOptions.find((opt) => opt.id === customization.optionId);
    if (!option) continue;

    // Check if this customization depends on another
    if (option.dependsOn) {
      const dependentCustomization = customizations.find(
        (c) => c.optionId === option.dependsOn?.optionId
      );

      if (!dependentCustomization) {
        errors.push(`Missing required dependency for ${option.id}`);
        continue;
      }

      // Check if the required choices are selected
      const hasRequiredChoices = option.dependsOn.requiredChoiceIds.some((requiredChoiceId) =>
        dependentCustomization.choiceIds.includes(requiredChoiceId)
      );

      if (!hasRequiredChoices) {
        errors.push(`Invalid dependency configuration for ${option.id}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Configuration lifecycle management utilities for wreath customizations
 */

/**
 * Validates customization data integrity
 * @param customizations - Array of customization objects
 * @returns Object with validation results and any issues found
 */
export function validateCustomizationIntegrity(customizations: any[]): {
  isValid: boolean;
  issues: string[];
  fixedCustomizations?: any[];
} {
  const issues: string[] = [];
  const fixedCustomizations: any[] = [];

  if (!Array.isArray(customizations)) {
    return {
      isValid: false,
      issues: ["Customizations must be an array"],
    };
  }

  for (const customization of customizations) {
    if (!customization || typeof customization !== "object") {
      issues.push("Invalid customization object found");
      continue;
    }

    const fixed = { ...customization };

    // Validate required fields
    if (!customization.optionId || typeof customization.optionId !== "string") {
      issues.push(`Missing or invalid optionId: ${customization.optionId}`);
    }

    if (!(customization.choiceIds && Array.isArray(customization.choiceIds))) {
      issues.push(`Missing or invalid choiceIds for option: ${customization.optionId}`);
      fixed.choiceIds = [];
    }

    // Validate price modifier
    if (
      customization.priceModifier !== undefined &&
      typeof customization.priceModifier !== "number"
    ) {
      issues.push(`Invalid priceModifier for option: ${customization.optionId}`);
      fixed.priceModifier = 0;
    }

    // Validate custom value if present
    if (customization.customValue !== undefined) {
      if (typeof customization.customValue !== "string") {
        issues.push(`Invalid customValue for option: ${customization.optionId}`);
        fixed.customValue = String(customization.customValue || "");
      } else if (customization.customValue.length > 100) {
        issues.push(`CustomValue too long for option: ${customization.optionId}`);
        fixed.customValue = customization.customValue.substring(0, 100);
        // Issue already added to issues array above
      }
    }

    fixedCustomizations.push(fixed);
  }

  return {
    isValid: issues.length === 0,
    issues,
    ...(issues.length > 0 && { fixedCustomizations }),
  };
}

/**
 * Transfers customizations from cart to order format
 * @param cartCustomizations - Customizations from cart_items
 * @returns Formatted customizations for order storage
 */
export function transferCustomizationsToOrder(cartCustomizations: any[]): any[] {
  if (!Array.isArray(cartCustomizations)) {
    return [];
  }

  return cartCustomizations.map((customization) => ({
    optionId: customization.optionId,
    choiceIds: customization.choiceIds || [],
    priceModifier: customization.priceModifier || 0,
    customValue: customization.customValue || undefined,
    // Add timestamp for order tracking
    transferredAt: new Date().toISOString(),
  }));
}

/**
 * Cleans up orphaned customization data
 * @param customizations - Array of customizations to clean
 * @returns Cleaned customizations array
 */
export function cleanupOrphanedCustomizations(customizations: any[]): any[] {
  if (!Array.isArray(customizations)) {
    return [];
  }

  return customizations.filter((customization) => {
    // Remove customizations without required fields
    if (!(customization?.optionId && customization?.choiceIds)) {
      return false;
    }

    // Remove empty choice arrays
    if (Array.isArray(customization.choiceIds) && customization.choiceIds.length === 0) {
      return false;
    }

    return true;
  });
}

/**
 * Validates wreath-specific customization requirements
 * @param customizations - Array of customizations
 * @returns Validation result with specific wreath requirements
 */
export function validateWreathCustomizations(customizations: any[]): {
  isValid: boolean;
  errors: string[];
  hasSizeSelection: boolean;
  hasValidRibbonConfig: boolean;
} {
  const errors: string[] = [];
  let hasSizeSelection = false;
  let hasValidRibbonConfig = true;
  let hasRibbon = false;

  for (const customization of customizations) {
    // Check for size selection (required for wreaths)
    if (customization.optionId === "size") {
      hasSizeSelection = customization.choiceIds && customization.choiceIds.length > 0;
      if (!hasSizeSelection) {
        errors.push("Size selection is required for wreaths");
      }
    }

    // Check for ribbon selection
    if (customization.optionId === "ribbon") {
      hasRibbon = customization.choiceIds?.includes("ribbon_yes");
    }
  }

  // If ribbon is selected, validate ribbon configuration
  if (hasRibbon) {
    const ribbonColor = customizations.find((c) => c.optionId === "ribbon_color");
    const ribbonText = customizations.find((c) => c.optionId === "ribbon_text");

    if (!ribbonColor?.choiceIds || ribbonColor.choiceIds.length === 0) {
      errors.push("Ribbon color selection is required when ribbon is selected");
      hasValidRibbonConfig = false;
    }

    if (!ribbonText?.choiceIds || ribbonText.choiceIds.length === 0) {
      errors.push("Ribbon text selection is required when ribbon is selected");
      hasValidRibbonConfig = false;
    }

    // Validate custom text if selected
    if (ribbonText?.choiceIds?.includes("text_custom")) {
      if (!ribbonText.customValue || ribbonText.customValue.trim().length === 0) {
        errors.push("Custom text is required when custom text option is selected");
        hasValidRibbonConfig = false;
      } else if (ribbonText.customValue.length > 50) {
        errors.push("Custom text cannot exceed 50 characters");
        hasValidRibbonConfig = false;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    hasSizeSelection,
    hasValidRibbonConfig,
  };
}

/**
 * Database integrity check functions for customization data
 */

/**
 * Performs comprehensive integrity checks on customization data in the database
 * @param supabaseClient - Supabase client instance
 * @returns Promise with integrity check results
 */
export async function performCustomizationIntegrityCheck(supabaseClient: any): Promise<{
  success: boolean;
  issues: Array<{
    type: "orphaned_customizations" | "invalid_format" | "missing_required" | "data_corruption";
    description: string;
    affectedItems: string[];
    severity: "low" | "medium" | "high";
  }>;
  fixedItems: string[];
  summary: {
    totalCartItems: number;
    itemsWithCustomizations: number;
    issuesFound: number;
    issuesFixed: number;
  };
}> {
  const issues: any[] = [];
  const fixedItems: string[] = [];
  let totalCartItems = 0;
  let itemsWithCustomizations = 0;

  try {
    // Get all cart items with customizations
    const { data: cartItems, error } = await supabaseClient
      .from("cart_items")
      .select("*")
      .not("customizations", "is", null);

    if (error) {
      throw new Error(`Failed to fetch cart items: ${error.message}`);
    }

    totalCartItems = cartItems?.length || 0;

    if (!cartItems || cartItems.length === 0) {
      return {
        success: true,
        issues: [],
        fixedItems: [],
        summary: {
          totalCartItems: 0,
          itemsWithCustomizations: 0,
          issuesFound: 0,
          issuesFixed: 0,
        },
      };
    }

    for (const item of cartItems) {
      if (
        item.customizations &&
        Array.isArray(item.customizations) &&
        item.customizations.length > 0
      ) {
        itemsWithCustomizations++;

        // Check for data format issues
        const validation = validateCustomizationIntegrity(item.customizations);
        if (!validation.isValid) {
          issues.push({
            type: "invalid_format",
            description: `Cart item ${item.id} has invalid customization format`,
            affectedItems: [item.id],
            severity: "medium",
            details: validation.issues,
          });

          // Attempt to fix if possible
          if (validation.fixedCustomizations) {
            try {
              const { error: updateError } = await supabaseClient
                .from("cart_items")
                .update({ customizations: validation.fixedCustomizations })
                .eq("id", item.id);

              if (!updateError) {
                fixedItems.push(item.id);
              }
            } catch (fixError) {
              console.error(`Failed to fix customizations for item ${item.id}:`, fixError);
            }
          }
        }

        // Check for orphaned customizations (references to non-existent products)
        if (item.product_id) {
          const { data: product, error: productError } = await supabaseClient
            .from("products")
            .select("customization_options")
            .eq("id", item.product_id)
            .single();

          if (productError || !product) {
            issues.push({
              type: "orphaned_customizations",
              description: `Cart item ${item.id} references non-existent product ${item.product_id}`,
              affectedItems: [item.id],
              severity: "high",
            });
          } else if (product.customization_options) {
            // Validate customizations against product options
            const validOptionIds = product.customization_options.map((opt: any) => opt.id);
            const invalidCustomizations = item.customizations.filter(
              (custom: any) => !validOptionIds.includes(custom.optionId)
            );

            if (invalidCustomizations.length > 0) {
              issues.push({
                type: "data_corruption",
                description: `Cart item ${item.id} has customizations for non-existent product options`,
                affectedItems: [item.id],
                severity: "medium",
                details: invalidCustomizations.map((c: any) => c.optionId),
              });
            }
          }
        }

        // Check for wreath-specific requirements
        if (item.product_id) {
          const wreathValidation = validateWreathCustomizations(item.customizations);
          if (!wreathValidation.isValid) {
            issues.push({
              type: "missing_required",
              description: `Cart item ${item.id} has incomplete wreath customizations`,
              affectedItems: [item.id],
              severity: "low",
              details: wreathValidation.errors,
            });
          }
        }
      }
    }

    return {
      success: true,
      issues,
      fixedItems,
      summary: {
        totalCartItems,
        itemsWithCustomizations,
        issuesFound: issues.length,
        issuesFixed: fixedItems.length,
      },
    };
  } catch (error) {
    console.error("Customization integrity check failed:", error);
    return {
      success: false,
      issues: [
        {
          type: "data_corruption",
          description: `Integrity check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          affectedItems: [],
          severity: "high",
        },
      ],
      fixedItems: [],
      summary: {
        totalCartItems: 0,
        itemsWithCustomizations: 0,
        issuesFound: 1,
        issuesFixed: 0,
      },
    };
  }
}

/**
 * Cleans up abandoned customization data older than specified days
 * @param supabaseClient - Supabase client instance
 * @param daysOld - Number of days to consider data abandoned (default: 7)
 * @returns Promise with cleanup results
 */
export async function cleanupAbandonedCustomizations(
  supabaseClient: any,
  daysOld: number = 7
): Promise<{
  success: boolean;
  cleanedItems: number;
  customizationsRemoved: number;
  error?: string;
}> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Get abandoned cart items with customizations
    const { data: abandonedItems, error: fetchError } = await supabaseClient
      .from("cart_items")
      .select("*")
      .lt("created_at", cutoffDate.toISOString())
      .is("user_id", null) // Only anonymous carts
      .not("customizations", "is", null);

    if (fetchError) {
      throw new Error(`Failed to fetch abandoned items: ${fetchError.message}`);
    }

    if (!abandonedItems || abandonedItems.length === 0) {
      return {
        success: true,
        cleanedItems: 0,
        customizationsRemoved: 0,
      };
    }

    // Count customizations before deletion
    const customizationsRemoved = abandonedItems.reduce((count: number, item: any) => {
      return count + (Array.isArray(item.customizations) ? item.customizations.length : 0);
    }, 0);

    // Log cleanup operation
    console.log(
      `Cleaning up ${abandonedItems.length} abandoned cart items with ${customizationsRemoved} customizations older than ${daysOld} days`
    );

    // Delete abandoned cart items (customizations are deleted automatically)
    const { error: deleteError } = await supabaseClient
      .from("cart_items")
      .delete()
      .in(
        "id",
        abandonedItems.map((item: any) => item.id)
      );

    if (deleteError) {
      throw new Error(`Failed to delete abandoned items: ${deleteError.message}`);
    }

    console.log(`Successfully cleaned up ${abandonedItems.length} abandoned cart items`);

    return {
      success: true,
      cleanedItems: abandonedItems.length,
      customizationsRemoved,
    };
  } catch (error) {
    console.error("Abandoned customization cleanup failed:", error);
    return {
      success: false,
      cleanedItems: 0,
      customizationsRemoved: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Calculates total price modifier from customizations
 */
export function calculateCustomizationPriceModifier(customizations: Customization[]): number {
  return customizations.reduce((total, customization) => {
    return total + (customization.priceModifier || 0);
  }, 0);
}
