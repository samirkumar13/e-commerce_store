-- Add wallet & referral fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletBalance" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referredBy" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_referralCode_key" ON "User"("referralCode");

-- Add points & wallet discount fields to Order
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pointsEarned" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pointsRedeemed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "walletDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Create WalletTransaction table
CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "type"        TEXT NOT NULL,
  "points"      INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "orderId"     TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
