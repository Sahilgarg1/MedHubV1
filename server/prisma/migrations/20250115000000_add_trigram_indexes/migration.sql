-- Add trigram indexes for faster similarity searches
-- These indexes will significantly improve the performance of fuzzy matching queries

-- Index for product_name trigram similarity searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_name_trgm_idx ON "Product" USING gin (product_name gin_trgm_ops);

-- Index for lowercased product_name trigram similarity searches (used in queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_name_lower_trgm_idx ON "Product" USING gin (lower(product_name) gin_trgm_ops);

-- Composite index for manufacturer + similarity searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_manufacturer_name_trgm_idx ON "Product" USING gin (manufacturer gin_trgm_ops, lower(product_name) gin_trgm_ops);

-- Index for distributors array operations (for faster array_append/array_remove)
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_distributors_gin_idx ON "Product" USING gin (distributors);
