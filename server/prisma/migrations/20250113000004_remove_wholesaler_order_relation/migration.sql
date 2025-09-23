-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_wholesalerId_fkey";

-- Note: We keep the wholesalerId column for data integrity and querying purposes
-- but remove the foreign key constraint since wholesalers now access orders through buckets
