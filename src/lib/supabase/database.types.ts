export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name_cs: string
          name_en: string
          slug: string
          description_cs: string | null
          description_en: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_cs: string
          name_en: string
          slug: string
          description_cs?: string | null
          description_en?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_cs?: string
          name_en?: string
          slug?: string
          description_cs?: string | null
          description_en?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name_cs: string
          name_en: string
          description_cs: string | null
          description_en: string | null
          slug: string
          base_price: number
          category_id: string | null
          images: Json
          customization_options: Json
          availability: Json
          seo_metadata: Json
          active: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_cs: string
          name_en: string
          description_cs?: string | null
          description_en?: string | null
          slug: string
          base_price: number
          category_id?: string | null
          images?: Json
          customization_options?: Json
          availability?: Json
          seo_metadata?: Json
          active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_cs?: string
          name_en?: string
          description_cs?: string | null
          description_en?: string | null
          slug?: string
          base_price?: number
          category_id?: string | null
          images?: Json
          customization_options?: Json
          availability?: Json
          seo_metadata?: Json
          active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          customer_info: Json
          delivery_info: Json
          payment_info: Json
          items: Json
          status: string
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer_info: Json
          delivery_info: Json
          payment_info: Json
          items: Json
          status?: string
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer_info?: Json
          delivery_info?: Json
          payment_info?: Json
          items?: Json
          status?: string
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          product_id: string | null
          quantity: number
          customizations: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string | null
          quantity?: number
          customizations?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string | null
          quantity?: number
          customizations?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          addresses: Json
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          phone?: string | null
          addresses?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          addresses?: Json
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_available_delivery_dates: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          available: boolean
          is_holiday: boolean
        }[]
      }
      calculate_delivery_cost: {
        Args: {
          delivery_address: Json
          items: Json
          delivery_date: string
        }
        Returns: number
      }
      update_product_availability: {
        Args: {
          product_id: string
          availability_data: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    }
  }
}
