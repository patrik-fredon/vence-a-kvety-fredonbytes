-- Add unit_price and total_price fields to cart_items table
-- This migration fixes the database schema type issues for task 1.6
-- Made idempotent to prevent errors on re-run

-- Add unit_price column (price per individual item) if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE cart_items
    ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0.00 NOT NULL;
    
    COMMENT ON COLUMN cart_items.unit_price IS 'Price per individual item including customizations';
  END IF;
END $$;

-- Add total_price column (unit_price * quantity) if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cart_items' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE cart_items
    ADD COLUMN total_price DECIMAL(10,2) DEFAULT 0.00 NOT NULL;
    
    COMMENT ON COLUMN cart_items.total_price IS 'Total price for this cart item (unit_price * quantity)';
  END IF;
END $$;

-- Create index on total_price for performance when calculating cart totals (if not exists)
CREATE INDEX IF NOT EXISTS idx_cart_items_total_price ON cart_items(total_price);

-- Update existing cart items with calculated prices based on product base_price
-- This is a one-time migration to populate existing data
UPDATE cart_items
SET
  unit_price = COALESCE(
    (SELECT base_price FROM products WHERE products.id = cart_items.product_id),
    0.00
  ),
  total_price = COALESCE(
    (SELECT base_price * cart_items.quantity FROM products WHERE products.id = cart_items.product_id),
    0.00
  )
WHERE unit_price = 0.00 AND total_price = 0.00;
