/**
 * GDPR Compliance utilities
 * Handles data export, deletion, and privacy rights
 */

import { createClient } from "@/lib/supabase/server";

export interface GDPRDataExport {
  user: {
    id: string;
    email: string;
    name: string | undefined;
    phone: string | undefined;
    createdAt: string;
    updatedAt: string;
  };
  orders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    customerInfo: any;
    deliveryInfo: any;
    items: any[];
    createdAt: string;
  }>;
  cartItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    customizations: any[];
    createdAt: string;
  }>;
  addresses: Array<{
    id: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }>;
  preferences: {
    language: string;
    currency: string;
    notifications: any;
  };
  activityLog: Array<{
    action: string;
    timestamp: string;
    details: any;
  }>;
}

export interface GDPRDeletionResult {
  success: boolean;
  deletedRecords: {
    user: boolean;
    orders: number;
    cartItems: number;
    addresses: number;
    activityLog: number;
  };
  errors: string[] | undefined;
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<GDPRDataExport | null> {
  try {
    const supabase = await createClient();

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user profile:", userError);
      return null;
    }

    // Get user orders
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);

    if (cartError) {
      console.error("Error fetching cart items:", cartError);
    }

    // Note: user_addresses and user_activity_log tables don't exist in current schema
    // These would need to be created if address and activity tracking is needed
    const addresses: any[] = [];
    const activityLog: any[] = [];

    // Compile export data
    const exportData: GDPRDataExport = {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name || undefined,
        phone: userProfile.phone || undefined,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      },
      orders:
        orders?.map((order) => ({
          id: order.id,
          status: order.status,
          totalAmount: order.total_amount,
          customerInfo: order.customer_info,
          deliveryInfo: order.delivery_info,
          items: Array.isArray(order.items) ? order.items : [],
          createdAt: order.created_at,
        })) || [],
      cartItems:
        cartItems?.map((item) => ({
          id: item.id,
          productId: item.product_id || "",
          quantity: item.quantity,
          customizations: Array.isArray(item.customizations) ? item.customizations : [],
          createdAt: item.created_at,
        })) || [],
      addresses: Array.isArray(userProfile.addresses) ? (userProfile.addresses as any[]) : [],
      preferences:
        typeof userProfile.preferences === "object" &&
        userProfile.preferences !== null &&
        !Array.isArray(userProfile.preferences)
          ? (userProfile.preferences as { language: string; currency: string; notifications: any })
          : { language: "cs", currency: "CZK", notifications: {} },
      activityLog:
        activityLog?.map((log) => ({
          action: log.action,
          timestamp: log.created_at,
          details: log.details,
        })) || [],
    };

    return exportData;
  } catch (error) {
    console.error("Error exporting user data:", error);
    return null;
  }
}

/**
 * Delete all user data for GDPR compliance
 */
export async function deleteUserData(userId: string): Promise<GDPRDeletionResult> {
  try {
    const supabase = await createClient();
    const errors: string[] = [];
    const deletedRecords = {
      user: false,
      orders: 0,
      cartItems: 0,
      addresses: 0,
      activityLog: 0,
    };

    // Delete cart items
    const { error: cartError, count: cartCount } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (cartError) {
      errors.push(`Failed to delete cart items: ${cartError.message}`);
    } else {
      deletedRecords.cartItems = cartCount || 0;
    }

    // Note: user_addresses and user_activity_log tables are not in the current schema
    // If these tables are needed, they should be added to the database schema
    // For now, we'll skip these deletions to avoid errors

    // Anonymize orders instead of deleting (for business records)
    const { data: orders, error: ordersSelectError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId);

    if (ordersSelectError) {
      errors.push(`Failed to fetch orders: ${ordersSelectError.message}`);
    } else if (orders) {
      const { error: ordersUpdateError, count: ordersCount } = await supabase
        .from("orders")
        .update({
          user_id: null,
          customer_info: {
            firstName: "[DELETED]",
            lastName: "[DELETED]",
            email: "[DELETED]",
            phone: "[DELETED]",
            company: null,
            note: null,
          },
        })
        .eq("user_id", userId);

      if (ordersUpdateError) {
        errors.push(`Failed to anonymize orders: ${ordersUpdateError.message}`);
      } else {
        deletedRecords.orders = ordersCount || 0;
      }
    }

    // Delete user profile
    const { error: userError } = await supabase.from("user_profiles").delete().eq("id", userId);

    if (userError) {
      errors.push(`Failed to delete user profile: ${userError.message}`);
    } else {
      deletedRecords.user = true;
    }

    // Delete from auth.users (this should be done last)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      errors.push(`Failed to delete auth user: ${authError.message}`);
    }

    return {
      success: errors.length === 0,
      deletedRecords,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Error deleting user data:", error);
    return {
      success: false,
      deletedRecords: {
        user: false,
        orders: 0,
        cartItems: 0,
        addresses: 0,
        activityLog: 0,
      },
      errors: [`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`],
    };
  }
}

