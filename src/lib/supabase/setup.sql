-- Complete Supabase database setup script
-- Run this script in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_cs TEXT,
  description_en TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_cs TEXT,
  description_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images JSONB DEFAULT '[]'::jsonb,
  customization_options JSONB DEFAULT '[]'::jsonb,
  availability JSONB DEFAULT '{}'::jsonb,
  seo_metadata JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_base_price ON products(base_price);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_info JSONB NOT NULL,
  delivery_info JSONB NOT NULL,
  payment_info JSONB NOT NULL,
  items JSONB NOT NULL,
  status order_status DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Cart items table (for persistent cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  customizations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure either user_id or session_id is provided
  CONSTRAINT cart_items_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Create indexes for cart items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Order status log table
CREATE TABLE IF NOT EXISTS order_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (active = true);

CREATE POLICY "Categories can be managed by admins" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND preferences->>'role' = 'admin'
    )
  );

-- Products policies (public read active products, admin write)
CREATE POLICY "Active products are viewable by everyone" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Products can be managed by admins" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND preferences->>'role' = 'admin'
    )
  );

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND preferences->>'role' = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND customer_info->>'email' = (
      SELECT email FROM user_profiles WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND preferences->>'role' = 'admin'
    )
  );

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cart items" ON cart_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can manage cart by session" ON cart_items
  FOR ALL USING (user_id IS NULL AND session_id IS NOT NULL);

-- Database functions
CREATE OR REPLACE FUNCTION get_available_delivery_dates(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  date DATE,
  available BOOLEAN,
  is_holiday BOOLEAN
) AS $$
DECLARE
  current_date DATE;
  is_weekend BOOLEAN;
  is_czech_holiday BOOLEAN;
BEGIN
  current_date := start_date;

  WHILE current_date <= end_date LOOP
    is_weekend := EXTRACT(DOW FROM current_date) IN (0, 6);
    is_czech_holiday := current_date IN (
      DATE_TRUNC('year', current_date),
      (DATE_TRUNC('year', current_date) + INTERVAL '4 months'),
      (DATE_TRUNC('year', current_date) + INTERVAL '4 months 7 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '6 months 4 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '6 months 5 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '8 months 27 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '9 months 27 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '10 months 16 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '11 months 23 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '11 months 24 days'),
      (DATE_TRUNC('year', current_date) + INTERVAL '11 months 25 days')
    );

    RETURN QUERY SELECT
      current_date,
      NOT (is_weekend OR is_czech_holiday),
      is_czech_holiday;

    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_delivery_cost(
  delivery_address JSONB,
  items JSONB,
  delivery_date DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  base_cost DECIMAL(10,2) := 150.00;
  express_multiplier DECIMAL(3,2) := 1.5;
  total_weight DECIMAL(8,2) := 0;
  item JSONB;
  is_express BOOLEAN := false;
  final_cost DECIMAL(10,2);
BEGIN
  FOR item IN SELECT jsonb_array_elements(items)
  LOOP
    total_weight := total_weight + COALESCE((item->>'weight')::DECIMAL, 2.0) * (item->>'quantity')::INTEGER;
  END LOOP;

  is_express := delivery_date <= CURRENT_DATE + INTERVAL '1 day';
  final_cost := base_cost;

  IF total_weight > 5 THEN
    final_cost := final_cost + (total_weight - 5) * 50;
  END IF;

  IF is_express THEN
    final_cost := final_cost * express_multiplier;
  END IF;

  IF (items->0->>'total_amount')::DECIMAL >= 2000 AND NOT is_express THEN
    final_cost := 0;
  END IF;

  RETURN final_cost;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product_availability(
  product_id UUID,
  availability_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products
  SET
    availability = availability_data,
    updated_at = NOW()
  WHERE id = product_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  order_number TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');

  SELECT COALESCE(MAX(
    CASE
      WHEN customer_info->>'order_number' LIKE year_suffix || '%'
      THEN (SUBSTRING(customer_info->>'order_number' FROM 3))::INTEGER
      ELSE 0
    END
  ), 0) + 1 INTO sequence_num
  FROM orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  order_number := year_suffix || LPAD(sequence_num::TEXT, 6, '0');

  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.customer_info := NEW.customer_info || jsonb_build_object('order_number', generate_order_number());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_status_log (order_id, old_status, new_status, changed_at)
  VALUES (NEW.id, OLD.status, NEW.status, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();
