-- Migration: Add optimized indexes for product queries
-- Date: 2025-01-08
-- Purpose: Improve product query performance with additional indexes

-- Add composite index for common product filtering (active + category)
CREATE INDEX IF NOT EXISTS idx_products_active_category 
ON products(active, category_id) 
WHERE active = true;

-- Add composite index for featured products query
CREATE INDEX IF NOT EXISTS idx_products_active_featured 
ON products(active, featured, created_at DESC) 
WHERE active = true AND featured = true;

-- Add index for price range queries
CREATE INDEX IF NOT EXISTS idx_products_base_price 
ON products(base_price);

-- Add composite index for category + price filtering
CREATE INDEX IF NOT EXISTS idx_products_category_price 
ON products(category_id, base_price) 
WHERE active = true;

-- Add GIN index for full-text search on product names and descriptions
CREATE INDEX IF NOT EXISTS idx_products_search_cs 
ON products USING gin(to_tsvector('simple', name_cs || ' ' || COALESCE(description_cs, '')));

CREATE INDEX IF NOT EXISTS idx_products_search_en 
ON products USING gin(to_tsvector('english', name_en || ' ' || COALESCE(description_en, '')));

-- Add index for sorting by created_at (most common sort)
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc 
ON products(created_at DESC) 
WHERE active = true;

-- Add index for availability queries (JSONB)
CREATE INDEX IF NOT EXISTS idx_products_availability 
ON products USING gin(availability);

-- Add composite index for admin queries (all products regardless of active status)
CREATE INDEX IF NOT EXISTS idx_products_admin_list 
ON products(created_at DESC, active);

-- Analyze tables to update statistics for query planner
ANALYZE products;
ANALYZE categories;

-- Add comments for documentation
COMMENT ON INDEX idx_products_active_category IS 'Optimizes queries filtering by active status and category';
COMMENT ON INDEX idx_products_active_featured IS 'Optimizes featured products queries with sorting';
COMMENT ON INDEX idx_products_base_price IS 'Optimizes price range filtering';
COMMENT ON INDEX idx_products_category_price IS 'Optimizes category + price range queries';
COMMENT ON INDEX idx_products_search_cs IS 'Full-text search index for Czech content';
COMMENT ON INDEX idx_products_search_en IS 'Full-text search index for English content';
COMMENT ON INDEX idx_products_created_at_desc IS 'Optimizes default product listing sort';
COMMENT ON INDEX idx_products_availability IS 'Optimizes availability/stock queries';
COMMENT ON INDEX idx_products_admin_list IS 'Optimizes admin product management queries';
