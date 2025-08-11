-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "activationToken" TEXT,
ADD COLUMN     "activationTokenExpires" TIMESTAMP(3);
