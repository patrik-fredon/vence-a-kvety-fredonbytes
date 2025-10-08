-- Create payment_errors table for payment monitoring and error tracking
-- Requirements: 7.5, 8.5
-- Made fully idempotent to prevent errors on re-run

CREATE TABLE IF NOT EXISTS payment_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Order and payment intent references
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_intent_id TEXT,
  
  -- Error details
  error_type TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT NOT NULL,
  sanitized_message TEXT NOT NULL,
  
  -- Transaction details
  amount DECIMAL(10, 2),
  currency TEXT,
  customer_email TEXT,
  
  -- Additional context
  metadata JSONB DEFAULT '{}'::jsonb,
  stack_trace TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for efficient querying
  CONSTRAINT payment_errors_error_type_check CHECK (error_type <> '')
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payment_errors_created_at ON payment_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_errors_order_id ON payment_errors(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_errors_payment_intent_id ON payment_errors(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_errors_error_type ON payment_errors(error_type);
CREATE INDEX IF NOT EXISTS idx_payment_errors_customer_email ON payment_errors(customer_email) WHERE customer_email IS NOT NULL;

-- Add RLS policies
ALTER TABLE payment_errors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Admin users can view payment errors" ON payment_errors;
DROP POLICY IF EXISTS "Service role can insert payment errors" ON payment_errors;

-- Admin users can view all payment errors
CREATE POLICY "Admin users can view payment errors"
  ON payment_errors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- System can insert payment errors (service role)
CREATE POLICY "Service role can insert payment errors"
  ON payment_errors
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE payment_errors IS 'Stores payment error logs for monitoring and debugging payment issues';
