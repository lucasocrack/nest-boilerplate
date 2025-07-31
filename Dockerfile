# Stage 1: Build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copia .env no builder (opcional, só se precisar do generate)
COPY .env ./

# Gera Prisma Client (não precisa do banco)
RUN npx prisma generate

RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./
COPY --from=builder /app/generated ./generated

EXPOSE 3099

# Na hora que container subir, o Compose já garante que o db está rodando.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
