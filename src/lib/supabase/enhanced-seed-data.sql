-- Enhanced seed data for funeral wreaths e-commerce
-- This script provides comprehensive sample data with standardized customisation_options
-- Run this after the main schema setup - it's designed to be idempotent

-- Clear existing data (for development/testing only)
-- TRUNCATE TABLE cart_items, orders, products, categories CASCADE;

-- Insert comprehensive categories with hierarchy
INSERT INTO categories (name_cs, name_en, slug, description_cs, description_en, image_url, parent_id, sort_order, active) VALUES
-- Main categories
('Pohřební věnce', 'Funeral Wreaths', 'funeral-wreaths',
 'Tradiční pohřební věnce pro důstojné rozloučení s různými velikostmi a styly',
 'Traditional funeral wreaths for dignified farewell in various sizes and styles',
 '/images/categories/funeral-wreaths.jpg', NULL, 1, true),

('Smuteční kytice', 'Mourning Bouquets', 'mourning-bouquets',
 'Elegantní smuteční kytice a vazby pro vyjádření soustrasti',
 'Elegant mourning bouquets and arrangements to express condolences',
 '/images/categories/mourning-bouquets.jpg', NULL, 2, true),

('Věnce na hrob', 'Grave Wreaths', 'grave-wreaths',
 'Trvalé a sezónní věnce pro úpravu a výzdobu hrobů',
 'Permanent and seasonal wreaths for grave decoration and maintenance',
 '/images/categories/grave-wreaths.jpg', NULL, 3, true),

('Smuteční dekorace', 'Mourning Decorations', 'mourning-decorations',
 'Doplňkové smuteční dekorace, svíčky a drobné dárky',
 'Additional mourning decorations, candles and small memorial gifts',
 '/images/categories/mourning-decorations.jpg', NULL, 4, true),

-- Subcategories for funeral wreaths
('Klasické věnce', 'Classic Wreaths', 'classic-wreaths',
 'Tradiční kulaté věnce s klasickými květinami',
 'Traditional round wreaths with classic flowers',
 '/images/categories/classic-wreaths.jpg',
 (SELECT id FROM categories WHERE slug = 'funeral-wreaths'), 1, true),

('Moderní věnce', 'Modern Wreaths', 'modern-wreaths',
 'Současné designové věnce s netradiční kompozicí',
 'Contemporary design wreaths with non-traditional composition',
 '/images/categories/modern-wreaths.jpg',
 (SELECT id FROM categories WHERE slug = 'funeral-wreaths'), 2, true),

('Srdcové věnce', 'Heart Wreaths', 'heart-wreaths',
 'Věnce ve tvaru srdce pro vyjádření lásky a úcty',
 'Heart-shaped wreaths to express love and respect',
 '/images/categories/heart-wreaths.jpg',
 (SELECT id FROM categories WHERE slug = 'funeral-wreaths'), 3, true),

('Křížové věnce', 'Cross Wreaths', 'cross-wreaths',
 'Křížové pohřební aranžmá pro náboženské obřady',
 'Cross funeral arrangements for religious ceremonies',
 '/images/categories/cross-wreaths.jpg',
 (SELECT id FROM categories WHERE slug = 'funeral-wreaths'), 4, true)

ON CONFLICT (slug) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  name_en = EXCLUDED.name_en,
  description_cs = EXCLUDED.description_cs,
  description_en = EXCLUDED.description_en,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert comprehensive products with standardized customization_options
INSERT INTO products (
  name_cs, name_en, slug, description_cs, description_en,
  base_price, category_id, images, customization_options, availability, seo_metadata, featured, active
) VALUES

