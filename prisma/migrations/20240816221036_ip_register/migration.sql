/*
  Warnings:

  - You are about to drop the column `activateIp` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "activateIp",
ADD COLUMN     "termsIp" VARCHAR(45);
