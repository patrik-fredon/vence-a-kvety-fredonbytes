-- Create performance_metrics table for performance monitoring
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id TEXT NOT NULL,
  name TEXT NOT NULL,
  value DECIMAL(10,3) NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  url TEXT NOT NULL,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id),
  client_ip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_rating ON performance_metrics(rating);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON performance_metrics(url);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp ON performance_metrics(name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_rating_timestamp ON performance_metrics(rating, timestamp DESC);

-- Row Level Security policies
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert performance metrics
CREATE POLICY "Anyone can insert performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated users can read performance metrics (for admin dashboard)
CREATE POLICY "Authenticated users can read performance metrics" ON performance_metrics
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a view for performance statistics
CREATE OR REPLACE VIEW performance_stats AS
SELECT
  name,
  rating,
  COUNT(*) as count,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median_value,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95_value,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d_count
FROM performance_metrics
GROUP BY name, rating
ORDER BY name, rating;

-- Create a view for Web Vitals summary
CREATE OR REPLACE VIEW web_vitals_summary AS
SELECT
  name,
  COUNT(*) as total_measurements,
  COUNT(*) FILTER (WHERE rating = 'good') as good_count,
  COUNT(*) FILTER (WHERE rating = 'needs-improvement') as needs_improvement_count,
  COUNT(*) FILTER (WHERE rating = 'poor') as poor_count,
  ROUND(
    (COUNT(*) FILTER (WHERE rating = 'good')::DECIMAL / COUNT(*)) * 100,
    2
  ) as good_percentage,
  AVG(value) as avg_value,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75_value,
  MAX(created_at) as last_measurement
FROM performance_metrics
WHERE name IN ('LCP', 'INP', 'CLS', 'FCP', 'TTFB')
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY name
ORDER BY name;

-- Grant access to the views
GRANT SELECT ON performance_stats TO authenticated;
GRANT SELECT ON web_vitals_summary TO authenticated;

-- Create function to clean old performance metrics (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_performance_metrics()
RETURNS void AS $$
BEGIN
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-performance-metrics', '0 2 * * *', 'SELECT cleanup_old_performance_metrics();');
