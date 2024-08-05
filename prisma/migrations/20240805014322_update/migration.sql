/*
  Warnings:

  - You are about to alter the column `place` on the `address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(140)`.
  - You are about to alter the column `number` on the `address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `neighborhood` on the `address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to alter the column `city` on the `address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to alter the column `state` on the `address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2)`.
  - You are about to alter the column `zipCode` on the `address` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `name` on the `categorypost` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `name` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(120)`.
  - You are about to alter the column `email` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to alter the column `mobile` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `phone1` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `phone2` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `place` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `number` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `neighborhood` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - You are about to alter the column `city` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(60)`.
  - You are about to alter the column `state` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2)`.
  - You are about to alter the column `zipCode` on the `config` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to drop the column `delinquent` on the `person` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - You are about to alter the column `fantasyName` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - You are about to alter the column `cpf` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(11)`.
  - You are about to alter the column `cnpj` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(14)`.
  - You are about to alter the column `ie` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(9)`.
  - You are about to alter the column `email` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.
  - You are about to alter the column `phone1` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.
  - You are about to alter the column `phone2` on the `person` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(12)`.
  - You are about to alter the column `title` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `linkAffiliate` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `tags` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `productCategory` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - You are about to alter the column `email` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - You are about to alter the column `cpf` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(11)`.
  - You are about to alter the column `password` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `complement` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryPost` to the `posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "address" ADD COLUMN     "complement" VARCHAR(50) NOT NULL,
ALTER COLUMN "place" SET DATA TYPE VARCHAR(140),
ALTER COLUMN "number" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "neighborhood" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "state" SET DATA TYPE VARCHAR(2),
ALTER COLUMN "zipCode" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "categorypost" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "config" ADD COLUMN     "complement" VARCHAR(50),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(120),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "mobile" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "phone1" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "phone2" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "place" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "number" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "neighborhood" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "city" SET DATA TYPE VARCHAR(60),
ALTER COLUMN "state" SET DATA TYPE VARCHAR(2),
ALTER COLUMN "zipCode" SET DATA TYPE VARCHAR(10);

-- AlterTable
ALTER TABLE "person" DROP COLUMN "delinquent",
ADD COLUMN     "defaulter" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "fantasyName" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "cnpj" SET DATA TYPE VARCHAR(14),
ALTER COLUMN "ie" SET DATA TYPE VARCHAR(9),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "phone1" SET DATA TYPE VARCHAR(12),
ALTER COLUMN "phone2" SET DATA TYPE VARCHAR(12);

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "categoryPost" INTEGER NOT NULL,
ADD COLUMN     "productTitle" VARCHAR(150),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "linkAffiliate" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "tags" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "productCategory" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "email" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "username" SET DATA TYPE VARCHAR,
ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_categoryPost_fkey" FOREIGN KEY ("categoryPost") REFERENCES "categorypost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
