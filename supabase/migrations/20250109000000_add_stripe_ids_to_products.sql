-- Add Stripe integration columns to products table
-- This migration adds stripe_price_id and stripe_product_id for proper Stripe checkout integration

-- Add Stripe ID columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Create indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id ON products(stripe_price_id);

-- Add comments for documentation
COMMENT ON COLUMN products.stripe_product_id IS 'Stripe Product ID for checkout integration';
COMMENT ON COLUMN products.stripe_price_id IS 'Stripe Price ID for checkout integration';

-- Update existing products with Stripe IDs based on product names
-- Note: This assumes products exist with these exact Czech names
-- Adjust the WHERE conditions if your product names differ

-- Kříž
UPDATE products
SET
  stripe_product_id = 'prod_TCX8y2aS6DSAfA',
  stripe_price_id = 'price_1SG847K7X9a6rKGIPpM65GAY'
WHERE name_cs = 'Kříž' AND stripe_product_id IS NULL;

-- Květina na rakev
UPDATE products
SET
  stripe_product_id = 'prod_TCX7HzA530g4pO',
  stripe_price_id = 'price_1SG83HK7X9a6rKGIO6ktpOpJ'
WHERE name_cs = 'Květina na rakev' AND stripe_product_id IS NULL;

-- Srdce žluté prázdné uvnitř
UPDATE products
SET
  stripe_product_id = 'prod_TCX6mzJFIgv7AG',
  stripe_price_id = 'price_1SG82XK7X9a6rKGIqpZXF4rn'
WHERE name_cs = 'Srdce žluté prázdné uvnitř' AND stripe_product_id IS NULL;

-- Srdce na urnu
UPDATE products
SET
  stripe_product_id = 'prod_TCX6lsTF1Coc0p',
  stripe_price_id = 'price_1SG81rK7X9a6rKGICHaGN33M'
WHERE name_cs = 'Srdce na urnu' AND stripe_product_id IS NULL;

-- Srdce červené plné šikmé
UPDATE products
SET
  stripe_product_id = 'prod_TCX5NkvHXtlUgM',
  stripe_price_id = 'price_1SG80uK7X9a6rKGIDSZUEwee'
WHERE name_cs = 'Srdce červené plné šikmé' AND stripe_product_id IS NULL;

-- Plné srdce (size_120 - base size)
UPDATE products
SET
  stripe_product_id = 'prod_TCX228reKdLXZU',
  stripe_price_id = 'price_1SG7yUK7X9a6rKGI5qDGMWbh'
WHERE name_cs = 'Plné srdce' AND stripe_product_id IS NULL;

-- Note: For products with multiple sizes (Plné srdce, Kulatý věnec),
-- we're setting the base size price. Size-specific pricing should be handled
-- in the checkout logic by selecting the appropriate price_id based on customization.

-- Obdélník s fotografii
UPDATE products
SET
  stripe_product_id = 'prod_TCX1PTWEK0MkJ8',
  stripe_price_id = 'price_1SG7xYK7X9a6rKGIVzB2rCfz'
WHERE name_cs = 'Obdélník s fotografii' AND stripe_product_id IS NULL;

-- Kulatý věnec (size_120 - base size)
UPDATE products
SET
  stripe_product_id = 'prod_TCWzLVqfsV3rF3',
  stripe_price_id = 'price_1SG7viK7X9a6rKGIqhLP1Byz'
WHERE name_cs = 'Kulatý věnec' AND stripe_product_id IS NULL;

-- Create a helper function to get the correct Stripe price ID based on product and size
CREATE OR REPLACE FUNCTION get_stripe_price_id_for_product(
  p_product_id UUID,
  p_size TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  v_product_name TEXT;
  v_stripe_price_id TEXT;
BEGIN
  -- Get product name
  SELECT name_cs INTO v_product_name
  FROM products
  WHERE id = p_product_id;

  -- Handle size-specific pricing for products with multiple sizes
  IF v_product_name = 'Plné srdce' THEN
    CASE p_size
      WHEN '180' THEN v_stripe_price_id := 'price_1SG7zIK7X9a6rKGIgz3jZth1';
      WHEN '150' THEN v_stripe_price_id := 'price_1SG7yxK7X9a6rKGIZIwpsJQD';
      ELSE v_stripe_price_id := 'price_1SG7yUK7X9a6rKGI5qDGMWbh'; -- Default 120
    END CASE;
  ELSIF v_product_name = 'Kulatý věnec' THEN
    CASE p_size
      WHEN '180' THEN v_stripe_price_id := 'price_1SG7viK7X9a6rKGILiN2x5Tx';
      WHEN '150' THEN v_stripe_price_id := 'price_1SG7viK7X9a6rKGI9D5n7WcY';
      ELSE v_stripe_price_id := 'price_1SG7viK7X9a6rKGIqhLP1Byz'; -- Default 120
    END CASE;
  ELSE
    -- For products without size variations, return the default price_id
    SELECT stripe_price_id INTO v_stripe_price_id
    FROM products
    WHERE id = p_product_id;
  END IF;

  RETURN v_stripe_price_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_stripe_price_id_for_product IS 'Returns the correct Stripe price ID based on product and optional size customization';