/**
 * Log user activity for GDPR compliance
 */
export async function logUserActivity(
  userId: string,
  action: string,
  details?: any,
  ipAddress?: string
): Promise<void> {
  try {
    const supabase = await createClient();

    // Note: user_activity_log table is not in the current schema
    // Activity logging is disabled until the table is added to the database
    console.log("Activity log:", { userId, action, details, ipAddress });
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}

/**
 * Check if user has given consent for data processing
 */
export async function checkUserConsent(userId: string): Promise<{
  marketing: boolean;
  analytics: boolean;
  functional: boolean;
  lastUpdated: string;
}> {
  try {
    const supabase = await createClient();

    // Note: user_consent table is not in the current schema
    // Using default consent settings until the table is added
    return {
      marketing: false,
      analytics: false,
      functional: true, // Required for basic functionality
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error checking user consent:", error);
    return {
      marketing: false,
      analytics: false,
      functional: true,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Update user consent preferences
 */
export async function updateUserConsent(
  userId: string,
  consent: {
    marketing: boolean;
    analytics: boolean;
    functional: boolean;
  }
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Note: user_consent table is not in the current schema
    // Consent updates are logged but not persisted until the table is added
    console.log("Consent update:", { userId, consent });

    // Log consent change
    await logUserActivity(userId, "consent_updated", consent);

    return true;
  } catch (error) {
    console.error("Error updating user consent:", error);
    return false;
  }
}

/**
 * Generate GDPR-compliant privacy policy text
 */
export function generatePrivacyPolicyText(locale: "cs" | "en" = "cs"): string {
  const texts = {
    cs: `
# Zásady ochrany osobních údajů

## Správce osobních údajů
Ketingmar s.r.o., se sídlem [adresa], IČO: [IČO]

## Účel zpracování
Vaše osobní údaje zpracováváme za účelem:
- Plnění smlouvy o koupi věnců a květinových aranžmá
- Doručení objednaných produktů
- Komunikace ohledně objednávek
- Vedení účetnictví a daňové evidence

## Právní základ
Zpracování je založeno na:
- Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR)
- Oprávněném zájmu (čl. 6 odst. 1 písm. f) GDPR)
- Souhlasu (čl. 6 odst. 1 písm. a) GDPR)

## Doba uchovávání
Osobní údaje uchováváme po dobu nezbytnou pro splnění účelu zpracování, nejdéle však:
- Údaje o objednávkách: 10 let
- Marketingové údaje: do odvolání souhlasu
- Technické údaje: 2 roky

## Vaše práva
Máte právo na:
- Přístup k osobním údajům
- Opravu nepřesných údajů
- Výmaz údajů
- Omezení zpracování
- Přenositelnost údajů
- Námitku proti zpracování
`,
    en: `
# Privacy Policy

## Data Controller
Ketingmar s.r.o., registered office [address], Company ID: [ID]

## Purpose of Processing
We process your personal data for:
- Fulfilling contracts for wreath and floral arrangement purchases
- Delivering ordered products
- Communication regarding orders
- Accounting and tax records

## Legal Basis
Processing is based on:
- Contract performance (Art. 6(1)(b) GDPR)
- Legitimate interest (Art. 6(1)(f) GDPR)
- Consent (Art. 6(1)(a) GDPR)

## Retention Period
We retain personal data for the time necessary to fulfill the processing purpose, but no longer than:
- Order data: 10 years
- Marketing data: until consent withdrawal
- Technical data: 2 years

## Your Rights
You have the right to:
- Access personal data
- Rectify inaccurate data
- Erase data
- Restrict processing
- Data portability
- Object to processing
`,
  };

  return texts[locale];
}
