# Stage 1: Dependencies
FROM node:22-alpine AS deps

WORKDIR /app

# Instalar dependências do sistema necessárias para Prisma
RUN apk add --no-cache libc6-compat openssl

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
    RUN npm ci && npm cache clean --force

# Stage 2: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat openssl

# Copiar dependências da stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY prisma ./prisma/

# Copiar código fonte
COPY . .

# Usar .env.docker para build se existir, senão usar .env.example
RUN if [ -f .env.docker ]; then cp .env.docker .env; else cp .env.example .env; fi

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
    RUN npx nest build

# Stage 3: Production
FROM node:22-alpine AS runner

WORKDIR /app

# Instalar dependências do sistema para runtime
RUN apk add --no-cache libc6-compat openssl dumb-init

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copiar arquivos necessários
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copiar .env.docker se existir
COPY --chown=nestjs:nodejs .env.docker ./.env

USER nestjs

EXPOSE 3099

ENV NODE_ENV=production
ENV PORT=3099

# Usar dumb-init para gerenciamento de processos
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão (pode ser sobrescrito pelo docker-compose)
CMD ["node", "dist/main"]
