-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "divida" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
