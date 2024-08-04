/*
  Warnings:

  - You are about to drop the column `categoryId` on the `posts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_categoryId_fkey";

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "categoryId";
