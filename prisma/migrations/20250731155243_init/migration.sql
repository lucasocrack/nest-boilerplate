-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CLIENTE', 'ADMIN', 'GERENTE', 'FUNCIONARIO', 'FINANCEIRO');

-- CreateTable
CREATE TABLE "public"."User" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "avatarUrl" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'CLIENTE',
    "lastLogin" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "logId" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "route" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "userId" INTEGER,
    "details" JSONB,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("logId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "public"."User"("cpf");

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
