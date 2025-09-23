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
 (SELECT id FROM categories WHERE slug = 'funeral-wreaths'), 3, true)

ON CONFLICT (slug) DO UPDATE SET
  name_cs = EXCLUDED.name_cs,
  name_en = EXCLUDED.name_en,
  description_cs = EXCLUDED.description_cs,
  description_en = EXCLUDED.description_en,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Standardized customisation_options for ALL products
-- This ensures consistency across the entire product catalog

-- Insert comprehensive products with standardized customization_options
INSERT INTO products (
  name_cs, name_en, slug, description_cs, description_en,
  base_price, category_id, images, customization_options, availability, seo_metadata, featured, active
) VALUES

-- Classic Funeral Wreaths
(
  'Klasický bílý pohřební věnec',
  'Classic White Funeral Wreath',
  'classic-white-funeral-wreath',
  'Tradiční pohřební věnec z čerstvých bílých chryzantém, růží a zelených listů. Elegantní a důstojný design vhodný pro všechny typy pohřebních obřadů. Věnec je ručně vyráběn našimi zkušenými floristy s důrazem na kvalitu a detail.',
  'Traditional funeral wreath made from fresh white chrysanthemums, roses and green leaves. Elegant and dignified design suitable for all types of funeral ceremonies. The wreath is handcrafted by our experienced florists with emphasis on quality and detail.',
  1200.00,
  (SELECT id FROM categories WHERE slug = 'classic-wreaths'),
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-001.png", "alt": "Klasický bílý pohřební věnec", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-002.png", "alt": "Detail bílých chryzantém", "primary": false},
    {"url": "/funeral-wreaths-and-floral-arrangement-003.png", "alt": "Celkový pohled na věnec", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
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
      "choices": [
        {"id": "standard", "label": {"cs": "Standardní (následující den)", "en": "Standard (next day)"}, "priceModifier": 0},
        {"id": "express", "label": {"cs": "Expresní (do 12 hodin)", "en": "Express (within 12 hours)"}, "priceModifier": 200},
        {"id": "same-day", "label": {"cs": "Tentýž den (do 4 hodin)", "en": "Same day (within 4 hours)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 25, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": []}'::jsonb,
  '{"title": {"cs": "Klasický bílý pohřební věnec | Pohřební věnce", "en": "Classic White Funeral Wreath | Funeral Wreaths"}, "description": {"cs": "Tradiční bílý pohřební věnec z čerstvých květin. Rychlé dodání po celé ČR.", "en": "Traditional white funeral wreath from fresh flowers. Fast delivery across Czech Republic."}, "keywords": {"cs": "pohřební věnec, bílý věnec, chryzantémy, pohřeb", "en": "funeral wreath, white wreath, chrysanthemums, funeral"}}'::jsonb,
  true,
  true
),

(
  'Růžový smuteční věnec s liliemi',
  'Pink Mourning Wreath with Lilies',
  'pink-mourning-wreath-lilies',
  'Jemný smuteční věnec s růžovými růžemi, bílými liliemi a zelenými listy. Symbolizuje lásku, naději a věčnou vzpomínku. Ideální pro rozloučení s blízkými osobami, zejména ženami a mladými lidmi.',
  'Gentle mourning wreath with pink roses, white lilies and green leaves. Symbolizes love, hope and eternal memory. Ideal for farewell to loved ones, especially women and young people.',
  1500.00,
  (SELECT id FROM categories WHERE slug = 'classic-wreaths'),
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-004.png", "alt": "Růžový smuteční věnec s liliemi", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-005.png", "alt": "Detail růžových růží", "primary": false},
    {"url": "/funeral-wreaths-and-floral-arrangement-006.png", "alt": "Bílé lilie v kompozici", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
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
      "choices": [
        {"id": "standard", "label": {"cs": "Standardní (následující den)", "en": "Standard (next day)"}, "priceModifier": 0},
        {"id": "express", "label": {"cs": "Expresní (do 12 hodin)", "en": "Express (within 12 hours)"}, "priceModifier": 200},
        {"id": "same-day", "label": {"cs": "Tentýž den (do 4 hodin)", "en": "Same day (within 4 hours)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 15, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["fresh_lilies"]}'::jsonb,
  '{"title": {"cs": "Růžový smuteční věnec s liliemi | Pohřební květiny", "en": "Pink Mourning Wreath with Lilies | Funeral Flowers"}, "description": {"cs": "Jemný růžový věnec s liliemi pro důstojné rozloučení. Expresní dodání.", "en": "Gentle pink wreath with lilies for dignified farewell. Express delivery."}, "keywords": {"cs": "růžový věnec, lilie, smuteční květiny, pohřeb ženy", "en": "pink wreath, lilies, mourning flowers, woman funeral"}}'::jsonb,
  true,
  true
),
-- Modern Wreaths
(
  'Moderní asymetrický věnec',
  'Modern Asymmetric Wreath',
  'modern-asymmetric-wreath',
  'Současný designový věnec s asymetrickou kompozicí. Kombinuje tradiční květiny s moderními prvky jako jsou sukulenty a netradiční zelené rostliny. Vhodný pro mladší generaci a milovníky moderního designu.',
  'Contemporary design wreath with asymmetric composition. Combines traditional flowers with modern elements such as succulents and non-traditional green plants. Suitable for younger generation and lovers of modern design.',
  1800.00,
  (SELECT id FROM categories WHERE slug = 'modern-wreaths'),
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-007.png", "alt": "Moderní asymetrický věnec", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-008.png", "alt": "Detail moderní kompozice", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
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
      "choices": [
        {"id": "standard", "label": {"cs": "Standardní (následující den)", "en": "Standard (next day)"}, "priceModifier": 0},
        {"id": "express", "label": {"cs": "Expresní (do 12 hodin)", "en": "Express (within 12 hours)"}, "priceModifier": 200},
        {"id": "same-day", "label": {"cs": "Tentýž den (do 4 hodin)", "en": "Same day (within 4 hours)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 8, "estimatedDelivery": "2-3-days", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": false, "specialRequirements": ["designer_consultation"]}'::jsonb,
  '{"title": {"cs": "Moderní asymetrický pohřební věnec | Designové věnce", "en": "Modern Asymmetric Funeral Wreath | Designer Wreaths"}, "description": {"cs": "Současný designový věnec s asymetrickou kompozicí. Unikátní design.", "en": "Contemporary design wreath with asymmetric composition. Unique design."}, "keywords": {"cs": "moderní věnec, asymetrický design, současný pohřeb", "en": "modern wreath, asymmetric design, contemporary funeral"}}'::jsonb,
  false,
  true
),

-- Heart Wreaths
(
  'Srdcový věnec z červených růží',
  'Heart Wreath with Red Roses',
  'heart-wreath-red-roses',
  'Romantický srdcový věnec z červených růží symbolizující věčnou lásku a oddanost. Ideální pro rozloučení s životním partnerem nebo partnerkou. Ručně vyráběný s největší péčí a citem.',
  'Romantic heart wreath with red roses symbolizing eternal love and devotion. Ideal for farewell to life partner. Handcrafted with the greatest care and sensitivity.',
  2200.00,
  (SELECT id FROM categories WHERE slug = 'heart-wreaths'),
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-009.png", "alt": "Srdcový věnec z červených růží", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-010.png", "alt": "Detail červených růží", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
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
      "choices": [
        {"id": "standard", "label": {"cs": "Standardní (následující den)", "en": "Standard (next day)"}, "priceModifier": 0},
        {"id": "express", "label": {"cs": "Expresní (do 12 hodin)", "en": "Express (within 12 hours)"}, "priceModifier": 200},
        {"id": "same-day", "label": {"cs": "Tentýž den (do 4 hodin)", "en": "Same day (within 4 hours)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 5, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["premium_roses", "careful_handling"]}'::jsonb,
  '{"title": {"cs": "Srdcový věnec z červených růží | Romantické věnce", "en": "Heart Wreath with Red Roses | Romantic Wreaths"}, "description": {"cs": "Romantický srdcový věnec symbolizující věčnou lásku. Prémiové červené růže.", "en": "Romantic heart wreath symbolizing eternal love. Premium red roses."}, "keywords": {"cs": "srdcový věnec, červené růže, láska, partner", "en": "heart wreath, red roses, love, partner"}}'::jsonb,
  true,
  true
),
-- Mourning Bouquets
(
  'Elegantní bílá smuteční kytice',
  'Elegant White Mourning Bouquet',
  'elegant-white-mourning-bouquet',
  'Elegantní smuteční kytice z bílých a krémových květin včetně růží, lilií a eustomy. Vázaná v klasickém stylu s přírodními materiály. Vhodná pro položení k rakvi nebo jako dar pozůstalým.',
  'Elegant mourning bouquet made from white and cream flowers including roses, lilies and eustoma. Tied in classic style with natural materials. Suitable for placing by the coffin or as a gift to the bereaved.',
  800.00,
  (SELECT id FROM categories WHERE slug = 'mourning-bouquets'),
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-011.png", "alt": "Elegantní bílá smuteční kytice", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-012.png", "alt": "Detail bílých květin", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
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
      "choices": [
        {"id": "standard", "label": {"cs": "Standardní (následující den)", "en": "Standard (next day)"}, "priceModifier": 0},
        {"id": "express", "label": {"cs": "Expresní (do 12 hodin)", "en": "Express (within 12 hours)"}, "priceModifier": 200},
        {"id": "same-day", "label": {"cs": "Tentýž den (do 4 hodin)", "en": "Same day (within 4 hours)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 20, "estimatedDelivery": "same-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": []}'::jsonb,
  '{"title": {"cs": "Elegantní bílá smuteční kytice | Smuteční květiny", "en": "Elegant White Mourning Bouquet | Mourning Flowers"}, "description": {"cs": "Elegantní bílá kytice pro vyjádření soustrasti. Dodání tentýž den.", "en": "Elegant white bouquet to express condolences. Same-day delivery."}, "keywords": {"cs": "smuteční kytice, bílé květiny, kondolence", "en": "mourning bouquet, white flowers, condolences"}}'::jsonb,
  false,
  true
),

-- Grave Wreaths
(
  'Trvalý věnec na hrob - podzimní',
  'Permanent Grave Wreath - Autumn',
  'permanent-grave-wreath-autumn',
  'Trvalý věnec z umělých květin v podzimních barvách pro dlouhodobou úpravu hrobu. Odolný vůči povětrnostním vlivům, vydrží celou sezónu. Kombinuje oranžové, žluté a hnědé tóny s přírodními prvky.',
  'Permanent wreath made from artificial flowers in autumn colors for long-term grave decoration. Weather resistant, lasts the entire season. Combines orange, yellow and brown tones with natural elements.',
  900.00,
  (SELECT id FROM categories WHERE slug = 'grave-wreaths'),
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-013.png", "alt": "Trvalý podzimní věnec na hrob", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-014.png", "alt": "Detail podzimních barev", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
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
      "choices": [
        {"id": "standard", "label": {"cs": "Standardní (následující den)", "en": "Standard (next day)"}, "priceModifier": 0},
        {"id": "express", "label": {"cs": "Expresní (do 12 hodin)", "en": "Express (within 12 hours)"}, "priceModifier": 200},
        {"id": "same-day", "label": {"cs": "Tentýž den (do 4 hodin)", "en": "Same day (within 4 hours)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 30, "estimatedDelivery": "2-3-days", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": false, "specialRequirements": ["weather_resistant"]}'::jsonb,
  '{"title": {"cs": "Trvalý podzimní věnec na hrob | Hrobové věnce", "en": "Permanent Autumn Grave Wreath | Grave Wreaths"}, "description": {"cs": "Odolný podzimní věnec pro dlouhodobou úpravu hrobu. Umělé květiny.", "en": "Durable autumn wreath for long-term grave decoration. Artificial flowers."}, "keywords": {"cs": "hrobový věnec, podzimní, trvalý, umělé květiny", "en": "grave wreath, autumn, permanent, artificial flowers"}}'::jsonb,
  false,
  true
),

-- Mourning Decorations
(
  'Smuteční svíčka s květinovou dekorací',
  'Mourning Candle with Floral Decoration',
  'mourning-candle-floral-decoration',
  'Elegantní smuteční svíčka obklopená jemnou květinovou dekorací. Symbolizuje světlo a naději v temných chvílích. Vhodná jako doplněk k hlavní květinové výzdobě nebo jako samostatný dar.',
  'Elegant mourning candle surrounded by delicate floral decoration. Symbolizes light and hope in dark moments. Suitable as a complement to main floral decoration or as a standalone gift.',
  350.00,
  (SELECT id FROM categories WHERE slug = 'mourning-decorations'),
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-015.png", "alt": "Smuteční svíčka s květinovou dekorací", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-016.png", "alt": "Detail květinové dekorace", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
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
      "choices": [
        {"id": "standard", "label": {"cs": "Standardní (následující den)", "en": "Standard (next day)"}, "priceModifier": 0},
        {"id": "express", "label": {"cs": "Expresní (do 12 hodin)", "en": "Express (within 12 hours)"}, "priceModifier": 200},
        {"id": "same-day", "label": {"cs": "Tentýž den (do 4 hodin)", "en": "Same day (within 4 hours)"}, "priceModifier": 400}
      ]
    }
  ]'::jsonb,
  '{"inStock": true, "quantity": 50, "estimatedDelivery": "same-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["fragile_handling"]}'::jsonb,
  '{"title": {"cs": "Smuteční svíčka s květinovou dekorací | Smuteční doplňky", "en": "Mourning Candle with Floral Decoration | Mourning Accessories"}, "description": {"cs": "Elegantní smuteční svíčka s jemnou květinovou dekorací. Rychlé dodání.", "en": "Elegant mourning candle with delicate floral decoration. Fast delivery."}, "keywords": {"cs": "smuteční svíčka, květinová dekorace, kondolence", "en": "mourning candle, floral decoration, condolences"}}'::jsonb,
  false,
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
