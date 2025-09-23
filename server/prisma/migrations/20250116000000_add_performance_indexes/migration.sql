-- Add performance indexes for inventory operations
-- These indexes will significantly improve the performance of inventory updates and deletions

-- Index for faster array operations on distributors
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_distributors_btree_idx ON "Product" USING btree (distributors);

-- Index for faster product lookups by ID (if not already exists)
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_id_btree_idx ON "Product" USING btree (id);

-- Index for faster bid lookups by wholesaler and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS bid_wholesaler_status_idx ON "Bid" USING btree (wholesalerId, status);

-- Index for faster cart operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS cart_user_product_idx ON "Cart" USING btree (userId, productId);

-- Index for faster order lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS order_retailer_wholesaler_idx ON "Order" USING btree (retailerId, wholesalerId);

-- Index for faster order bucket lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS order_bucket_retailer_wholesaler_idx ON "OrderBucket" USING btree (retailerId, wholesalerId);

-- Index for faster bid request lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS bid_request_retailer_status_idx ON "BidRequest" USING btree (retailerId, status);

-- Composite index for product name and manufacturer searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_name_manufacturer_idx ON "Product" USING btree (product_name, manufacturer);

-- Index for faster MRP lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_mrp_idx ON "Product" USING btree (mrp) WHERE mrp IS NOT NULL;

-- Index for faster class-based lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS product_class_idx ON "Product" USING btree (class) WHERE class IS NOT NULL;
