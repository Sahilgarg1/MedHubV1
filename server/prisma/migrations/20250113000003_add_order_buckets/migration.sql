-- CreateTable
CREATE TABLE "OrderBucket" (
    "id" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "wholesalerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_FULFILLMENT',
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "totalItems" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderBucket_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "bucketId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderBucket" ADD CONSTRAINT "OrderBucket_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBucket" ADD CONSTRAINT "OrderBucket_wholesalerId_fkey" FOREIGN KEY ("wholesalerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "OrderBucket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
