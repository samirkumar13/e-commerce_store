-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- AlterTable CartItem: drop old unique, add variant columns
ALTER TABLE "CartItem" ADD COLUMN "variantId" TEXT;
ALTER TABLE "CartItem" ADD COLUMN "variantName" TEXT;

-- Drop the old unique constraint (name may differ; try both common names)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CartItem_cartId_productId_key'
  ) THEN
    ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_productId_key";
  END IF;
END $$;

-- AlterTable OrderItem: add variant columns
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "variantName" TEXT;

-- AddForeignKey ProductVariant -> Product
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey CartItem -> ProductVariant
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey OrderItem -> ProductVariant
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
