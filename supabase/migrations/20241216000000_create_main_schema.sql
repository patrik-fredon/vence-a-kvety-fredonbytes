-- Create main database schema for funeral wreaths e-commerce
-- This migration creates the essential tables for product listings

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_cs TEXT,
  description_en TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_cs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_cs TEXT,
  description_en TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  images JSONB DEFAULT '[]',
  customization_options JSONB DEFAULT '[]',
  availability JSONB DEFAULT '{}',
  seo_metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  addresses JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]',
  customer_info JSONB NOT NULL DEFAULT '{}',
  delivery_info JSONB NOT NULL DEFAULT '{}',
  payment_info JSONB DEFAULT '{}',
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_cost DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  customizations JSONB DEFAULT '[]',
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory alerts
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  alert_type TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access to active categories and products
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

-- RLS Policies for authenticated users
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Admin policies (will be added when user roles are implemented)
-- For now, we'll allow authenticated users to manage their own data

-- Create database functions
CREATE OR REPLACE FUNCTION get_available_delivery_dates(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  date DATE,
  available BOOLEAN,
  is_holiday BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d::DATE as date,
    CASE
      WHEN EXTRACT(DOW FROM d) IN (0, 6) THEN false -- Weekend
      ELSE true
    END as available,
    false as is_holiday
  FROM generate_series(start_date, end_date, '1 day'::interval) d;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_delivery_cost(
  delivery_address JSONB,
  items JSONB,
  delivery_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  base_cost DECIMAL := 200.00; -- Base delivery cost in CZK
  rush_multiplier DECIMAL := 1.0;
BEGIN
  -- Add rush delivery cost if delivery is next day
  IF delivery_date <= CURRENT_DATE + INTERVAL '1 day' THEN
    rush_multiplier := 1.5;
  END IF;

  RETURN base_cost * rush_multiplier;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product_availability(
  product_id UUID,
  availability_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products
  SET availability = availability_data,
      updated_at = NOW()
  WHERE id = product_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_products', (SELECT COUNT(*) FROM products WHERE active = true),
    'total_categories', (SELECT COUNT(*) FROM categories WHERE active = true),
    'total_orders', (SELECT COUNT(*) FROM orders),
    'pending_orders', (SELECT COUNT(*) FROM orders WHERE status = 'pending')
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE categories IS 'Product categories for the funeral wreaths e-commerce';
COMMENT ON TABLE products IS 'Funeral wreaths and floral products';
COMMENT ON TABLE user_profiles IS 'Extended user information beyond Supabase auth';
COMMENT ON TABLE orders IS 'Customer orders with full order information';
COMMENT ON TABLE cart_items IS 'Shopping cart items for authenticated and anonymous users';
COMMENT ON TABLE admin_activity_log IS 'Admin actions audit trail';
COMMENT ON TABLE inventory_alerts IS 'Low stock and inventory alerts';
