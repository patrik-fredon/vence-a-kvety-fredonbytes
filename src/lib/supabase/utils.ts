import { supabase } from './client';
import { supabaseAdmin } from './server';
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];
type Product = Tables['products']['Row'];
type Category = Tables['categories']['Row'];
type Order = Tables['orders']['Row'];
type CartItem = Tables['cart_items']['Row'];
type UserProfile = Tables['user_profiles']['Row'];

// Product utilities
export const productUtils = {
  async getActiveProducts(categorySlug?: string, limit = 20, offset = 0) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('active', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categorySlug) {
      query = query.eq('categories.slug', categorySlug);
    }

    return query;
  },

  async getProductBySlug(slug: string) {
    return supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .eq('active', true)
      .single();
  },

  async searchProducts(searchTerm: string, limit = 20) {
    return supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('active', true)
      .or(`name_cs.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,description_cs.ilike.%${searchTerm}%,description_en.ilike.%${searchTerm}%`)
      .limit(limit);
  },

  async getFeaturedProducts(limit = 6) {
    return supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('active', true)
      .eq('featured', true)
      .limit(limit);
  }
};

// Category utilities
export const categoryUtils = {
  async getActiveCategories() {
    return supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
  },

  async getCategoryBySlug(slug: string) {
    return supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();
  },

  async getCategoryWithProducts(slug: string, limit = 20) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('active', true)
      .single();

    if (categoryError || !category) {
      return { data: null, error: categoryError };
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', category.id)
      .eq('active', true)
      .limit(limit);

    return {
      data: { category, products },
      error: productsError
    };
  }
};

// Cart utilities
export const cartUtils = {
  async getCartItems(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    let query = supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
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
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    // Check if item already exists
    let existingQuery = supabase
      .from('cart_items')
      .select('*')
      .eq('product_id', productId);

    if (userId) {
      existingQuery = existingQuery.eq('user_id', userId);
    } else if (sessionId) {
      existingQuery = existingQuery.eq('session_id', sessionId);
    }

    const { data: existing } = await existingQuery.single();

    if (existing) {
      // Update quantity
      return supabase
        .from('cart_items')
        .update({
          quantity: existing.quantity + quantity,
          customizations,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Insert new item
      return supabase
        .from('cart_items')
        .insert({
          product_id: productId,
          quantity,
          customizations,
          user_id: userId || null,
          session_id: sessionId || null
        });
    }
  },

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
    }

    return supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);
  },

  async removeFromCart(itemId: string) {
    return supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);
  },

  async clearCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new Error('Either userId or sessionId must be provided');
    }

    let query = supabase.from('cart_items').delete();

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    return query;
  }
};

// Order utilities
export const orderUtils = {
  async createOrder(orderData: Tables['orders']['Insert']) {
    return supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
  },

  async getOrderById(orderId: string, userId?: string) {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('id', orderId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    return query.single();
  },

  async getUserOrders(userId: string, limit = 20, offset = 0) {
    return supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
  },

  async updateOrderStatus(orderId: string, status: Database['public']['Enums']['order_status'], internalNotes?: string) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (internalNotes) {
      updateData.notes = internalNotes; // Use notes field instead of internal_notes
    }

    return supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
  },

  async getOrderHistory(orderId: string) {
    // Get order with all status change timestamps
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return { data: null, error };
    }

    // Build status history from timestamps
    const statusHistory = [];

    if (order.created_at) {
      statusHistory.push({
        status: 'pending',
        timestamp: order.created_at,
        description: 'Objednávka byla vytvořena'
      });
    }

    // Generate status history based on current status
    if (order.status !== 'pending') {
      statusHistory.push({
        status: 'confirmed',
        timestamp: order.updated_at,
        description: 'Objednávka byla potvrzena'
      });
    }

    if (['processing', 'ready', 'shipped', 'delivered'].includes(order.status)) {
      statusHistory.push({
        status: 'processing',
        timestamp: order.updated_at,
        description: 'Objednávka se zpracovává'
      });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      statusHistory.push({
        status: 'shipped',
        timestamp: order.updated_at,
        description: 'Objednávka byla odeslána'
      });
    }

    if (order.status === 'delivered') {
      statusHistory.push({
        status: 'delivered',
        timestamp: order.updated_at,
        description: 'Objednávka byla doručena'
      });
    }

    if (order.status === 'cancelled') {
      statusHistory.push({
        status: 'cancelled',
        timestamp: order.updated_at,
        description: 'Objednávka byla zrušena'
      });
    }

    return { data: { order, statusHistory }, error: null };
  },

  async getAllOrders(filters?: {
    status?: Database['public']['Enums']['order_status'];
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    if (filters?.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + filters.limit - 1);
    }

    return query;
  },

  async getOrderStats() {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('status, total_amount, created_at');

    if (error) {
      return { data: null, error };
    }

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => ['delivered', 'shipped'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0),
      todayOrders: orders.filter(o => {
        const today = new Date().toISOString().split('T')[0];
        return o.created_at?.startsWith(today);
      }).length
    };

    return { data: stats, error: null };
  }
};

// User profile utilities
export const userUtils = {
  async getUserProfile(userId: string) {
    return supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    return supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);
  },

  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', userId)
      .single();

    return (data?.preferences as any)?.role === 'admin';
  }
};

// Delivery utilities
export const deliveryUtils = {
  async getAvailableDeliveryDates(startDate: string, endDate: string) {
    return supabase.rpc('get_available_delivery_dates', {
      start_date: startDate,
      end_date: endDate
    });
  },

  async calculateDeliveryyCost(
    deliveryAddress: any,
    items: any[],
    deliveryDate: string
  ) {
    return supabase.rpc('calculate_delivery_cost', {
      delivery_address: deliveryAddress,
      items,
      delivery_date: deliveryDate
    });
  }
};

// Error handling utility
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);

  if (error?.code === 'PGRST116') {
    return { message: 'Resource not found', code: 'NOT_FOUND' };
  }

  if (error?.code === '23505') {
    return { message: 'Resource already exists', code: 'DUPLICATE' };
  }

  if (error?.code === '23503') {
    return { message: 'Invalid reference', code: 'INVALID_REFERENCE' };
  }

  return {
    message: error?.message || 'An unexpected error occurred',
    code: error?.code || 'UNKNOWN_ERROR'
  };
};

// Type exports for convenience
export type {
  Product,
  Category,
  Order,
  CartItem,
  UserProfile
};
