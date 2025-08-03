-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;
