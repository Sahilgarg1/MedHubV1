-- Migration: Add MRP field to Order model
-- This ensures orders store the actual MRP from the accepted bid for better data integrity

-- Add MRP field to Order table
ALTER TABLE "Order" ADD COLUMN "mrp" DECIMAL(10,2);

-- Update existing orders with MRP from their associated bids
UPDATE "Order" 
SET "mrp" = (
  SELECT b.mrp 
  FROM "Bid" b 
  WHERE b.id = "Order"."bidId"
)
WHERE "mrp" IS NULL;

-- Make MRP field NOT NULL after populating existing data
ALTER TABLE "Order" ALTER COLUMN "mrp" SET NOT NULL;