-- Classic Round Wreath
(
  'Kulatý věnec',
  'Round wreath',
  'classic-round-wreath',
  'Tradiční kruhový pohřební věnec s bílými růžemi, žlutými karafiáty a zelenými anthuriumy. Ideální pro pohřební obřady, rozloučení a smuteční ceremonie.',
  'Traditional circular funeral wreath with white roses, yellow carnations, and green anthuriums. Ideal for funeral services, farewells, and memorial ceremonies.',
  4400.00,
  (SELECT id FROM categories WHERE slug = 'classic-wreaths'),
  '[
    {"url": "https://cdn.fredonbytes.com/circular-funeral-wreath-white-roses-yellow-carnations-green-anthuriums.webp", "alt": "Classic white round funeral wreath", "primary": true},
    {"url": "https://cdn.fredonbytes.com/circular-funeral-wreath-white-roses-yellow-carnations-green-anthuriums-detail-1.webp", "alt": "Detail 1: Classic white round funeral wreath", "primary": false},
    {"url": "https://cdn.fredonbytes.com/circular-funeral-wreath-white-roses-yellow-carnations-green-anthuriums-detail-2.webp", "alt": "Detail 2: Classic white round funeral wreath", "primary": false},
    {"url": "https://cdn.fredonbytes.com/beige-satin-ribbon-marble-surface-dark-background.webp", "alt": "White ribbon with gold border", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-gold-ribbon-funeral-wreath.webp", "alt": "Black ribbon with gold edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/charcoal-satin-ribbon-natural-light.webp", "alt": "Black classic ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/florist-hands-arranging-lilies-closeup.webp", "alt": "The florist creates a wreath", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "120cm průměr", "en": "120cm diameter"}, "priceModifier": 0, "available": true},
        {"id": "size_150", "label": {"cs": "150cm průměr", "en": "150cm diameter"}, "priceModifier": 500, "available": true},
        {"id": "size_180", "label": {"cs": "180cm průměr", "en": "180cm diameter"}, "priceModifier": 1000, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 25, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": []}'::jsonb,
  '{"title": {"cs": "Klasický bílý pohřební věnec | Pohřební věnce", "en": "Classic White Funeral Wreath | Funeral Wreaths"}, "description": {"cs": "Tradiční bílý pohřební věnec z čerstvých květin. Rychlé dodání po celé ČR.", "en": "Traditional white funeral wreath from fresh flowers. Fast delivery across Czech Republic."}, "keywords": {"cs": "pohřební věnec, bílý věnec, chryzantémy, pohřeb", "en": "funeral wreath, white wreath, chrysanthemums, funeral"}}'::jsonb,
  true,
  true
),

-- Rectangle with Photo
(
  'Obdélník s fotografii',
  'Rectangle with photo',
  'rectangle-wreath-with-photo',
  'Čtvercový pohřební věnec s růžovými, červenými a fialovými růžemi, černou stuhou. Detaily zahrnují zelené listí a drobné doplňkové květiny. Ideální pro pohřební obřady, smuteční ceremonie a významná rozloučení.',
  'Square funeral wreath with pink, red, and purple roses, black ribbon. Details include green foliage and small accent flowers. Ideal for funeral services, memorial ceremonies, and significant farewells.',
  5400.00,
  (SELECT id FROM categories WHERE slug = 'modern-wreaths'),
  '[
    {"url": "https://cdn.fredonbytes.com/square-funeral-wreath-pink-red-purple-roses-black-ribbon.webp", "alt": "Classic white round funeral wreath", "primary": true},
    {"url": "https://cdn.fredonbytes.com/black-satin-ribbon-coiled.webp", "alt": "Black satin ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-satin-gold-edged-ribbon-natural-light.webp", "alt": "Black satin ribbon with golden edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/white-gold-edge-ribbon-awareness.webp", "alt": "White classic ribbon", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "39x47cm rozměr", "en": "39x47cm size"}, "priceModifier": 0, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 5, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["premium_roses", "careful_handling"]}'::jsonb,
  '{"title": {"cs": "Srdcový věnec z červených růží | Romantické věnce", "en": "Heart Wreath with Red Roses | Romantic Wreaths"}, "description": {"cs": "Romantický srdcový věnec symbolizující věčnou lásku. Prémiové červené růže.", "en": "Romantic heart wreath symbolizing eternal love. Premium red roses."}, "keywords": {"cs": "srdcový věnec, červené růže, láska, partner", "en": "heart wreath, red roses, love, partner"}}'::jsonb,
  false,
  true
),

-- Full Heart
(
  'Plné srdce',
  'Full heart',
  'full-hearth-wreath',
  'Srdcovitý pohřební věnec z bílých chryzantém a fialových růží s černou stuhou se zlatými pruhy. Detailní smuteční aranžmá s bohatým zeleným listím pro pohřební obřady a rozloučení. Kvalitní pohřební květiny jako symbol úcty a lítosti.',
  'Heart-shaped funeral wreath made of white chrysanthemums and purple roses with a black ribbon with gold stripes. Detailed funeral arrangement with rich green foliage for funeral ceremonies and farewells. High-quality funeral flowers as a symbol of respect and sorrow.',
  5700.00,
  (SELECT id FROM categories WHERE slug = 'heart-wreaths'),
  '[
    {"url": "https://cdn.fredonbytes.com/heart-shaped-funeral-wreath-white-chrysanthemums-purple-roses-black-ribbon.webp", "alt": "Hearth shaped funeral wreath, white and purple flowers", "primary": true},
    {"url": "https://cdn.fredonbytes.com/heart-shaped-funeral-wreath-white-chrysanthemums-purple-roses-black-ribbon-detail.webp", "alt": "Detail 1: Hearth shaped funeral wreath, white and purple flowers", "primary": false},
    {"url": "https://cdn.fredonbytes.com/beige-satin-ribbon-marble-surface-dark-background.webp", "alt": "White ribbon with gold border", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-gold-ribbon-funeral-wreath.webp", "alt": "Black ribbon with gold edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/charcoal-satin-ribbon-natural-light.webp", "alt": "Black classic ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/mountain-landscape-view.webp", "alt": "Wreath pink roses and violet flowers", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "45cm průměr", "en": "45cm diameter"}, "priceModifier": 0, "available": true},
        {"id": "size_150", "label": {"cs": "60cm průměr", "en": "60cm diameter"}, "priceModifier": 1000, "available": true},
        {"id": "size_180", "label": {"cs": "75cm průměr", "en": "75cm diameter"}, "priceModifier": 2000, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 8, "estimatedDelivery": "2-3-days", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": false, "specialRequirements": ["designer_consultation"]}'::jsonb,
  '{"title": {"cs": "Moderní asymetrický pohřební věnec | Designové věnce", "en": "Modern Asymmetric Funeral Wreath | Designer Wreaths"}, "description": {"cs": "Současný designový věnec s asymetrickou kompozicí. Unikátní design.", "en": "Contemporary design wreath with asymmetric composition. Unique design."}, "keywords": {"cs": "moderní věnec, asymetrický design, současný pohřeb", "en": "modern wreath, asymmetric design, contemporary funeral"}}'::jsonb,
  false,
  true
),

-- Slanted Heart
(
  'šikmé srdce',
  'Slanted heart',
  'wreath-slanted-hearth',
  'Srdcovitý pohřební věnec z červených růží s bílou gypsofilií, červenými bobulemi a černou stuhou se červenými pruhy. Detailní aranžmá s břečťanem a zeleným listím na dřevěných pamětních deskách. Ideální pro pohřební obřady a rozloučení. Kvalitní smuteční květiny symbolizující hlubokou úctu a upřímnou lítost.',
  'Heart-shaped funeral wreath made of red roses with white gypsophila, red berries, and black ribbon with red stripes. Detailed arrangement with ivy and green foliage on wooden memorial plaques. Ideal for funeral ceremonies and farewells. High-quality funeral flowers symbolizing deep respect and sincere condolences.',
  4800.00,
  (SELECT id FROM categories WHERE slug = 'heart-wreaths'),
  '[
    {"url": "https://cdn.fredonbytes.com/red-rose-funeral-arrangement-berries-babys-breath-black-ribbon.webp", "alt": "Red rose funeral arrandement berries babys breath black ribbon", "primary": true},
    {"url": "https://cdn.fredonbytes.com/red-rose-funeral-arrangement-berries-babys-breath-black-ribbon-detail-1.webp", "alt": "Detail 1: Red rose funeral arrandement berries babys breath black ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/red-rose-funeral-arrangement-berries-babys-breath-black-ribbon-detail-2.webp", "alt": "Detail 2: Red rose funeral arrandement berries babys breath black ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/glossy-black-gold-edge-ribbon-luxury", "alt": "Black ribbon with gold border", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-gold-ribbon-funeral-wreath.webp", "alt": "Black ribbon with gold edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/glossy-black-gold-edge-ribbon-luxury.webp", "alt": "White ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/wiring-lilies-wreath-floral-design.webp", "alt": "The florist creates a wreath", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "50cm průměr", "en": "50cm diameter"}, "priceModifier": 0, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 30, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": false, "specialRequirements": ["weather_resistant"]}'::jsonb,
  '{"title": {"cs": "Trvalý podzimní věnec na hrob | Hrobové věnce", "en": "Permanent Autumn Grave Wreath | Grave Wreaths"}, "description": {"cs": "Odolný podzimní věnec pro dlouhodobou úpravu hrobu. Umělé květiny.", "en": "Durable autumn wreath for long-term grave decoration. Artificial flowers."}, "keywords": {"cs": "hrobový věnec, podzimní, trvalý, umělé květiny", "en": "grave wreath, autumn, permanent, artificial flowers"}}'::jsonb,
  false,
  true
),

-- Heart for Urn - THE PRODUCT YOU'RE LOOKING FOR!
(
  'Srdce na urnu',
  'Heart for urn',
  'hearth-for-urn-wreath',
  'Srdcovitý pohřební věnec s oranžovými gerberami, žlutými chryzantémami, zelenými květy a červenými bobulemi. Ideální pro pohřební obřady, rozloučení a smuteční ceremonie. Kvalitní smuteční květiny jako symbol hluboké úcty a upřímné lítosti.',
  'Heart-shaped funeral wreath with orange gerberas, yellow chrysanthemums, green flowers, and red berries. Ideal for funeral services, farewells, and memorial ceremonies. High-quality funeral flowers as a symbol of deep respect and sincere condolences.',
  4900.00,
  (SELECT id FROM categories WHERE slug = 'heart-wreaths'),
  '[
    {"url": "https://cdn.fredonbytes.com/heart-shaped-orange-gerbera-funeral-wreath-yellow-chrysanthemums.webp", "alt": "Orange hearth for urn", "primary": true},
    {"url": "https://cdn.fredonbytes.com/heart-shaped-orange-gerbera-funeral-wreath-yellow-chrysanthemums-detail.webp", "alt": "Detail 1: Orange hearth for urn", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-satin-ribbon-unspooled-wood.webp", "alt": "Black classic ribbon with strong edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-gold-ribbon-funeral-wreath.webp", "alt": "Black ribbon with gold edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/glossy-black-gold-edge-ribbon-luxury.webp", "alt": "Black ribbon with strong golden edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/white-lily-funeral-wreath-coffin.webp", "alt": "The florist creates a wreath", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "60cm průměr", "en": "60cm diameter"}, "priceModifier": 0, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 3, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": false, "specialRequirements": ["exotic_orchids", "premium_handling"]}'::jsonb,
  '{"title": {"cs": "Fialový věnec s orchidejemi | Luxusní věnce", "en": "Purple Wreath with Orchids | Luxury Wreaths"}, "description": {"cs": "Luxusní fialový věnec s exotickými orchidejemi. Výjimečná elegance.", "en": "Luxury purple wreath with exotic orchids. Exceptional elegance."}, "keywords": {"cs": "fialový věnec, orchideje, luxus, elegance", "en": "purple wreath, orchids, luxury, elegance"}}'::jsonb,
  true,
  true
),

-- Slanted Empty Heart
(
  'šikmé prazdne srdce',
  'Slanted empty heart',
  'slanted-empty-hearth-wreath',
  'Srdcovitý pohřební věnec s žlutými gerberami, bílými chryzantémami a bílými růžemi doplněný černou stuhou se zlatými pruhy. Ideální pro pohřební obřady a rozloučení. Kvalitní smuteční květiny symbolizující hlubokou úctu a upřímnou lítost.',
  'Heart-shaped funeral wreath with yellow gerberas, white chrysanthemums, and white roses, complemented by a black ribbon with gold stripes. Ideal for funeral ceremonies and farewells. High-quality funeral flowers symbolizing deep respect and sincere condolences.',
  5800.00,
  (SELECT id FROM categories WHERE slug = 'heart-wreaths'),
  '[
    {"url": "https://cdn.fredonbytes.com/heart-shaped-yellow-white-funeral-wreath-black-ribbon.webp", "alt": "White hearth wreath with yellow flowers", "primary": true},
    {"url": "https://cdn.fredonbytes.com/heart-shaped-yellow-white-funeral-wreath-black-ribbon-detail-1.webp", "alt": "Detail 1: White hearth wreath with yellow flowers", "primary": false},
    {"url": "https://cdn.fredonbytes.com/heart-shaped-yellow-white-funeral-wreath-black-ribbon-detail-2.webp", "alt": "Detail 2: White hearth wreath with yellow flowers", "primary": false},
    {"url": "https://cdn.fredonbytes.com/beige-satin-ribbon-marble-surface-dark-background.webp", "alt": "White ribbon with gold border", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-gold-edge-ribbon-luxury.webp", "alt": "Black classic ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/white-rose-wreath-making-process.webp", "alt": "The florist creates a wreath", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "80cm rozměr", "en": "80cm size"}, "priceModifier": 0, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 10, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["mixed_flowers"]}'::jsonb,
  '{"title": {"cs": "Smíšený barevný věnec | Pestrobarevné věnce", "en": "Mixed Colorful Wreath | Multicolor Wreaths"}, "description": {"cs": "Pestrobarevný věnec symbolizující bohatství života. Různé druhy květin.", "en": "Colorful wreath symbolizing richness of life. Various flower types."}, "keywords": {"cs": "barevný věnec, smíšené květiny, rozmanitost", "en": "colorful wreath, mixed flowers, diversity"}}'::jsonb,
  false,
  true
),

-- Flower for Coffin
(
  'Květina na rakev',
  'Flower for coffin',
  'flower-for-coffin',
  'Pohřební aranžmá s bílými růžemi, žlutými karafiáty a bílými kaly na dřevěném kmeni. Kvalitní smuteční květiny symbolizující hlubokou úctu a upřímnou lítost.',
  'Funeral arrangement with white roses, yellow carnations, and white calla lilies on a wooden trunk. High-quality funeral flowers symbolizing deep respect and sincere condolences.',
  3500.00,
  (SELECT id FROM categories WHERE slug = 'mourning-bouquets'),
  '[
    {"url": "https://cdn.fredonbytes.com/funeral-arrangement-white-roses-yellow-carnations-wooden-stump.webp", "alt": "Funeral arrangement with white roses for coffin", "primary": true},
    {"url": "https://cdn.fredonbytes.com/funeral-arrangement-white-roses-yellow-carnations-wooden-stump-detail-1.webp", "alt": "Detail 1: Funeral arrangement with white roses for coffin", "primary": false},
    {"url": "https://cdn.fredonbytes.com/beige-satin-ribbon-marble-surface-dark-background.webp", "alt": "White ribbon with gold border", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-gold-ribbon-funeral-wreath.webp", "alt": "Black ribbon with gold edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/charcoal-satin-ribbon-natural-light.webp", "alt": "Black classic ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/florist-hands-arranging-lilies-closeup.webp", "alt": "The florist creates a wreath", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "Jeden rozměr", "en": "One-size"}, "priceModifier": 0, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 12, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["fresh_gerberas"]}'::jsonb,
  '{"title": {"cs": "Žlutý věnec s gerberami | Barevné věnce", "en": "Yellow Wreath with Gerberas | Colorful Wreaths"}, "description": {"cs": "Veselý žlutý věnec symbolizující radost ze života. Čerstvé gerbery.", "en": "Cheerful yellow wreath symbolizing joy of life. Fresh gerberas."}, "keywords": {"cs": "žlutý věnec, gerbery, radost, světlé vzpomínky", "en": "yellow wreath, gerberas, joy, bright memories"}}'::jsonb,
  false,
  true
),

-- Cross
(
  'Kříž',
  'Cross',
  'wreath-cross',
  'Křížový pohřební aranžmá s červenými a bílými růžemi, bílými karafiáty a bílou gypsofilií doplněné černou stuhou.',
  'Cross funeral arrangement with red and white roses, white carnations, and white gypsophila, complemented by a black ribbon.',
  5700.00,
  (SELECT id FROM categories WHERE slug = 'cross-wreaths'),
  '[
    {"url": "https://cdn.fredonbytes.com/cross-shaped-funeral-arrangement-red-white-roses-black-ribbon.webp", "alt": "Cross funeral arrangement with red and white flowers", "primary": true},
    {"url": "https://cdn.fredonbytes.com/beige-satin-ribbon-marble-surface-dark-background.webp", "alt": "White ribbon with gold border", "primary": false},
    {"url": "https://cdn.fredonbytes.com/ivory-satin-ribbon-textured-surface-dark-background.webp", "alt": "Ivory satin ribbon", "primary": false},
    {"url": "https://cdn.fredonbytes.com/black-textured-gold-edge-ribbon-linen.webp", "alt": "Black textured ribbon with light golden edges", "primary": false},
    {"url": "https://cdn.fredonbytes.com/wiring-lilies-wreath-floral-design.webp", "alt": "The florist creates a wreath", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "size_120", "label": {"cs": "80cm rozměr", "en": "80cm size"}, "priceModifier": 0, "available": true}
      ]
    },
    {
      "id": "ribbon",
      "type": "ribbon",
      "name": {"cs": "Stuha", "en": "Ribbon"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "ribbon_yes", "label": {"cs": "Ano, přidat stuhu", "en": "Yes, add ribbon"}, "priceModifier": 0},
        {"id": "ribbon_no", "label": {"cs": "Nechci stuhu", "en": "No, without ribbon"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_color",
      "type": "ribbon_color",
      "name": {"cs": "Barva stuhy", "en": "Ribbon Color"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "color_black", "label": {"cs": "Černá", "en": "Black"}, "priceModifier": 0},
        {"id": "color_white", "label": {"cs": "Bílá", "en": "White"}, "priceModifier": 0}
      ]
    },
    {
      "id": "ribbon_text",
      "type": "ribbon_text",
      "name": {"cs": "Text na stuze", "en": "Ribbon Text"},
      "required": false,
      "dependsOn": {
        "optionId": "ribbon",
        "condition": "selected",
        "requiredChoiceIds": ["ribbon_yes"]
      },
      "choices": [
        {"id": "text_sympathy", "label": {"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
        {"id": "text_memory", "label": {"cs": "Na věčnou památku", "en": "In eternal memory"}, "priceModifier": 50},
        {"id": "text_love", "label": {"cs": "S láskou vzpomínáme", "en": "With love we remember"}, "priceModifier": 50},
        {"id": "text_respect", "label": {"cs": "S úctou a respektem", "en": "With honor and respect"}, "priceModifier": 50},
        {"id": "text_custom", "label": {"cs": "Vlastní text", "en": "Custom text"}, "priceModifier": 100, "allowCustomInput": true, "maxLength": 50}
      ]
    },
    {
      "id": "delivery_time",
      "type": "delivery",
      "name": {"cs": "Čas dodání", "en": "Delivery Time"},
      "required": true,
      "maxSelections": 1,
      "minSelections": 1,
      "choices": [
        {"id": "next_day_morning", "label": {"cs": "Následující den ráno (do 10:00)", "en": "Next day morning (by 10:00 AM)"}, "priceModifier": 0, "available": true},
        {"id": "custom_date", "label": {"cs": "Vlastní datum (kalendář)", "en": "Custom date (calendar)"}, "priceModifier": 0, "available": true, "inputType": "date", "maxDaysFromNow": 30, "minDaysFromNow": 1, "allowCustomInput": true, "requiresCalendar": true}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 15, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["seasonal_flowers"]}'::jsonb,
  '{"title": {"cs": "Jarní sezónní kytice | Sezónní květiny", "en": "Seasonal Spring Bouquet | Seasonal Flowers"}, "description": {"cs": "Svěží jarní kytice symbolizující nový začátek. Sezónní květiny.", "en": "Fresh spring bouquet symbolizing new beginning. Seasonal flowers."}, "keywords": {"cs": "jarní kytice, tulipány, narcisy, naděje", "en": "spring bouquet, tulips, daffodils, hope"}}'::jsonb,
  true,
  true
)

ON CONFLICT (slug) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  name_en = EXCLUDED.name_en,
  description_cs = EXCLUDED.description_cs,
  description_en = EXCLUDED.description_en,
  base_price = EXCLUDED.base_price,
  category_id = EXCLUDED.category_id,
  images = EXCLUDED.images,
  customization_options = EXCLUDED.customization_options,
  availability = EXCLUDED.availability,
  seo_metadata = EXCLUDED.seo_metadata,
  featured = EXCLUDED.featured,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Update product availability for all products
DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN SELECT id FROM products LOOP
        PERFORM update_product_availability(
            product_record.id,
            jsonb_build_object(
                'inStock', true,
                'quantity', (RANDOM() * 30 + 5)::INTEGER,
                'lastUpdated', NOW(),
                'seasonalAvailability', true,
                'specialRequirements', '[]'::jsonb
            )
        );
    END LOOP;
END $$;
