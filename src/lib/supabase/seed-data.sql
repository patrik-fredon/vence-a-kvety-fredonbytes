-- Sample seed data for development and testing
-- Run this after the main setup.sql script

-- Insert sample categories
INSERT INTO categories (name_cs, name_en, slug, description_cs, description_en, sort_order) VALUES
('Pohřební věnce', 'Funeral Wreaths', 'funeral-wreaths', 'Tradiční pohřební věnce pro důstojné rozloučení', 'Traditional funeral wreaths for dignified farewell', 1),
('Smuteční kytice', 'Mourning Bouquets', 'mourning-bouquets', 'Elegantní smuteční kytice a vazby', 'Elegant mourning bouquets and arrangements', 2),
('Věnce na hrob', 'Grave Wreaths', 'grave-wreaths', 'Trvalé věnce pro úpravu hrobů', 'Permanent wreaths for grave decoration', 3),
('Smuteční dekorace', 'Mourning Decorations', 'mourning-decorations', 'Doplňkové smuteční dekorace', 'Additional mourning decorations', 4);

-- Insert sample products
INSERT INTO products (
  name_cs, name_en, slug, description_cs, description_en,
  base_price, category_id, images, customization_options, availability, featured
) VALUES
(
  'Klasický pohřební věnec',
  'Classic Funeral Wreath',
  'classic-funeral-wreath',
  'Tradiční pohřební věnec z čerstvých květin s bílými chryzantémami a zelenými listy.',
  'Traditional funeral wreath made from fresh flowers with white chrysanthemums and green leaves.',
  1200.00,
  (SELECT id FROM categories WHERE slug = 'funeral-wreaths'),
  '[
    {"url": "/images/products/classic-wreath-1.jpg", "alt": "Klasický pohřební věnec", "primary": true},
    {"url": "/images/products/classic-wreath-2.jpg", "alt": "Detail věnce", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "options": [
        {"id": "small", "label": {"cs": "Malý (40cm)", "en": "Small (40cm)"}, "priceModifier": 0},
        {"id": "medium", "label": {"cs": "Střední (60cm)", "en": "Medium (60cm)"}, "priceModifier": 300},
        {"id": "large", "label": {"cs": "Velký (80cm)", "en": "Large (80cm)"}, "priceModifier": 600}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": false,
      "options": [
        {"id": "white", "label": {"cs": "Bílá stuha", "en": "White ribbon"}, "priceModifier": 0},
        {"id": "black", "label": {"cs": "Černá stuha", "en": "Black ribbon"}, "priceModifier": 0},
        {"id": "gold", "label": {"cs": "Zlatá stuha", "en": "Gold ribbon"}, "priceModifier": 50}
      ]
    },
    {
      "id": "message",
      "type": "message",
      "name": {"cs": "Věnování", "en": "Dedication"},
      "required": false,
      "maxLength": 100,
      "priceModifier": 100
    }
  ]'::jsonb,
  '{"inStock": true, "estimatedDelivery": "next-day"}'::jsonb,
  true
),
(
  'Růžový smuteční věnec',
  'Pink Mourning Wreath',
  'pink-mourning-wreath',
  'Jemný smuteční věnec s růžovými růžemi a bílými liliemi.',
  'Gentle mourning wreath with pink roses and white lilies.',
  1500.00,
  (SELECT id FROM categories WHERE slug = 'funeral-wreaths'),
  '[
    {"url": "/images/products/pink-wreath-1.jpg", "alt": "Růžový smuteční věnec", "primary": true}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "options": [
        {"id": "medium", "label": {"cs": "Střední (60cm)", "en": "Medium (60cm)"}, "priceModifier": 0},
        {"id": "large", "label": {"cs": "Velký (80cm)", "en": "Large (80cm)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "estimatedDelivery": "next-day"}'::jsonb,
  true
),
(
  'Elegantní smuteční kytice',
  'Elegant Mourning Bouquet',
  'elegant-mourning-bouquet',
  'Elegantní smuteční kytice z bílých a krémových květin.',
  'Elegant mourning bouquet made from white and cream flowers.',
  800.00,
  (SELECT id FROM categories WHERE slug = 'mourning-bouquets'),
  '[
    {"url": "/images/products/elegant-bouquet-1.jpg", "alt": "Elegantní smuteční kytice", "primary": true}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "options": [
        {"id": "small", "label": {"cs": "Malá", "en": "Small"}, "priceModifier": 0},
        {"id": "large", "label": {"cs": "Velká", "en": "Large"}, "priceModifier": 200}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "estimatedDelivery": "same-day"}'::jsonb,
  false
),
(
  'Trvalý věnec na hrob',
  'Permanent Grave Wreath',
  'permanent-grave-wreath',
  'Trvalý věnec z umělých květin pro dlouhodobou úpravu hrobu.',
  'Permanent wreath made from artificial flowers for long-term grave decoration.',
  900.00,
  (SELECT id FROM categories WHERE slug = 'grave-wreaths'),
  '[
    {"url": "/images/products/permanent-wreath-1.jpg", "alt": "Trvalý věnec na hrob", "primary": true}
  ]'::jsonb,
  '[
    {
      "id": "color",
      "type": "color",
      "name": {"cs": "Barva", "en": "Color"},
      "required": true,
      "options": [
        {"id": "white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0},
        {"id": "mixed", "label": {"cs": "Smíšená", "en": "Mixed"}, "priceModifier": 100}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "estimatedDelivery": "2-3-days"}'::jsonb,
  false
);

-- Create a sample admin user profile (you'll need to create the auth user first)
-- This is just for reference - the actual user creation happens through Supabase Auth
/*
INSERT INTO user_profiles (id, email, name, preferences) VALUES
(
  'admin-user-uuid-here', -- Replace with actual auth.users.id
  'admin@pohrebni-vence.cz',
  'Admin User',
  '{"role": "admin", "language": "cs"}'::jsonb
);
*/

-- Sample order status for testing
INSERT INTO order_status_log (order_id, old_status, new_status) VALUES
(gen_random_uuid(), 'pending', 'confirmed');

-- Update product availability for testing
SELECT update_product_availability(
  (SELECT id FROM products WHERE slug = 'classic-funeral-wreath'),
  '{"inStock": true, "quantity": 25, "lastUpdated": "2024-01-15T10:00:00Z"}'::jsonb
);
