export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string;
          admin_id: string | null;
          created_at: string | null;
          id: string;
          ip_address: string | null;
          new_values: Json | null;
          old_values: Json | null;
          resource_id: string | null;
          resource_type: string;
          user_agent: string | null;
        };
        Insert: {
          action: string;
          admin_id?: string | null;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type: string;
          user_agent?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string | null;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          new_values?: Json | null;
          old_values?: Json | null;
          resource_id?: string | null;
          resource_type?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      bundle_sizes: {
        Row: {
          branch: string | null;
          build_id: string;
          bundle_name: string;
          commit_hash: string | null;
          created_at: string | null;
          environment: string | null;
          gzip_size_bytes: number | null;
          id: string;
          metadata: Json | null;
          size_bytes: number;
        };
        Insert: {
          branch?: string | null;
          build_id: string;
          bundle_name: string;
          commit_hash?: string | null;
          created_at?: string | null;
          environment?: string | null;
          gzip_size_bytes?: number | null;
          id?: string;
          metadata?: Json | null;
          size_bytes: number;
        };
        Update: {
          branch?: string | null;
          build_id?: string;
          bundle_name?: string;
          commit_hash?: string | null;
          created_at?: string | null;
          environment?: string | null;
          gzip_size_bytes?: number | null;
          id?: string;
          metadata?: Json | null;
          size_bytes?: number;
        };
        Relationships: [];
      };
      cart_items: {
        Row: {
          created_at: string | null;
          customizations: Json | null;
          id: string;
          product_id: string;
          quantity: number;
          session_id: string | null;
          total_price: number;
          unit_price: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          customizations?: Json | null;
          id?: string;
          product_id: string;
          quantity?: number;
          session_id?: string | null;
          total_price: number;
          unit_price: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          customizations?: Json | null;
          id?: string;
          product_id?: string;
          quantity?: number;
          session_id?: string | null;
          total_price?: number;
          unit_price?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          description_cs: string | null;
          description_en: string | null;
          id: string;
          image_url: string | null;
          name_cs: string;
          name_en: string;
          parent_id: string | null;
          slug: string;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          description_cs?: string | null;
          description_en?: string | null;
          id?: string;
          image_url?: string | null;
          name_cs: string;
          name_en: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          description_cs?: string | null;
          description_en?: string | null;
          id?: string;
          image_url?: string | null;
          name_cs?: string;
          name_en?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_forms: {
        Row: {
          created_at: string | null;
          email: string;
          id: string;
          ip_address: string | null;
          message: string;
          name: string;
          phone: string | null;
          status: string | null;
          subject: string;
          updated_at: string | null;
          user_agent: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          id?: string;
          ip_address?: string | null;
          message: string;
          name: string;
          phone?: string | null;
          status?: string | null;
          subject: string;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          id?: string;
          ip_address?: string | null;
          message?: string;
          name?: string;
          phone?: string | null;
          status?: string | null;
          subject?: string;
          updated_at?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      inventory_alerts: {
        Row: {
          alert_type: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          message: string;
          product_id: string | null;
          threshold: number;
        };
        Insert: {
          alert_type: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          message: string;
          product_id?: string | null;
          threshold: number;
        };
        Update: {
          alert_type?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          message?: string;
          product_id?: string | null;
          threshold?: number;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_alerts_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string | null;
          customer_info: Json;
          delivery_cost: number | null;
          delivery_info: Json;
          id: string;
          items: Json;
          notes: string | null;
          order_number: string;
          payment_info: Json | null;
          status: string | null;
          subtotal: number;
          total_amount: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          customer_info?: Json;
          delivery_cost?: number | null;
          delivery_info?: Json;
          id?: string;
          items?: Json;
          notes?: string | null;
          order_number: string;
          payment_info?: Json | null;
          status?: string | null;
          subtotal: number;
          total_amount: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          customer_info?: Json;
          delivery_cost?: number | null;
          delivery_info?: Json;
          id?: string;
          items?: Json;
          notes?: string | null;
          order_number?: string;
          payment_info?: Json | null;
          status?: string | null;
          subtotal?: number;
          total_amount?: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      payment_errors: {
        Row: {
          amount: number | null;
          created_at: string;
          currency: string | null;
          customer_email: string | null;
          error_code: string | null;
          error_message: string;
          error_type: string;
          id: string;
          metadata: Json | null;
          order_id: string | null;
          payment_intent_id: string | null;
          sanitized_message: string;
          stack_trace: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string;
          currency?: string | null;
          customer_email?: string | null;
          error_code?: string | null;
          error_message: string;
          error_type: string;
          id?: string;
          metadata?: Json | null;
          order_id?: string | null;
          payment_intent_id?: string | null;
          sanitized_message: string;
          stack_trace?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string;
          currency?: string | null;
          customer_email?: string | null;
          error_code?: string | null;
          error_message?: string;
          error_type?: string;
          id?: string;
          metadata?: Json | null;
          order_id?: string | null;
          payment_intent_id?: string | null;
          sanitized_message?: string;
          stack_trace?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payment_errors_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      performance_metrics: {
        Row: {
          created_at: string | null;
          id: string;
          metadata: Json | null;
          metric_id: string | null;
          name: string;
          rating: string | null;
          timestamp: string;
          url: string | null;
          user_agent: string | null;
          value: number;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          metric_id?: string | null;
          name: string;
          rating?: string | null;
          timestamp: string;
          url?: string | null;
          user_agent?: string | null;
          value: number;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          metric_id?: string | null;
          name?: string;
          rating?: string | null;
          timestamp?: string;
          url?: string | null;
          user_agent?: string | null;
          value?: number;
        };
        Relationships: [];
      };
      products: {
        Row: {
          active: boolean | null;
          availability: Json | null;
          base_price: number;
          category_id: string | null;
          created_at: string | null;
          customization_options: Json | null;
          description_cs: string | null;
          description_en: string | null;
          featured: boolean | null;
          id: string;
          images: Json | null;
          name_cs: string;
          name_en: string;
          seo_metadata: Json | null;
          slug: string;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          availability?: Json | null;
          base_price: number;
          category_id?: string | null;
          created_at?: string | null;
          customization_options?: Json | null;
          description_cs?: string | null;
          description_en?: string | null;
          featured?: boolean | null;
          id?: string;
          images?: Json | null;
          name_cs: string;
          name_en: string;
          seo_metadata?: Json | null;
          slug: string;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          availability?: Json | null;
          base_price?: number;
          category_id?: string | null;
          created_at?: string | null;
          customization_options?: Json | null;
          description_cs?: string | null;
          description_en?: string | null;
          featured?: boolean | null;
          id?: string;
          images?: Json | null;
          name_cs?: string;
          name_en?: string;
          seo_metadata?: Json | null;
          slug?: string;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      user_profiles: {
        Row: {
          addresses: Json | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string | null;
          phone: string | null;
          preferences: Json | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          addresses?: Json | null;
          created_at?: string | null;
          email: string;
          id: string;
          name?: string | null;
          phone?: string | null;
          preferences?: Json | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          addresses?: Json | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string | null;
          phone?: string | null;
          preferences?: Json | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      web_vitals_metrics: {
        Row: {
          created_at: string | null;
          delta: number | null;
          id: string;
          metric_id: string;
          metric_name: string;
          navigation_type: string | null;
          rating: string;
          url: string;
          user_agent: string | null;
          value: number;
        };
        Insert: {
          created_at?: string | null;
          delta?: number | null;
          id?: string;
          metric_id: string;
          metric_name: string;
          navigation_type?: string | null;
          rating: string;
          url: string;
          user_agent?: string | null;
          value: number;
        };
        Update: {
          created_at?: string | null;
          delta?: number | null;
          id?: string;
          metric_id?: string;
          metric_name?: string;
          navigation_type?: string | null;
          rating?: string;
          url?: string;
          user_agent?: string | null;
          value?: number;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          created_at: string;
          event_id: string;
          event_type: string;
          id: string;
          processed_at: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          event_type: string;
          id?: string;
          processed_at?: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          event_type?: string;
          id?: string;
          processed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_delivery_cost: {
        Args: { delivery_address: Json; delivery_date: string; items: Json };
        Returns: number;
      };
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_available_delivery_dates: {
        Args: { end_date: string; start_date: string };
        Returns: {
          available: boolean;
          date: string;
          is_holiday: boolean;
        }[];
      };
      get_stripe_price_id_for_product: {
        Args: { p_product_id: string; p_size?: string };
        Returns: string;
      };
      update_product_availability: {
        Args: { availability_data: Json; product_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
