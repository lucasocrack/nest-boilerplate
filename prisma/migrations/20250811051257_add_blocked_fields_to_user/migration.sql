-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "blockedUntil" TIMESTAMP(3);
