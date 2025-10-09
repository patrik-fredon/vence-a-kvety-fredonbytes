import { supabase } from "./client";
import type { Database } from "./database.types";
import { supabaseAdmin } from "./server";

type Tables = Database["public"]["Tables"];
type Product = Tables["products"]["Row"];
type Category = Tables["categories"]["Row"];
type Order = Tables["orders"]["Row"];
type CartItem = Tables["cart_items"]["Row"];
type UserProfile = Tables["user_profiles"]["Row"];

// Product utilities
export const productUtils = {
  async getActiveProducts(categorySlug?: string, limit = 20, offset = 0) {
    let query = supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (categorySlug) {
      query = query.eq("categories.slug", categorySlug);
    }

    return query;
  },

  async getProductBySlug(slug: string) {
    return supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("slug", slug)
      .eq("active", true)
      .single();
  },

  async searchProducts(searchTerm: string, limit = 20) {
    return supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("active", true)
      .or(
        `name_cs.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,description_cs.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%`
      )
      .limit(limit);
  },

  async getFeaturedProducts(limit = 6) {
    return supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("active", true)
      .eq("featured", true)
      .limit(limit);
  },
};

// Category utilities
export const categoryUtils = {
  async getActiveCategories() {
    return supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
  },

  async getCategoryBySlug(slug: string) {
    return supabase.from("categories").select("*").eq("slug", slug).eq("active", true).single();
  },

  async getCategoryWithProducts(slug: string, limit = 20) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .single();

    if (categoryError || !category) {
      return { data: null, error: categoryError };
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", category.id)
      .eq("active", true)
      .limit(limit);

    return {
      data: { category, products },
      error: productsError,
    };
  },
};

// Cart utilities
export const cartUtils = {
  async getCartItems(userId?: string, sessionId?: string) {
    if (!(userId || sessionId)) {
      throw new Error("Either userId or sessionId must be provided");
    }

    let query = supabase.from("cart_items").select(`
        *,
        product:products(*)
      `);

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    return query;
  },

  async addToCart(
    productId: string,
    quantity: number,
    customizations: any[] = [],
    userId?: string,
    sessionId?: string
  ) {
    if (!(userId || sessionId)) {
      throw new Error("Either userId or sessionId must be provided");
    }

    // Check if item already exists
    let existingQuery = supabase.from("cart_items").select("*").eq("product_id", productId);

    if (userId) {
      existingQuery = existingQuery.eq("user_id", userId);
    } else if (sessionId) {
      existingQuery = existingQuery.eq("session_id", sessionId);
    }

    const { data: existing } = await existingQuery.single();

    if (existing) {
      // Update quantity
      return supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
          customizations,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insert new item - need to fetch product price first
      const { data: product } = await supabase
        .from("products")
        .select("base_price")
        .eq("id", productId)
        .single();

      const unitPrice = product?.base_price || 0;
      const totalPrice = unitPrice * quantity;

      return supabase.from("cart_items").insert({
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        customizations,
        user_id: userId || null,
        session_id: sessionId || null,
      });
    }
  },

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return supabase.from("cart_items").delete().eq("id", itemId);
    }

    return supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  },

  async removeFromCart(itemId: string) {
    return supabase.from("cart_items").delete().eq("id", itemId);
  },

  async clearCart(userId?: string, sessionId?: string) {
    if (!(userId || sessionId)) {
      throw new Error("Either userId or sessionId must be provided");
    }

    let query = supabase.from("cart_items").delete();

    if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    return query;
  },
};

// Order utilities
export const orderUtils = {
  async createOrder(orderData: Tables["orders"]["Insert"]) {
    return supabase.from("orders").insert(orderData).select().single();
  },

  async getOrderById(orderId: string, userId?: string) {
    let query = supabase.from("orders").select("*").eq("id", orderId);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    return query.single();
  },

  async getUserOrders(userId: string, limit = 20, offset = 0) {
    return supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
    internalNotes?: string
  ) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Note: The database doesn't have separate timestamp fields for status changes
    // (confirmed_at, shipped_at, delivered_at, cancelled_at)
    // Status changes are tracked via the updated_at field and status value

    if (internalNotes) {
      updateData.notes = internalNotes;
    }

    return supabaseAdmin.from("orders").update(updateData).eq("id", orderId).select().single();
  },

  async getOrderHistory(orderId: string) {
    // Get order
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { data: null, error };
    }

    // Build status history from available data
    // Note: Database doesn't have separate timestamp fields for each status change
    const statusHistory = [];

    if (order.created_at) {
      statusHistory.push({
        status: "pending",
        timestamp: order.created_at,
        description: "Objednávka byla vytvořena",
      });
    }

    // Generate status history based on current status
    // All status changes use updated_at since we don't have individual timestamp fields
    if (order.status && order.status !== "pending") {
      statusHistory.push({
        status: order.status,
        timestamp: order.updated_at || order.created_at || new Date().toISOString(),
        description: `Status změněn na: ${order.status}`,
      });
    }

    return { data: { order, statusHistory }, error: null };
  },

  async getAllOrders(filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo);
    }

    if (filters?.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    return query;
  },

  async getOrderStats() {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("status, total_amount, created_at");

    if (error) {
      return { data: null, error };
    }

    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      totalRevenue: orders
        .filter((o) => o.status && ["delivered", "shipped"].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0),
      todayOrders: orders.filter((o) => {
        const today = new Date().toISOString().split("T")[0]!;
        return o.created_at ? o.created_at.startsWith(today) : false;
      }).length,
    };

    return { data: stats, error: null };
  },
};

