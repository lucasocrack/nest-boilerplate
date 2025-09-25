-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'ACCOUNT_BLOCKED', 'ACCOUNT_UNBLOCKED');

-- DropIndex
DROP INDEX "public"."users_userName_key";

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "userName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "auditId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "public"."AuditAction" NOT NULL,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "oldValues" JSONB,
    "newValues" JSONB,
    "changedFields" TEXT[],
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("auditId")
);

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "public"."audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "public"."audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
