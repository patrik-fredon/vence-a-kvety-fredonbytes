-- Sample seed data for development and testing
-- Run this after the main setup.sql script
-- This file seeds 13 products with standardized customization_options
-- Categories are assumed to exist (should be seeded separately)

-- Insert 13 sample products with identical customization_options
INSERT INTO products (
  name_cs, name_en, slug, description_cs, description_en,
  base_price, category_id, images, customization_options, availability, seo_metadata, featured, active
) VALUES

-- Product 1: Classic White Funeral Wreath
(
  'Klasický bílý pohřební věnec',
  'Classic White Funeral Wreath',
  'classic-white-funeral-wreath',
  'Tradiční pohřební věnec z čerstvých bílých chryzantém, růží a zelených listů. Elegantní a důstojný design vhodný pro všechny typy pohřebních obřadů. Věnec je ručně vyráběn našimi zkušenými floristy s důrazem na kvalitu a detail.',
  'Traditional funeral wreath made from fresh white chrysanthemums, roses and green leaves. Elegant and dignified design suitable for all types of funeral ceremonies. The wreath is handcrafted by our experienced florists with emphasis on quality and detail.',
  1200.00,
  1, -- Funeral Wreaths category
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
      "minSelections": 1,
      "maxSelections": 1,
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
-- Product 2: Pink Mourning Wreath with Lilies
(
  'Růžový smuteční věnec s liliemi',
  'Pink Mourning Wreath with Lilies',
  'pink-mourning-wreath-lilies',
  'Jemný smuteční věnec s růžovými růžemi, bílými liliemi a zelenými listy. Symbolizuje lásku, naději a věčnou vzpomínku. Ideální pro rozloučení s blízkými osobami, zejména ženami a mladými lidmi.',
  'Gentle mourning wreath with pink roses, white lilies and green leaves. Symbolizes love, hope and eternal memory. Ideal for farewell to loved ones, especially women and young people.',
  1500.00,
  1, -- Funeral Wreaths category
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
      "minSelections": 1,
      "maxSelections": 1,
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

-- Product 3: Modern Asymmetric Wreath
(
  'Moderní asymetrický věnec',
  'Modern Asymmetric Wreath',
  'modern-asymmetric-wreath',
  'Současný designový věnec s asymetrickou kompozicí. Kombinuje tradiční květiny s moderními prvky jako jsou sukulenty a netradiční zelené rostliny. Vhodný pro mladší generaci a milovníky moderního designu.',
  'Contemporary design wreath with asymmetric composition. Combines traditional flowers with modern elements such as succulents and non-traditional green plants. Suitable for younger generation and lovers of modern design.',
  1800.00,
  1, -- Funeral Wreaths category
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
      "minSelections": 1,
      "maxSelections": 1,
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
-- Product 4: Heart Wreath with Red Roses
(
  'Srdcový věnec z červených růží',
  'Heart Wreath with Red Roses',
  'heart-wreath-red-roses',
  'Romantický srdcový věnec z červených růží symbolizující věčnou lásku a oddanost. Ideální pro rozloučení s životním partnerem nebo partnerkou. Ručně vyráběný s největší péčí a citem.',
  'Romantic heart wreath with red roses symbolizing eternal love and devotion. Ideal for farewell to life partner. Handcrafted with the greatest care and sensitivity.',
  2200.00,
  1, -- Funeral Wreaths category
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
      "minSelections": 1,
      "maxSelections": 1,
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

-- Product 5: Elegant White Mourning Bouquet
(
  'Elegantní bílá smuteční kytice',
  'Elegant White Mourning Bouquet',
  'elegant-white-mourning-bouquet',
  'Elegantní smuteční kytice z bílých a krémových květin včetně růží, lilií a eustomy. Vázaná v klasickém stylu s přírodními materiály. Vhodná pro položení k rakvi nebo jako dar pozůstalým.',
  'Elegant mourning bouquet made from white and cream flowers including roses, lilies and eustoma. Tied in classic style with natural materials. Suitable for placing by the coffin or as a gift to the bereaved.',
  800.00,
  2, -- Mourning Bouquets category
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
      "minSelections": 1,
      "maxSelections": 1,
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
-- Product 6: Permanent Grave Wreath - Autumn
(
  'Trvalý věnec na hrob - podzimní',
  'Permanent Grave Wreath - Autumn',
  'permanent-grave-wreath-autumn',
  'Trvalý věnec z umělých květin v podzimních barvách pro dlouhodobou úpravu hrobu. Odolný vůči povětrnostním vlivům, vydrží celou sezónu. Kombinuje oranžové, žluté a hnědé tóny s přírodními prvky.',
  'Permanent wreath made from artificial flowers in autumn colors for long-term grave decoration. Weather resistant, lasts the entire season. Combines orange, yellow and brown tones with natural elements.',
  900.00,
  3, -- Grave Wreaths category
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
      "minSelections": 1,
      "maxSelections": 1,
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
        {"id": "text_sympathy", "label":{"cs": "S upřímnou soustrasti", "en": "With sincere sympathy"}, "priceModifier": 50},
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

-- Product 7: Mourning Candle with Floral Decoration
(
  'Smuteční svíčka s květinovou dekorací',
  'Mourning Candle with Floral Decoration',
  'mourning-candle-floral-decoration',
  'Elegantní smuteční svíčka obklopená jemnou květinovou dekorací. Symbolizuje světlo a naději v temných chvílích. Vhodná jako doplněk k hlavní květinové výzdobě nebo jako samostatný dar.',
  'Elegant mourning candle surrounded by delicate floral decoration. Symbolizes light and hope in dark moments. Suitable as a complement to main floral decoration or as a standalone gift.',
  350.00,
  4, -- Mourning Decorations category
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
      "minSelections": 1,
      "maxSelections": 1,
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
),
-- Product 8: Yellow Wreath with Gerberas
(
  'Žlutý věnec s gerberami',
  'Yellow Wreath with Gerberas',
  'yellow-wreath-gerberas',
  'Veselý žlutý věnec s čerstvými gerberami a slunečnicemi. Symbolizuje radost ze života a světlé vzpomínky. Ideální pro rozloučení s osobami, které milovali život a přírodu.',
  'Cheerful yellow wreath with fresh gerberas and sunflowers. Symbolizes joy of life and bright memories. Ideal for farewell to people who loved life and nature.',
  1350.00,
  1, -- Funeral Wreaths category
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-017.png", "alt": "Žlutý věnec s gerberami", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-018.png", "alt": "Detail žlutých gerber", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "minSelections": 1,
      "maxSelections": 1,
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
  '{"inStock": true, "quantity": 12, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["fresh_gerberas"]}'::jsonb,
  '{"title": {"cs": "Žlutý věnec s gerberami | Barevné věnce", "en": "Yellow Wreath with Gerberas | Colorful Wreaths"}, "description": {"cs": "Veselý žlutý věnec symbolizující radost ze života. Čerstvé gerbery.", "en": "Cheerful yellow wreath symbolizing joy of life. Fresh gerberas."}, "keywords": {"cs": "žlutý věnec, gerbery, radost, světlé vzpomínky", "en": "yellow wreath, gerberas, joy, bright memories"}}'::jsonb,
  false,
  true
),

-- Product 9: Purple Wreath with Orchids
(
  'Fialový věnec s orchidejemi',
  'Purple Wreath with Orchids',
  'purple-wreath-orchids',
  'Luxusní fialový věnec s exotickými orchidejemi a fialovými růžemi. Symbolizuje eleganci, důstojnost a vzácnost. Vhodný pro rozloučení s výjimečnými osobnostmi.',
  'Luxury purple wreath with exotic orchids and purple roses. Symbolizes elegance, dignity and rarity. Suitable for farewell to exceptional personalities.',
  2500.00,
  1, -- Funeral Wreaths category
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-019.png", "alt": "Fialový věnec s orchidejemi", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-020.png", "alt": "Detail fialových orchidejí", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "minSelections": 1,
      "maxSelections": 1,
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
  '{"inStock": true, "quantity": 3, "estimatedDelivery": "2-3-days", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": false, "specialRequirements": ["exotic_orchids", "premium_handling"]}'::jsonb,
  '{"title": {"cs": "Fialový věnec s orchidejemi | Luxusní věnce", "en": "Purple Wreath with Orchids | Luxury Wreaths"}, "description": {"cs": "Luxusní fialový věnec s exotickými orchidejemi. Výjimečná elegance.", "en": "Luxury purple wreath with exotic orchids. Exceptional elegance."}, "keywords": {"cs": "fialový věnec, orchideje, luxus, elegance", "en": "purple wreath, orchids, luxury, elegance"}}'::jsonb,
  true,
  true
),
-- Product 10: Mixed Colorful Wreath
(
  'Smíšený barevný věnec',
  'Mixed Colorful Wreath',
  'mixed-colorful-wreath',
  'Pestrobarevný věnec kombinující různé druhy květin v harmonických barvách. Obsahuje růže, gerbery, chryzantémy a sezónní květiny. Symbolizuje rozmanitost a bohatost života.',
  'Colorful wreath combining various flower types in harmonious colors. Contains roses, gerberas, chrysanthemums and seasonal flowers. Symbolizes diversity and richness of life.',
  1650.00,
  1, -- Funeral Wreaths category
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-021.png", "alt": "Smíšený barevný věnec", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-022.png", "alt": "Detail barevných květin", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "minSelections": 1,
      "maxSelections": 1,
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
  '{"inStock": true, "quantity": 10, "estimatedDelivery": "next-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["mixed_flowers"]}'::jsonb,
  '{"title": {"cs": "Smíšený barevný věnec | Pestrobarevné věnce", "en": "Mixed Colorful Wreath | Multicolor Wreaths"}, "description": {"cs": "Pestrobarevný věnec symbolizující bohatství života. Různé druhy květin.", "en": "Colorful wreath symbolizing richness of life. Various flower types."}, "keywords": {"cs": "barevný věnec, smíšené květiny, rozmanitost", "en": "colorful wreath, mixed flowers, diversity"}}'::jsonb,
  false,
  true
),

-- Product 11: Minimalist White Wreath
(
  'Minimalistický bílý věnec',
  'Minimalist White Wreath',
  'minimalist-white-wreath',
  'Jednoduchý a elegantní bílý věnec v minimalistickém stylu. Obsahuje pouze bílé růže a zelené listy v čisté kompozici. Symbolizuje čistotu, jednoduchost a klid.',
  'Simple and elegant white wreath in minimalist style. Contains only white roses and green leaves in clean composition. Symbolizes purity, simplicity and peace.',
  1100.00,
  1, -- Funeral Wreaths category
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-023.png", "alt": "Minimalistický bílý věnec", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-024.png", "alt": "Detail minimalistické kompozice", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "minSelections": 1,
      "maxSelections": 1,
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
  '{"inStock": true, "quantity": 18, "estimatedDelivery": "same-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": []}'::jsonb,
  '{"title": {"cs": "Minimalistický bílý věnec | Jednoduché věnce", "en": "Minimalist White Wreath | Simple Wreaths"}, "description": {"cs": "Jednoduchý bílý věnec v minimalistickém stylu. Čistá elegance.", "en": "Simple white wreath in minimalist style. Pure elegance."}, "keywords": {"cs": "minimalistický věnec, jednoduchost, čistota", "en": "minimalist wreath, simplicity, purity"}}'::jsonb,
  false,
  true
),
-- Product 12: Luxury Premium Wreath
(
  'Luxusní prémiový věnec',
  'Luxury Premium Wreath',
  'luxury-premium-wreath',
  'Nejluxusnější věnec z naší nabídky vyrobený z nejkvalitnějších importovaných květin. Obsahuje prémiové růže, orchideje, lilie a vzácné exotické květiny. Symbolizuje výjimečnost a úctu.',
  'The most luxurious wreath from our offer made from the highest quality imported flowers. Contains premium roses, orchids, lilies and rare exotic flowers. Symbolizes uniqueness and respect.',
  3500.00,
  1, -- Funeral Wreaths category
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-025.png", "alt": "Luxusní prémiový věnec", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-026.png", "alt": "Detail prémiových květin", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "minSelections": 1,
      "maxSelections": 1,
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
  '{"inStock": true, "quantity": 2, "estimatedDelivery": "3-5-days", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": false, "specialRequirements": ["premium_flowers", "master_florist", "special_handling"]}'::jsonb,
  '{"title": {"cs": "Luxusní prémiový věnec | Exkluzivní věnce", "en": "Luxury Premium Wreath | Exclusive Wreaths"}, "description": {"cs": "Nejluxusnější věnec z importovaných prémiových květin. Výjimečná kvalita.", "en": "Most luxurious wreath from imported premium flowers. Exceptional quality."}, "keywords": {"cs": "luxusní věnec, prémiové květiny, exkluzivní", "en": "luxury wreath, premium flowers, exclusive"}}'::jsonb,
  true,
  true
),

-- Product 13: Seasonal Spring Bouquet
(
  'Jarní sezónní kytice',
  'Seasonal Spring Bouquet',
  'seasonal-spring-bouquet',
  'Svěží jarní kytice z tulipánů, narcisů a prvosenek v jemných pastelových barvách. Symbolizuje nový začátek, naději a obnovu života. Ideální pro jarní rozloučení.',
  'Fresh spring bouquet with tulips, daffodils and primroses in gentle pastel colors. Symbolizes new beginning, hope and renewal of life. Ideal for spring farewell.',
  650.00,
  2, -- Mourning Bouquets category
  '[
    {"url": "/funeral-wreaths-and-floral-arrangement-027.png", "alt": "Jarní sezónní kytice", "primary": true},
    {"url": "/funeral-wreaths-and-floral-arrangement-028.png", "alt": "Detail jarních květin", "primary": false}
  ]'::jsonb,
  '[
    {
      "id": "size",
      "type": "size",
      "name": {"cs": "Velikost", "en": "Size"},
      "required": true,
      "minSelections": 1,
      "maxSelections": 1,
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
  '{"inStock": true, "quantity": 15, "estimatedDelivery": "same-day", "lastUpdated": "2024-01-15T10:00:00Z", "seasonalAvailability": true, "specialRequirements": ["seasonal_flowers"]}'::jsonb,
  '{"title": {"cs": "Jarní sezónní kytice | Sezónní květiny", "en": "Seasonal Spring Bouquet | Seasonal Flowers"}, "description": {"cs": "Svěží jarní kytice symbolizující nový začátek. Sezónní květiny.", "en": "Fresh spring bouquet symbolizing new beginning. Seasonal flowers."}, "keywords": {"cs": "jarní kytice, tulipány, narcisy, naděje", "en": "spring bouquet, tulips, daffodils, hope"}}'::jsonb,
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

-- Sample order status for testing
INSERT INTO order_status_log (order_id, old_status, new_status) VALUES
(gen_random_uuid(), 'pending', 'confirmed');

-- Update product availability for testing
-- Note: This assumes the update_product_availability function exists
-- If it doesn't exist, you can remove this section or create the function
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_product_availability') THEN
    PERFORM update_product_availability(
      (SELECT id FROM products WHERE slug = 'classic-white-funeral-wreath'),
      '{"inStock": true, "quantity": 25, "lastUpdated": "2024-01-15T10:00:00Z"}'::jsonb
    );
  END IF;
END $$;
