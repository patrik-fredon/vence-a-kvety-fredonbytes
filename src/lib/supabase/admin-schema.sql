-- Enhanced admin schema for administrative dashboard
-- This extends the existing schema with admin-specific features

-- Create admin roles enum
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'super_admin');

-- Add role column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';

-- Add inventory tracking to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT false;

-- Create admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for admin activity log
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_resource ON admin_activity_log(resource_type, resource_id);

-- Create inventory alerts table
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
  current_stock INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for inventory alerts
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_acknowledged ON inventory_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_created_at ON inventory_alerts(created_at);

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if the user is an admin
  IF EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  ) THEN
    INSERT INTO admin_activity_log (
      admin_id,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::text, OLD.id::text),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and create inventory alerts
CREATE OR REPLACE FUNCTION check_inventory_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if inventory tracking is enabled
  IF NEW.track_inventory = true THEN
    -- Check for low stock
    IF NEW.stock_quantity <= NEW.low_stock_threshold AND NEW.stock_quantity > 0 THEN
      INSERT INTO inventory_alerts (product_id, alert_type, current_stock, threshold)
      VALUES (NEW.id, 'low_stock', NEW.stock_quantity, NEW.low_stock_threshold)
      ON CONFLICT DO NOTHING;
    END IF;

    -- Check for out of stock
    IF NEW.stock_quantity = 0 THEN
      INSERT INTO inventory_alerts (product_id, alert_type, current_stock, threshold)
      VALUES (NEW.id, 'out_of_stock', NEW.stock_quantity, NEW.low_stock_threshold)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for admin activity logging
CREATE TRIGGER products_admin_log
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

CREATE TRIGGER categories_admin_log
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

CREATE TRIGGER orders_admin_log
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

-- Create trigger for inventory alerts
CREATE TRIGGER products_inventory_check
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW EXECUTE FUNCTION check_inventory_alerts();

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'orders', json_build_object(
      'total', (SELECT COUNT(*) FROM orders),
      'pending', (SELECT COUNT(*) FROM orders WHERE status = 'pending'),
      'today', (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE)
    ),
    'products', json_build_object(
      'total', (SELECT COUNT(*) FROM products WHERE active = true),
      'low_stock', (SELECT COUNT(*) FROM products WHERE track_inventory = true AND stock_quantity <= low_stock_threshold),
      'out_of_stock', (SELECT COUNT(*) FROM products WHERE track_inventory = true AND stock_quantity = 0)
    ),
    'revenue', json_build_object(
      'total', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('delivered', 'shipped')),
      'this_month', (SELECT COALESCE(SUM(total_amount), 0) FROM orders
                     WHERE status IN ('delivered', 'shipped')
                     AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE))
    ),
    'alerts', json_build_object(
      'unacknowledged', (SELECT COUNT(*) FROM inventory_alerts WHERE acknowledged = false)
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for admin tables

-- Admin activity log - only admins can read
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Inventory alerts - only admins can manage
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inventory alerts" ON inventory_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Update existing RLS policies for admin access
CREATE POLICY "Admins can manage all products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage all categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
