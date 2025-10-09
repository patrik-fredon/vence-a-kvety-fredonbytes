-- Add delivery method support to orders table
-- This migration adds columns to track delivery method (delivery vs pickup)
-- and pickup location information for orders

-- Add delivery_method column to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_method TEXT CHECK (delivery_method IN ('delivery', 'pickup'));

-- Add pickup_location column for storing pickup location details
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS pickup_location TEXT;

-- Create index for delivery method queries to improve performance
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON orders(delivery_method);

-- Update existing orders to have default delivery method
-- This ensures backward compatibility with existing data
UPDATE orders
SET delivery_method = 'delivery'
WHERE delivery_method IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN orders.delivery_method IS 'Delivery method: delivery (to address) or pickup (at company office)';
COMMENT ON COLUMN orders.pickup_location IS 'Pickup location details when delivery_method is pickup';