// User profile utilities
export const userUtils = {
  async getUserProfile(userId: string) {
    return supabase.from("user_profiles").select("*").eq("id", userId).single();
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    return supabase.from("user_profiles").update(updates).eq("id", userId);
  },

  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase.from("user_profiles").select("role").eq("id", userId).single();

    return data?.role === "admin" || data?.role === "super_admin";
  },

  async getUserRole(userId: string): Promise<"customer" | "admin" | "super_admin" | null> {
    const { data } = await supabase.from("user_profiles").select("role").eq("id", userId).single();

    const role = data?.role;
    if (role === "customer" || role === "admin" || role === "super_admin") {
      return role;
    }
    return null;
  },

  async setUserRole(userId: string, role: "customer" | "admin" | "super_admin") {
    return supabaseAdmin.from("user_profiles").update({ role }).eq("id", userId);
  },
};

// Delivery utilities
export const deliveryUtils = {
  async getAvailableDeliveryDates(startDate: string, endDate: string) {
    return supabase.rpc("get_available_delivery_dates", {
      start_date: startDate,
      end_date: endDate,
    });
  },

  async calculateDeliveryyCost(deliveryAddress: any, items: any[], deliveryDate: string) {
    return supabase.rpc("calculate_delivery_cost", {
      delivery_address: deliveryAddress,
      items,
      delivery_date: deliveryDate,
    });
  },
};

// Error handling utility
export const handleSupabaseError = (error: any) => {
  console.error("Supabase error:", error);

  if (error?.code === "PGRST116") {
    return { message: "Resource not found", code: "NOT_FOUND" };
  }

  if (error?.code === "23505") {
    return { message: "Resource already exists", code: "DUPLICATE" };
  }

  if (error?.code === "23503") {
    return { message: "Invalid reference", code: "INVALID_REFERENCE" };
  }

  return {
    message: error?.message || "An unexpected error occurred",
    code: error?.code || "UNKNOWN_ERROR",
  };
};

// Admin utilities
export const adminUtils = {
  async getDashboardStats() {
    return supabaseAdmin.rpc("get_admin_dashboard_stats");
  },

  async getActivityLog(limit = 50, offset = 0) {
    return supabaseAdmin
      .from("admin_activity_log")
      .select(`
        *,
        admin:user_profiles!admin_id(name, email)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
  },

  async getInventoryAlerts(isActive = true) {
    return supabaseAdmin
      .from("inventory_alerts")
      .select(`
        *,
        product:products(name_cs, name_en, slug)
      `)
      .eq("is_active", isActive)
      .order("created_at", { ascending: false });
  },

  async acknowledgeAlert(alertId: string, _adminId: string) {
    // Mark alert as inactive instead of acknowledged
    return supabaseAdmin
      .from("inventory_alerts")
      .update({
        is_active: false,
      })
      .eq("id", alertId);
  },

  // Note: Inventory tracking fields (stock_quantity, track_inventory, low_stock_threshold)
  // are not in the current database schema. Inventory is managed through the availability JSONB field.
  async updateProductAvailability(productId: string, availability: any) {
    return supabaseAdmin
      .from("products")
      .update({
        availability,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);
  },

  async createProduct(
    productData: Omit<Tables["products"]["Insert"], "id" | "created_at" | "updated_at">
  ) {
    return supabaseAdmin.from("products").insert(productData).select().single();
  },

  async updateProduct(productId: string, updates: Partial<Tables["products"]["Update"]>) {
    return supabaseAdmin
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();
  },

  async deleteProduct(productId: string) {
    return supabaseAdmin.from("products").delete().eq("id", productId);
  },

  async getAllProducts(filters?: {
    category?: string | undefined;
    active?: boolean | undefined;
    featured?: boolean | undefined;
    lowStock?: boolean | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
  }) {
    let query = supabaseAdmin
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters?.active !== undefined) {
      query = query.eq("active", filters.active);
    }

    if (filters?.featured !== undefined) {
      query = query.eq("featured", filters.featured);
    }

    // Note: Low stock filtering not available - inventory fields don't exist in schema
    // if (filters?.lowStock) {
    //   query = query.eq("track_inventory", true).lte("stock_quantity", "low_stock_threshold");
    // }

    if (filters?.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    return query;
  },

  async createCategory(
    categoryData: Omit<Tables["categories"]["Insert"], "id" | "created_at" | "updated_at">
  ) {
    return supabaseAdmin.from("categories").insert(categoryData).select().single();
  },

  async updateCategory(categoryId: string, updates: Partial<Tables["categories"]["Update"]>) {
    return supabaseAdmin
      .from("categories")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select()
      .single();
  },

  async deleteCategory(categoryId: string) {
    return supabaseAdmin.from("categories").delete().eq("id", categoryId);
  },

  async getAllCategories() {
    return supabaseAdmin.from("categories").select("*").order("sort_order", { ascending: true });
  },
};

// Type exports for convenience
export type { Product, Category, Order, CartItem, UserProfile };
