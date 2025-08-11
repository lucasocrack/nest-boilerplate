/*
  Warnings:

  - You are renaming the column `username` to `userName` on the `users` table.

*/
-- DropIndex
DROP INDEX "public"."users_username_key";

-- AlterTable - Rename column instead of drop/add
ALTER TABLE "public"."users" RENAME COLUMN "username" TO "userName";

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "public"."users"("userName");
