-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "awbCode" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shiprocketOrderId" INTEGER,
ADD COLUMN     "shiprocketShipmentId" INTEGER,
ADD COLUMN     "state" TEXT;
