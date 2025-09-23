-- CreateTable
CREATE TABLE "Margin" (
    "id" SERIAL NOT NULL,
    "class" TEXT NOT NULL,
    "margin" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Margin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Margin_class_key" ON "Margin"("class");

-- CreateIndex
CREATE INDEX "Margin_class_idx" ON "Margin"("class");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "class" TEXT DEFAULT 'D';

-- CreateIndex
CREATE INDEX "Product_class_idx" ON "Product"("class");
