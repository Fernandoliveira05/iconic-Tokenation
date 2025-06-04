# 1. Etapa de build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app/backend

# Instala dependências
COPY backend/package*.json ./
RUN npm install --legacy-peer-deps

# Copia o restante dos arquivos
COPY backend/ ./

# Gera o Prisma Client
RUN npx prisma generate

# Compila o projeto
RUN npm run build

# 2. Etapa de execução
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

# Copia os arquivos necessários da etapa de build
COPY --from=builder /usr/src/app/backend/dist ./dist
COPY --from=builder /usr/src/app/backend/node_modules ./node_modules
COPY --from=builder /usr/src/app/backend/package.json ./

# Expõe a porta da API
EXPOSE 3000

CMD ["node", "dist/main.js"]
