-- GDPR Compliance Database Schema
-- Tables for user consent, activity logging, and data management

-- User consent tracking table
CREATE TABLE IF NOT EXISTS user_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marketing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,
  functional_consent BOOLEAN DEFAULT true,
  consent_version VARCHAR(10) DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- User activity log table for GDPR compliance
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Index for efficient querying
  INDEX idx_user_activity_user_id ON user_activity_log(user_id),
  INDEX idx_user_activity_created_at ON user_activity_log(created_at),
  INDEX idx_user_activity_action ON user_activity_log(action)
);

-- User addresses table (if not exists)
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  country VARCHAR(2) DEFAULT 'CZ',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data deletion requests table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  deletion_details JSONB DEFAULT '{}',

  INDEX idx_deletion_requests_status ON data_deletion_requests(status),
  INDEX idx_deletion_requests_requested_at ON data_deletion_requests(requested_at)
);

-- Data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  export_url TEXT, -- URL to download the export file
  expires_at TIMESTAMP WITH TIME ZONE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,

  INDEX idx_export_requests_status ON data_export_requests(status),
  INDEX idx_export_requests_expires_at ON data_export_requests(expires_at)
);

-- RLS Policies for GDPR tables

-- User consent policies
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consent" ON user_consent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent" ON user_consent
  FOR ALL USING (auth.uid() = user_id);

-- User activity log policies
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity log" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (true); -- Allow system to log activities

-- User addresses policies
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own addresses" ON user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Data deletion requests policies
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion requests" ON data_deletion_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests" ON data_deletion_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Data export requests policies
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own export requests" ON data_export_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests" ON data_export_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for GDPR compliance

-- Function to automatically log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log significant user actions
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_activity_log (user_id, action, details)
    VALUES (NEW.user_id, TG_TABLE_NAME || '_created', row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO user_activity_log (user_id, action, details)
    VALUES (NEW.user_id, TG_TABLE_NAME || '_updated',
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO user_activity_log (user_id, action, details)
    VALUES (OLD.user_id, TG_TABLE_NAME || '_deleted', row_to_json(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired export requests
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS void AS $$
BEGIN
  DELETE FROM data_export_requests
  WHERE expires_at < NOW() AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize user data (for GDPR compliance)
CREATE OR REPLACE FUNCTION anonymize_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB := '{}';
  orders_count INTEGER;
  cart_items_count INTEGER;
  addresses_count INTEGER;
  activity_count INTEGER;
BEGIN
  -- Anonymize orders (keep for business records but remove personal info)
  UPDATE orders
  SET
    customer_info = jsonb_build_object(
      'firstName', '[DELETED]',
      'lastName', '[DELETED]',
      'email', '[DELETED]',
      'phone', '[DELETED]',
      'company', null,
      'note', null
    ),
    user_id = NULL
  WHERE user_id = target_user_id;

  GET DIAGNOSTICS orders_count = ROW_COUNT;

  -- Delete cart items
  DELETE FROM cart_items WHERE user_id = target_user_id;
  GET DIAGNOSTICS cart_items_count = ROW_COUNT;

  -- Delete addresses
  DELETE FROM user_addresses WHERE user_id = target_user_id;
  GET DIAGNOSTICS addresses_count = ROW_COUNT;

  -- Delete activity log
  DELETE FROM user_activity_log WHERE user_id = target_user_id;
  GET DIAGNOSTICS activity_count = ROW_COUNT;

  -- Delete consent records
  DELETE FROM user_consent WHERE user_id = target_user_id;

  -- Build result
  result := jsonb_build_object(
    'orders_anonymized', orders_count,
    'cart_items_deleted', cart_items_count,
    'addresses_deleted', addresses_count,
    'activity_logs_deleted', activity_count,
    'anonymized_at', NOW()
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic activity logging (optional - can be resource intensive)
-- Uncomment if you want automatic logging for all user actions

-- CREATE TRIGGER log_orders_activity
--   AFTER INSERT OR UPDATE OR DELETE ON orders
--   FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- CREATE TRIGGER log_cart_activity
--   AFTER INSERT OR UPDATE OR DELETE ON cart_items
--   FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Scheduled job to clean up expired exports (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-exports', '0 2 * * *', 'SELECT cleanup_expired_exports();');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
