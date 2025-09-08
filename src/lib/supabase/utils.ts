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

  async updateOrderStatus(orderId: string, status: Database['public']['Enums']['order_status']) {
    return supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId);
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
