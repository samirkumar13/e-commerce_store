-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isReturnable" BOOLEAN NOT NULL DEFAULT true;
