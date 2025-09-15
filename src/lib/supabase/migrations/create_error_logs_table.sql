-- Create error_logs table for centralized error monitoring
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id TEXT UNIQUE NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  error_name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('component', 'page', 'critical', 'api')),
  context TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  url TEXT,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  client_ip TEXT,
  additional_data JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_error_logs_updated_at
  BEFORE UPDATE ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read error logs (for admin dashboard)
CREATE POLICY "Authenticated users can read error logs" ON error_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Anyone can insert error logs (for error reporting)
CREATE POLICY "Anyone can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated users can update error logs (for marking as resolved)
CREATE POLICY "Authenticated users can update error logs" ON error_logs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create a view for error statistics
CREATE OR REPLACE VIEW error_stats AS
SELECT
  level,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE resolved = false) as unresolved_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d_count,
  MAX(created_at) as last_occurrence
FROM error_logs
GROUP BY level;

-- Grant access to the view
GRANT SELECT ON error_stats TO authenticated;
