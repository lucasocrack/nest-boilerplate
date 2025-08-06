/*
  Warnings:

  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."logs" DROP CONSTRAINT "logs_userId_fkey";

-- AlterTable
ALTER TABLE "public"."logs" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "userId" DROP DEFAULT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "tokenVersion" SET DEFAULT 1,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("userId");
DROP SEQUENCE "users_userId_seq";

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
