-- Function to get available delivery dates
CREATE OR REPLACE FUNCTION get_available_delivery_dates(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  date DATE,
  available BOOLEAN,
  is_holiday BOOLEAN
) AS $$
DECLARE
  current_date DATE;
  is_weekend BOOLEAN;
  is_czech_holiday BOOLEAN;
BEGIN
  current_date := start_date;

  WHILE current_date <= end_date LOOP
    -- Check if it's weekend (Saturday = 6, Sunday = 0)
    is_weekend := EXTRACT(DOW FROM current_date) IN (0, 6);

    -- Check if it's a Czech holiday (simplified - in production, use a holidays table)
    is_czech_holiday := current_date IN (
      -- New Year's Day
      DATE_TRUNC('year', current_date),
      -- Easter Monday (complex calculation - simplified here)
      -- May 1st - Labour Day
      (DATE_TRUNC('year', current_date) + INTERVAL '4 months'),
      -- May 8th - Liberation Day
      (DATE_TRUNC('year', current_date) + INTERVAL '4 months 7 days'),
      -- July 5th - Saints Cyril and Methodius Day
      (DATE_TRUNC('year', current_date) + INTERVAL '6 months 4 days'),
      -- July 6th - Jan Hus Day
      (DATE_TRUNC('year', current_date) + INTERVAL '6 months 5 days'),
      -- September 28th - Czech Statehood Day
      (DATE_TRUNC('year', current_date) + INTERVAL '8 months 27 days'),
      -- October 28th - Independence Day
      (DATE_TRUNC('year', current_date) + INTERVAL '9 months 27 days'),
      -- November 17th - Freedom Day
      (DATE_TRUNC('year', current_date) + INTERVAL '10 months 16 days'),
      -- December 24th - Christmas Eve
      (DATE_TRUNC('year', current_date) + INTERVAL '11 months 23 days'),
      -- December 25th - Christmas Day
      (DATE_TRUNC('year', current_date) + INTERVAL '11 months 24 days'),
      -- December 26th - St. Stephen's Day
      (DATE_TRUNC('year', current_date) + INTERVAL '11 months 25 days')
    );

    RETURN QUERY SELECT
      current_date,
      NOT (is_weekend OR is_czech_holiday),
      is_czech_holiday;

    current_date := current_date + INTERVAL '1 day';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate delivery cost
CREATE OR REPLACE FUNCTION calculate_delivery_cost(
  delivery_address JSONB,
  items JSONB,
  delivery_date DATE
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  base_cost DECIMAL(10,2) := 150.00; -- Base delivery cost in CZK
  express_multiplier DECIMAL(3,2) := 1.5;
  total_weight DECIMAL(8,2) := 0;
  item JSONB;
  is_express BOOLEAN := false;
  final_cost DECIMAL(10,2);
BEGIN
  -- Calculate total weight from items
  FOR item IN SELECT jsonb_array_elements(items)
  LOOP
    total_weight := total_weight + COALESCE((item->>'weight')::DECIMAL, 2.0) * (item->>'quantity')::INTEGER;
  END LOOP;

  -- Check if it's express delivery (next day)
  is_express := delivery_date <= CURRENT_DATE + INTERVAL '1 day';

  -- Calculate final cost
  final_cost := base_cost;

  -- Add weight-based cost (50 CZK per kg over 5kg)
  IF total_weight > 5 THEN
    final_cost := final_cost + (total_weight - 5) * 50;
  END IF;

  -- Apply express delivery multiplier
  IF is_express THEN
    final_cost := final_cost * express_multiplier;
  END IF;

  -- Free delivery for orders over 2000 CZK (except express)
  IF (items->0->>'total_amount')::DECIMAL >= 2000 AND NOT is_express THEN
    final_cost := 0;
  END IF;

  RETURN final_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to update product availability
CREATE OR REPLACE FUNCTION update_product_availability(
  product_id UUID,
  availability_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products
  SET
    availability = availability_data,
    updated_at = NOW()
  WHERE id = product_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old cart items (for anonymous sessions)
CREATE OR REPLACE FUNCTION cleanup_old_cart_items()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cart_items
  WHERE
    user_id IS NULL
    AND created_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order total with customizations
CREATE OR REPLACE FUNCTION calculate_order_total(order_items JSONB)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total DECIMAL(10,2) := 0;
  item JSONB;
  product_price DECIMAL(10,2);
  customization_cost DECIMAL(10,2);
  item_total DECIMAL(10,2);
BEGIN
  FOR item IN SELECT jsonb_array_elements(order_items)
  LOOP
    -- Get base product price
    SELECT base_price INTO product_price
    FROM products
    WHERE id = (item->>'product_id')::UUID;

    -- Calculate customization cost (simplified)
    customization_cost := COALESCE((item->>'customization_cost')::DECIMAL, 0);

    -- Calculate item total
    item_total := (product_price + customization_cost) * (item->>'quantity')::INTEGER;

    total := total + item_total;
  END LOOP;

  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  order_number TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');

  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    CASE
      WHEN customer_info->>'order_number' LIKE year_suffix || '%'
      THEN (SUBSTRING(customer_info->>'order_number' FROM 3))::INTEGER
      ELSE 0
    END
  ), 0) + 1 INTO sequence_num
  FROM orders
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

  order_number := year_suffix || LPAD(sequence_num::TEXT, 6, '0');

  RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to set order number on insert
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.customer_info := NEW.customer_info || jsonb_build_object('order_number', generate_order_number());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order number generation
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number();

-- Function to send order status notifications (placeholder for email integration)
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- This would integrate with an email service in production
  -- For now, we'll just log the status change
  INSERT INTO order_status_log (order_id, old_status, new_status, changed_at)
  VALUES (NEW.id, OLD.status, NEW.status, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create order status log table
CREATE TABLE IF NOT EXISTS order_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for order status notifications
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_order_status_change();
