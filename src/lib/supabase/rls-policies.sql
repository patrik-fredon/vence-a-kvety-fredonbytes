-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

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

-- User profiles policies (users can only access their own profile)
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND preferences->>'role' = 'admin'
    )
  );

-- Orders policies (users can access their own orders, admins can access all)
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

-- Cart items policies (users can only access their own cart)
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can manage their own cart items" ON cart_items
  FOR ALL USING (
    auth.uid() = user_id
  );

-- Anonymous users can manage cart items by session
CREATE POLICY "Anonymous users can manage cart by session" ON cart_items
  FOR ALL USING (
    user_id IS NULL AND
    session_id IS NOT NULL
  );

-- Create admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND preferences->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user owns resource
CREATE OR REPLACE FUNCTION owns_resource(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = resource_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
