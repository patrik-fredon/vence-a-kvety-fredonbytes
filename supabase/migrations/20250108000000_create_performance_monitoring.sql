-- Create performance monitoring tables
-- Requirements: 7.1, 7.2

-- Core Web Vitals metrics table
CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL CHECK (metric_name IN ('CLS', 'INP', 'LCP', 'FCP', 'TTFB')),
  value DECIMAL(10,2) NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  delta DECIMAL(10,2),
  metric_id TEXT NOT NULL,
  navigation_type TEXT,
  url TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON web_vitals_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals_metrics(rating);
CREATE INDEX IF NOT EXISTS idx_web_vitals_url ON web_vitals_metrics(url);

-- Payment error monitoring table
CREATE TABLE IF NOT EXISTS payment_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT,
  payment_intent_id TEXT,
  error_type TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT NOT NULL,
  sanitized_message TEXT,
  amount DECIMAL(10,2),
  currency TEXT,
  customer_email TEXT,
  metadata JSONB DEFAULT '{}',
  stack_trace TEXT,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment errors
CREATE INDEX IF NOT EXISTS idx_payment_errors_created_at ON payment_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_errors_order_id ON payment_errors(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_errors_type ON payment_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_payment_errors_payment_intent ON payment_errors(payment_intent_id);

-- Bundle size tracking table
CREATE TABLE IF NOT EXISTS bundle_sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  build_id TEXT NOT NULL,
  bundle_name TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  gzip_size_bytes BIGINT,
  commit_hash TEXT,
  branch TEXT,
  environment TEXT DEFAULT 'production',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bundle sizes
CREATE INDEX IF NOT EXISTS idx_bundle_sizes_created_at ON bundle_sizes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bundle_sizes_bundle_name ON bundle_sizes(bundle_name);
CREATE INDEX IF NOT EXISTS idx_bundle_sizes_build_id ON bundle_sizes(build_id);

-- Performance metrics table (general purpose)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  rating TEXT CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  url TEXT,
  metric_id TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);

-- Add RLS policies for security
ALTER TABLE web_vitals_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for web vitals (from client)
CREATE POLICY "Allow anonymous web vitals inserts" ON web_vitals_metrics
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated reads for admins
CREATE POLICY "Allow admin reads on web vitals" ON web_vitals_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Payment errors - admin only
CREATE POLICY "Allow admin reads on payment errors" ON payment_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow service role inserts on payment errors" ON payment_errors
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Bundle sizes - admin only
CREATE POLICY "Allow admin reads on bundle sizes" ON bundle_sizes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Allow service role inserts on bundle sizes" ON bundle_sizes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Performance metrics - similar to web vitals
CREATE POLICY "Allow anonymous performance metrics inserts" ON performance_metrics
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow admin reads on performance metrics" ON performance_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add comments for documentation
COMMENT ON TABLE web_vitals_metrics IS 'Stores Core Web Vitals metrics (CLS, INP, LCP, FCP, TTFB) from client browsers';
COMMENT ON TABLE payment_errors IS 'Tracks payment processing errors for monitoring and debugging';
COMMENT ON TABLE bundle_sizes IS 'Tracks JavaScript bundle sizes across builds for performance monitoring';
COMMENT ON TABLE performance_metrics IS 'General purpose performance metrics storage';
