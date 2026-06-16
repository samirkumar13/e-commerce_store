-- Add role and permissions to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'CUSTOMER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "permissions" JSONB;

-- Promote existing admins to ADMIN role
UPDATE "User" SET "role" = 'ADMIN' WHERE "isAdmin" = true;
